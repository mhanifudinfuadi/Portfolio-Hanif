from datetime import datetime, timezone, timedelta
from typing import Optional
import base64
import hashlib
import hmac
import os
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr, Field, field_validator
from pymongo import ReturnDocument
from starlette.concurrency import run_in_threadpool

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from models import User

router = APIRouter(prefix="/auth", tags=["auth"])
SESSION_DAYS = 7
LOGIN_WINDOW_MINUTES = 15
MAX_LOGIN_ATTEMPTS = 5


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_format(cls, value: str) -> str:
        if not value.isascii() or not value.isalnum() or not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("Kata sandi harus memakai huruf dan angka saja")
        return value


def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.db


def _admin_email() -> str:
    return os.getenv("ADMIN_EMAIL", "").strip().lower()


def _verify_password(password: str, encoded_hash: str) -> bool:
    try:
        scheme, rounds, salt, expected = encoded_hash.split("$", 3)
        iterations = int(rounds)
        if scheme != "pbkdf2_sha256" or not 300_000 <= iterations <= 2_000_000:
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations
        )
        return hmac.compare_digest(
            base64.urlsafe_b64encode(actual).decode("ascii").rstrip("="), expected
        )
    except (ValueError, TypeError):
        return False


def _login_key(email: str, client_host: str) -> str:
    raw = f"{email.strip().lower()}:{client_host or 'unknown'}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _session_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def _check_login_limit(db, key: str, now: datetime) -> None:
    record = await db.auth_login_attempts.find_one({"key": key}, {"_id": 0})
    locked_until = record.get("locked_until") if record else None
    if locked_until and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    if locked_until and locked_until > now:
        raise HTTPException(status_code=429, detail="Terlalu banyak percobaan. Coba lagi 15 menit.")
    attempts = record.get("attempts", []) if record else []
    cutoff = now - timedelta(minutes=LOGIN_WINDOW_MINUTES)
    recent_attempts = [
        attempt.replace(tzinfo=timezone.utc) if attempt.tzinfo is None else attempt
        for attempt in attempts
        if (attempt.replace(tzinfo=timezone.utc) if attempt.tzinfo is None else attempt) > cutoff
    ]
    if locked_until or len(recent_attempts) != len(attempts):
        await db.auth_login_attempts.update_one(
            {"key": key}, {"$set": {"attempts": recent_attempts, "locked_until": None}}
        )
    if len(recent_attempts) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Terlalu banyak percobaan. Coba lagi 15 menit.")


async def _record_login_failure(db, key: str, now: datetime) -> None:
    record = await db.auth_login_attempts.find_one_and_update(
        {"key": key},
        {
            "$push": {"attempts": {"$each": [now], "$slice": -MAX_LOGIN_ATTEMPTS}},
            "$set": {"expires_at": now + timedelta(hours=1)},
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    if len(record.get("attempts", [])) >= MAX_LOGIN_ATTEMPTS:
        await db.auth_login_attempts.update_one(
            {"key": key},
            {"$set": {"locked_until": now + timedelta(minutes=LOGIN_WINDOW_MINUTES)}},
        )


def _set_session_cookie(request: Request, response: Response, token: str) -> None:
    is_https = os.getenv("COOKIE_SECURE", str(request.url.scheme == "https")).lower() == "true"
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=is_https,
        samesite="none" if is_https else "lax",
        path="/",
        max_age=SESSION_DAYS * 24 * 60 * 60,
    )


async def get_current_user(
    request: Request, session_token: Optional[str] = Cookie(None)
) -> User:
    db = get_db(request)
    if session_token and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("Origin", "")
        allowed_origins = {
            value.strip().rstrip("/")
            for value in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
            if value.strip()
        }
        if origin.rstrip("/") not in allowed_origins:
            raise HTTPException(status_code=403, detail="Request origin is not allowed")
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one(
        {"session_token_hash": _session_digest(token)}, {"_id": 0}
    )
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    configured_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    current_credential_version = hashlib.sha256(configured_hash.encode("utf-8")).hexdigest()
    if not hmac.compare_digest(
        session_doc.get("credential_version", ""), current_credential_version
    ):
        await db.user_sessions.delete_one({"session_token_hash": _session_digest(token)})
        raise HTTPException(status_code=401, detail="Credentials changed; please sign in again")
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token_hash": _session_digest(token)})
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    user = User(**user_doc)
    admin_email = _admin_email()
    if not admin_email or user.email.strip().lower() != admin_email:
        raise HTTPException(status_code=403, detail="Admin access is not configured for this account")
    return user


@router.post("/login")
async def login(request: Request, response: Response, data: AdminLogin):
    admin_email = _admin_email()
    password_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    if not admin_email or not password_hash:
        raise HTTPException(status_code=503, detail="Admin credentials are not configured")

    db = get_db(request)
    now = datetime.now(timezone.utc)
    key = _login_key(data.email, request.client.host if request.client else "unknown")
    await _check_login_limit(db, key, now)

    email_matches = hmac.compare_digest(data.email.strip().lower(), admin_email)
    password_matches = await run_in_threadpool(_verify_password, data.password, password_hash)
    if not (email_matches and password_matches):
        await _record_login_failure(db, key, now)
        raise HTTPException(status_code=401, detail="Email atau kata sandi tidak sesuai")

    await db.auth_login_attempts.delete_one({"key": key})
    user_doc = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if not user_doc:
        user_doc = {
            "user_id": f"admin_{secrets.token_hex(8)}",
            "email": admin_email,
            "name": os.getenv("ADMIN_NAME", "Admin"),
            "picture": None,
            "created_at": now,
        }
        await db.users.insert_one(user_doc.copy())

    token = secrets.token_urlsafe(32)
    expires_at = now + timedelta(days=SESSION_DAYS)
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token_hash": _session_digest(token),
        "credential_version": hashlib.sha256(password_hash.encode("utf-8")).hexdigest(),
        "expires_at": expires_at,
        "created_at": now,
    })
    _set_session_cookie(request, response, token)
    return User(**{key: value for key, value in user_doc.items() if key != "_id"})


@router.get("/me")
async def get_current_user_endpoint(
    request: Request, session_token: Optional[str] = Cookie(None)
):
    return await get_current_user(request, session_token)


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(None),
):
    if session_token:
        await get_db(request).user_sessions.delete_one(
            {"session_token_hash": _session_digest(session_token)}
        )
    is_https = os.getenv("COOKIE_SECURE", str(request.url.scheme == "https")).lower() == "true"
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=is_https,
        httponly=True,
        samesite="none" if is_https else "lax",
    )
    return {"message": "Logged out successfully"}
