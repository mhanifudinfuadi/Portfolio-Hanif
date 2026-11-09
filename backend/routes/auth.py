from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta
from typing import Optional
import httpx
import uuid

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from models import User, UserSession, SessionData

router = APIRouter(prefix="/auth", tags=["auth"])


# Dependency to get database (will be set in server.py)
def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.db


async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """
    Authenticator helper - checks session_token from cookies first, 
    then Authorization header as fallback.
    """
    db = get_db(request)
    
    # Try cookie first
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry with timezone awareness
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Clean up expired session
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user data
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)


@router.post("/session")
async def create_session(request: Request, response: Response, data: dict):
    """
    Exchange session_id from Emergent Auth for user data and create session.
    Frontend calls this after OAuth redirect with session_id from URL fragment.
    """
    db = get_db(request)
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to exchange session_id for user data
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            auth_response.raise_for_status()
            session_data = SessionData(**auth_response.json())
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to exchange session_id: {str(e)}"
            )
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": session_data.email},
        {"_id": 0}
    )
    
    if existing_user:
        # Update user data if needed
        await db.users.update_one(
            {"email": session_data.email},
            {
                "$set": {
                    "name": session_data.name,
                    "picture": session_data.picture
                }
            }
        )
        user_id = existing_user["user_id"]
    else:
        # Create new user with custom user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    
    # Create session with 7-day expiry
    session_token = session_data.session_token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    new_session = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(new_session)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days in seconds
    )
    
    # Return user data
    user_doc = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    return User(**user_doc)


@router.get("/me")
async def get_current_user_endpoint(request: Request, session_token: Optional[str] = Cookie(None)):
    """
    Verify session and return current user data.
    Frontend calls this to check authentication status.
    """
    user = await get_current_user(request, session_token)
    return user


@router.post("/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """
    Logout user by deleting session and clearing cookie.
    """
    if not session_token:
        raise HTTPException(status_code=400, detail="No session to logout")
    
    db = get_db(request)
    
    # Delete session from database
    await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}
