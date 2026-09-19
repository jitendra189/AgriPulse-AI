import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt

from app.auth import get_current_user
from app.database import get_db
from app.models import User


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# -------------------------------------------------------------------
# JWT Configuration
# -------------------------------------------------------------------

# Development-only secret.
# This MUST be moved to an environment variable before production.
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not configured."
    )

ALGORITHM = os.getenv("ALGORITHM", "HS256")



ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -------------------------------------------------------------------
# Request / Response Schemas
# -------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class RegisterResponse(BaseModel):
    message: str
    user_id: int
    email: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
    )


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user_id: int
    email: str
    name: str


class ProfileUpdateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    village: str | None = Field(
        default=None,
        max_length=150,
    )

    state: str | None = Field(
        default=None,
        max_length=100,
    )

    district: str | None = Field(
        default=None,
        max_length=100,
    )

    farm_size: float | None = Field(
        default=None,
        gt=0,
        le=100000,
    )

    irrigation: str | None = Field(
        default=None,
        max_length=50,
    )

    soil_type: str | None = Field(
        default=None,
        max_length=100,
    )

    season: str | None = Field(
        default=None,
        max_length=50,
    )

    primary_crop: str | None = Field(
        default=None,
        max_length=100,
    )

    forecast_horizon: str = Field(
        default="1 Month",
        max_length=30,
    )


class ProfileResponse(BaseModel):
    id: int

    name: str

    email: str

    phone: str | None

    village: str | None

    state: str | None

    district: str | None

    farm_size: float | None

    irrigation: str | None

    soil_type: str | None

    season: str | None

    primary_crop: str | None

    forecast_horizon: str


# -------------------------------------------------------------------
# Password Hashing
# -------------------------------------------------------------------

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    bcrypt supports a maximum of 72 UTF-8 bytes.
    We explicitly validate this instead of silently truncating
    the password.
    """

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Password is too long for bcrypt. "
                "Please use a password of 72 UTF-8 bytes or fewer."
            ),
        )

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    )

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its bcrypt hash.
    """

    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )

    except (ValueError, TypeError):
        return False


# -------------------------------------------------------------------
# JWT
# -------------------------------------------------------------------

def create_access_token(user_id: int) -> str:
    """
    Create a JWT access token containing the user's ID.
    """

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# -------------------------------------------------------------------
# Register
# -------------------------------------------------------------------

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.lower().strip()

    # Check whether the account already exists.
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Hash password before storing it.
    password_hash = hash_password(
        payload.password
    )

    # Create user.
    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=password_hash,
        is_active=True,
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return RegisterResponse(
        message="Account created successfully.",
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


# -------------------------------------------------------------------
# Login
# -------------------------------------------------------------------

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.lower().strip()

    # Find user.
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # Do not reveal whether an email exists.
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Check whether account is active.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    # Verify password.
    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Create JWT.
    access_token = create_access_token(
        user.id
    )

    return LoginResponse(
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


# -------------------------------------------------------------------
# Get Current User
# -------------------------------------------------------------------

@router.get(
    "/me",
    response_model=ProfileResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user


# -------------------------------------------------------------------
# Update Current User Profile
# -------------------------------------------------------------------

@router.put(
    "/me",
    response_model=ProfileResponse,
)
def update_me(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    # Personal information
    current_user.name = payload.name.strip()

    current_user.phone = (
        payload.phone.strip()
        if payload.phone
        else None
    )

    current_user.village = (
        payload.village.strip()
        if payload.village
        else None
    )

    # Location
    current_user.state = payload.state
    current_user.district = payload.district

    # Farm information
    current_user.farm_size = payload.farm_size

    current_user.irrigation = payload.irrigation

    current_user.soil_type = payload.soil_type

    current_user.season = payload.season

    # Forecast preferences
    current_user.primary_crop = payload.primary_crop

    current_user.forecast_horizon = (
        payload.forecast_horizon
    )

    # Save changes.
    db.commit()

    # Refresh object from database.
    db.refresh(current_user)

    return current_user