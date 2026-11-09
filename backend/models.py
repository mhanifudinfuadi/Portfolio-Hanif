from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class User(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    created_at: Optional[datetime] = None


class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: Optional[datetime] = None


class SessionData(BaseModel):
    session_token: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None