from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from app.core.constants import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=20)


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=8, max_length=255)


class UserUpdate(BaseModel):
    """User update schema."""
    full_name: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=20)


class UserResponse(UserBase):
    """User response schema."""
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefresh(BaseModel):
    """Token refresh request schema."""
    refresh_token: str


class PasswordChange(BaseModel):
    """Password change schema."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
