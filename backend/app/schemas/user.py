import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    username: str = Field(min_length=5, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    def validate_username(cls, username: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", username):
            raise ValueError(
                "Username can only contain letters, numbers, and underscores"
            )
        return username

    @field_validator("password")
    def validate_password_byte_length(cls, password: str) -> str:
        # bcrypt rejects passwords longer than 72 bytes (not characters)
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 bytes")
        return password


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID

    username: str

    email: EmailStr

    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
