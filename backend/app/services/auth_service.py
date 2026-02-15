from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.crud.user import UserCRUD
from datetime import timedelta


class AuthService:
    """Authentication business logic."""
    
    @staticmethod
    def register_user(
        db: Session,
        username: str,
        email: str,
        password: str,
        confirm_password: str,
        full_name: str | None = None
    ) -> tuple[User, str, str]:
        """Register a new user.
        
        Returns:
            Tuple of (user, access_token, refresh_token)
        """
        # Validate password match
        if password != confirm_password:
            raise ValueError("Passwords do not match")
        
        # Check if user already exists
        existing_user = UserCRUD.get_user_by_email(db, email)
        if existing_user:
            raise ValueError("Email already registered")
        
        existing_username = UserCRUD.get_user_by_username(db, username)
        if existing_username:
            raise ValueError("Username already taken")
        
        # Create user
        user = UserCRUD.create_user(
            db=db,
            username=username,
            email=email,
            password=password,
            full_name=full_name
        )
        
        # Generate tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        return user, access_token, refresh_token
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> tuple[User, str, str] | None:
        """Authenticate user and return tokens.
        
        Returns:
            Tuple of (user, access_token, refresh_token) or None if auth fails
        """
        user = UserCRUD.get_user_by_email(db, email)
        
        if not user or not user.is_active:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Generate tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        return user, access_token, refresh_token
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> str | None:
        """Refresh access token using refresh token.
        
        Returns:
            New access token or None if refresh token is invalid
        """
        payload = decode_token(refresh_token)
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        # Create new access token
        access_token = create_access_token({"sub": user_id})
        return access_token
    
    @staticmethod
    def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str
    ) -> bool:
        """Change user password.
        
        Returns:
            True if successful, raises ValueError if current password is wrong
        """
        if not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")
        
        UserCRUD.change_password(db, user, new_password)
        return True
