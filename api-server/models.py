from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class DisasterMessage(Base):
    __tablename__ = "disaster_messages"

    id = Column(Integer, primary_key=True, index=True)
    create_date = Column(DateTime, index=True)
    location_id = Column(String(100), index=True)
    location_name = Column(String(255))
    md101_sn = Column(String(50), unique=True, index=True)
    msg = Column(String(1000))
    send_platform = Column(String(50))

class Token(Base):
    __tablename__ = 'tokens'
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, nullable=False)
    create_date = Column(DateTime, default=datetime.utcnow)
    update_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    locations = relationship("Location", back_populates="token", cascade="all, delete-orphan")

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True, index=True)
    token_value = Column(String(255), ForeignKey('tokens.token'), nullable=False)
    location = Column(String(255), nullable=False)
    token = relationship("Token", back_populates="locations")