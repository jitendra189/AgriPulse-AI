from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
    get_current_user,
)
from app.database import get_db
from app.models import User


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class RegisterResponse(BaseModel):
    message: str
    user_id: int
    email: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user_id: int
    email: str
    name: str


class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=30)
    village: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    farm_size: float | None = Field(default=None, gt=0, le=100000)
    irrigation: str | None = Field(default=None, max_length=50)
    soil_type: str | None = Field(default=None, max_length=100)
    season: str | None = Field(default=None, max_length=50)
    primary_crop: str | None = Field(default=None, max_length=100)
    forecast_horizon: str = Field(default="1 Month", max_length=30)


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


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Password is too long for bcrypt. "
                "Please use a password of 72 UTF-8 bytes or fewer."
            ),
        )

    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
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

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
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


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user or not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    return LoginResponse(
        message="Login successful.",
        access_token=create_access_token(user.id),
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


@router.get(
    "/me",
    response_model=ProfileResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put(
    "/me",
    response_model=ProfileResponse,
)
def update_me(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.name = payload.name.strip()
    current_user.phone = payload.phone.strip() if payload.phone else None
    current_user.village = payload.village.strip() if payload.village else None
    current_user.state = payload.state
    current_user.district = payload.district
    current_user.farm_size = payload.farm_size
    current_user.irrigation = payload.irrigation
    current_user.soil_type = payload.soil_type
    current_user.season = payload.season
    current_user.primary_crop = payload.primary_crop
    current_user.forecast_horizon = payload.forecast_horizon

    db.commit()
    db.refresh(current_user)

    return current_user
