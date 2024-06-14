from sqlalchemy import Column, Integer, String, DateTime
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