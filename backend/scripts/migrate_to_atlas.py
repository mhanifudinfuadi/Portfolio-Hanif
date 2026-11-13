"""Copy the local MongoDB database and uploaded files into MongoDB Atlas.

Usage:
    python scripts/migrate_to_atlas.py --target "mongodb+srv://.../"

The target connection string can also come from the TARGET_MONGO_URL variable.
"""

import argparse
import asyncio
import mimetypes
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

SKIP_COLLECTIONS = {"media"}


async def copy_collections(source, target):
    for name in await source.list_collection_names():
        if name in SKIP_COLLECTIONS:
            continue
        docs = await source[name].find({}).to_list(None)
        for doc in docs:
            doc.pop("_id", None)
        if docs:
            await target[name].insert_many(docs)
        print(f"  {name}: {len(docs)} dokumen")


async def copy_uploads(source_db, target_db, uploads_dir: Path):
    files = sorted(p for p in uploads_dir.iterdir() if p.is_file())
    total_bytes = 0
    for path in files:
        data = path.read_bytes()
        total_bytes += len(data)
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        await target_db.media.update_one(
            {"filename": path.name},
            {
                "$set": {
                    "filename": path.name,
                    "data": data,
                    "content_type": content_type,
                }
            },
            upsert=True,
        )
    print(f"  media: {len(files)} berkas ({total_bytes / 1_000_000:.1f} MB)")


async def rewrite_paths(db):
    moved = 0
    async for doc in db.portfolio_content.find({"images": {"$exists": True}}):
        images = doc.get("images") or []
        changed = [
            f"/api/media/{image.rsplit('/', 1)[-1]}" if image.startswith("/uploads/") else image
            for image in images
        ]
        if changed != images:
            await db.portfolio_content.update_one(
                {"_id": doc["_id"]}, {"$set": {"images": changed}}
            )
            moved += 1
    async for doc in db.articles.find({"image_url": {"$regex": "^/uploads/"}}):
        filename = doc["image_url"].rsplit("/", 1)[-1]
        await db.articles.update_one(
            {"_id": doc["_id"]}, {"$set": {"image_url": f"/api/media/{filename}"}}
        )
        moved += 1
    print(f"  path /uploads/ -> /api/media/: {moved} dokumen diperbarui")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default=os.getenv("TARGET_MONGO_URL", ""))
    parser.add_argument("--source", default=os.getenv("MONGO_URL", ""))
    parser.add_argument("--db-name", default=os.getenv("DB_NAME", "portfolio"))
    parser.add_argument("--uploads", default=str(ROOT / "uploads"))
    parser.add_argument("--skip-files", action="store_true")
    args = parser.parse_args()

    if not args.target:
        parser.error("target MongoDB URI wajib diisi (--target atau TARGET_MONGO_URL)")
    if not args.source:
        parser.error("source MongoDB URI wajib diisi (--source atau MONGO_URL)")

    source_client = AsyncIOMotorClient(args.source)
    target_client = AsyncIOMotorClient(args.target)
    source = source_client[args.db_name]
    target = target_client[args.db_name]

    print(f"Menyalin database '{args.db_name}' ...")
    await copy_collections(source, target)

    if not args.skip_files:
        print("Menyalin berkas upload ...")
        await copy_uploads(source, target, Path(args.uploads))

    print("Menyesuaikan path media ...")
    await rewrite_paths(target)

    source_client.close()
    target_client.close()
    print("Selesai.")


if __name__ == "__main__":
    asyncio.run(main())