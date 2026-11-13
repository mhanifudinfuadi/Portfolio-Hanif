from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel
from routes.auth import get_current_user, get_db
from storage import media_url, save_upload

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
ALLOWED_KINDS = {"documentation", "creative", "novel", "media"}


class ContentInput(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""
    body: Optional[str] = ""
    images: list[str] = []
    metadata: dict = {}
    published: bool = False
    music_url: Optional[str] = ""


@router.get("/content")
async def list_content(request: Request, kind: Optional[str] = None, published_only: bool = True):
    if not published_only:
        await get_current_user(request, request.cookies.get("session_token"))
    query = {"published": True} if published_only else {}
    if kind:
        query["kind"] = kind
    return await request.app.state.db.portfolio_content.find(query, {"_id": 0}).sort("updated_at", -1).to_list(2000)


@router.get("/content/{content_id}")
async def get_content(request: Request, content_id: str):
    doc = await request.app.state.db.portfolio_content.find_one({"content_id": content_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Konten tidak ditemukan")
    if not doc.get("published"):
        await get_current_user(request, request.cookies.get("session_token"))
    return doc


@router.post("/content")
async def create_content(request: Request, data: ContentInput, kind: str, user=Depends(get_current_user)):
    if kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail="Jenis konten tidak dikenal")
    doc = {**data.dict(), "kind": kind, "content_id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}
    await request.app.state.db.portfolio_content.insert_one(doc)
    return {key: value for key, value in doc.items() if key != "_id"}


@router.put("/content/{content_id}")
async def update_content(request: Request, content_id: str, data: ContentInput, user=Depends(get_current_user)):
    db = request.app.state.db.portfolio_content
    result = await db.update_one({"content_id": content_id}, {"$set": {**data.dict(), "updated_at": datetime.now(timezone.utc)}})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Konten tidak ditemukan")
    return await db.find_one({"content_id": content_id}, {"_id": 0})


@router.delete("/content/{content_id}")
async def delete_content(request: Request, content_id: str, user=Depends(get_current_user)):
    result = await request.app.state.db.portfolio_content.delete_one({"content_id": content_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Konten tidak ditemukan")
    return {"deleted": True}


@router.post("/upload")
async def upload_media(
    request: Request,
    files: list[UploadFile] = File(...),
    user=Depends(get_current_user),
):
    db = get_db(request)
    results = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Semua berkas harus berupa gambar")
        ext = Path(file.filename or "image.jpg").suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
            raise HTTPException(status_code=400, detail="Format gambar tidak didukung")
        filename = f"{uuid.uuid4().hex}{ext}"
        await save_upload(db, filename, await file.read())
        results.append({"url": media_url(filename), "name": file.filename})
    return results


@router.get("/settings")
async def get_settings(request: Request):
    doc = await request.app.state.db.portfolio_settings.find_one({"key": "main"}, {"_id": 0})
    return doc or {"key": "main", "hero_title": "Cerita visual dan tertulis.", "hero_subtitle": "Fotografi, dokumentasi, dan karya tulis.", "about_text": "", "contact_email": ""}


@router.put("/settings")
async def save_settings(request: Request, data: dict, user=Depends(get_current_user)):
    data.pop("_id", None)
    data["key"] = "main"
    data["updated_at"] = datetime.now(timezone.utc)
    await request.app.state.db.portfolio_settings.update_one({"key": "main"}, {"$set": data}, upsert=True)
    return data


@router.post("/inquiries")
async def create_inquiry(request: Request, data: dict):
    doc = {"inquiry_id": str(uuid.uuid4()), "name": str(data.get("name", ""))[:160], "email": str(data.get("email", ""))[:254], "message": str(data.get("message", ""))[:10000], "created_at": datetime.now(timezone.utc), "read": False}
    if not doc["name"] or not doc["email"] or not doc["message"]:
        raise HTTPException(status_code=400, detail="Nama, email, dan pesan wajib diisi")
    await request.app.state.db.portfolio_inquiries.insert_one(doc)
    return {"received": True}


@router.get("/inquiries")
async def list_inquiries(request: Request, user=Depends(get_current_user)):
    return await request.app.state.db.portfolio_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
