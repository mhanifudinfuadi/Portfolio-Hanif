from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# CRITICAL: Load environment variables FIRST before importing routes
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Now import routes (they can safely read env vars at module level)
from routes.auth import router as auth_router
from routes.ai import router as ai_router
from routes.articles import router as articles_router
from routes.portfolio import router as portfolio_router

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', '').strip()
client = AsyncIOMotorClient(mongo_url) if mongo_url else None
db = client[os.environ.get('DB_NAME', 'portfolio')] if client else None

# Create the main app
app = FastAPI()

# Store db in app state for route access
app.state.db = db
db_ready = db is not None

# Static file serving for uploaded assets (images).
# On Vercel the filesystem is read-only, so uploads live in MongoDB and are
# streamed through the /uploads and /api/media routes below.
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response

import storage

UPLOAD_DIR = Path(__file__).parent / "uploads"
if not storage.use_db_storage():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/uploads/{filename}")
@app.get("/api/media/{filename}")
async def serve_upload(filename: str):
    data, content_type = await storage.load_upload(app.state.db, filename)
    if data is None:
        raise HTTPException(status_code=404, detail="Media tidak ditemukan")
    return Response(content=data, media_type=content_type)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include routers in api_router FIRST
api_router.include_router(auth_router)
api_router.include_router(ai_router)
api_router.include_router(articles_router)
api_router.include_router(portfolio_router)

# Then include the api_router in the main app
app.include_router(api_router)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def database_guard(request: Request, call_next):
    if not db_ready and request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=503,
            content={"detail": "Database belum dikonfigurasi (MONGO_URL belum diset)"},
        )
    return await call_next(request)


@app.on_event("startup")
async def ensure_security_indexes():
    if not db_ready:
        logger.warning("MONGO_URL belum diset; endpoint database akan menjawab 503")
        return
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.auth_login_attempts.create_index("expires_at", expireAfterSeconds=0)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()
    client.close()
