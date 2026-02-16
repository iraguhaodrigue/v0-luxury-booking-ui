from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db_session
from app.schemas.user import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    TokenRefresh, PasswordChange
)
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db_session)
):
    """Register a new user."""
    try:
        user, access_token, refresh_token = AuthService.register_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            confirm_password=user_data.password,
            full_name=user_data.full_name
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.from_orm(user)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db_session)
):
    """Login user and return tokens."""
    result = AuthService.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password
    )
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user, access_token, refresh_token = result
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(refresh_data: TokenRefresh):
    """Refresh access token."""
    access_token = AuthService.refresh_access_token(refresh_data.refresh_token)
    
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse.from_orm(current_user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Change current user password."""
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    try:
        AuthService.change_password(
            db=db,
            user=current_user,
            current_password=password_data.current_password,
            new_password=password_data.new_password
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
