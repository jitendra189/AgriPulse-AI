from sqlalchemy import Boolean, Column, Integer, String, Float
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Authentication
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Personal information
    name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    village = Column(String(150), nullable=True)

    # Location
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)

    # Farm information
    farm_size = Column(Float, nullable=True)
    irrigation = Column(String(50), nullable=True)
    soil_type = Column(String(100), nullable=True)
    season = Column(String(50), nullable=True)

    # Forecast preferences
    primary_crop = Column(String(100), nullable=True)
    forecast_horizon = Column(String(30), default="1 Month")