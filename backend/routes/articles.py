from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os
import shutil
from pathlib import Path
from routes.auth import get_current_user

router = APIRouter(prefix="/articles", tags=["articles"])

# Upload directory (relative to this file -> backend/uploads)
BASE_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.db


class ArticleOut(BaseModel):
    article_id: str
    title: str
    slug: str
    excerpt: Optional[str] = ""
    body: Optional[str] = ""
    category: Optional[str] = "Catatan"
    image_url: Optional[str] = ""
    published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ArticleCreate(BaseModel):
    title: str
    excerpt: Optional[str] = ""
    body: Optional[str] = ""
    category: Optional[str] = "Catatan"
    image_url: Optional[str] = ""
    published: bool = True


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    published: Optional[bool] = None


def make_slug(title: str) -> str:
    slug = title.lower().strip()
    slug = slug.replace(" ", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    return slug or str(uuid.uuid4())[:8]


@router.post("/upload-image")
async def upload_article_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    """Upload an article cover image. Returns the public URL path."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = Path(file.filename or "image.jpg").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    return {"image_url": f"/uploads/{filename}"}


@router.post("/", response_model=ArticleOut)
async def create_article(request: Request, data: ArticleCreate, user=Depends(get_current_user)):
    db = get_db(request)
    now = datetime.now(timezone.utc)
    article_id = str(uuid.uuid4())
    doc = {
        "article_id": article_id,
        "title": data.title,
        "slug": make_slug(data.title),
        "excerpt": data.excerpt or "",
        "body": data.body or "",
        "category": data.category or "Catatan",
        "image_url": data.image_url or "",
        "published": data.published,
        "created_at": now,
        "updated_at": now,
    }
    await db.articles.insert_one(doc)
    return ArticleOut(**{k: v for k, v in doc.items() if k != "_id"})


@router.get("/", response_model=List[ArticleOut])
async def list_articles(request: Request, published_only: bool = True):
    db = get_db(request)
    if not published_only:
        await get_current_user(request, request.cookies.get("session_token"))
    query = {"published": True} if published_only else {}
    docs = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ArticleOut(**d) for d in docs]


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(request: Request, article_id: str, user=Depends(get_current_user)):
    db = get_db(request)
    doc = await db.articles.find_one({"article_id": article_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleOut(**doc)


@router.put("/{article_id}", response_model=ArticleOut)
async def update_article(request: Request, article_id: str, data: ArticleUpdate, user=Depends(get_current_user)):
    db = get_db(request)
    existing = await db.articles.find_one({"article_id": article_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")

    update = {k: v for k, v in data.dict().items() if v is not None}
    if "title" in update:
        update["slug"] = make_slug(update["title"])
    update["updated_at"] = datetime.now(timezone.utc)

    await db.articles.update_one({"article_id": article_id}, {"$set": update})
    doc = await db.articles.find_one({"article_id": article_id}, {"_id": 0})
    return ArticleOut(**doc)


@router.delete("/{article_id}")
async def delete_article(request: Request, article_id: str, user=Depends(get_current_user)):
    db = get_db(request)
    result = await db.articles.delete_one({"article_id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted", "article_id": article_id}
