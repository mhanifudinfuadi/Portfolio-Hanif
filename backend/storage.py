import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path

UPLOAD_DIR = Path(__file__).parent / "uploads"


def use_db_storage() -> bool:
    """True when running on Vercel, where the filesystem is read-only except /tmp."""
    return os.getenv("USE_DB_STORAGE", "0").strip().lower() in {"1", "true", "yes"}


def media_url(filename: str) -> str:
    """Public URL for a stored upload."""
    if use_db_storage():
        return f"/api/media/{filename}"
    return f"/uploads/{filename}"


async def save_upload(db, filename: str, data: bytes) -> None:
    if use_db_storage():
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        await db.media.update_one(
            {"filename": filename},
            {
                "$set": {
                    "filename": filename,
                    "data": data,
                    "content_type": content_type,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )
        return

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / filename).write_bytes(data)


async def load_upload(db, filename: str):
    if use_db_storage():
        doc = await db.media.find_one({"filename": filename}, {"data": 1, "content_type": 1})
        if not doc or not doc.get("data"):
            return None, None
        return doc["data"], doc.get("content_type") or "application/octet-stream"

    path = UPLOAD_DIR / filename
    if not path.is_file():
        return None, None
    content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return path.read_bytes(), content_type