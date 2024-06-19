from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
class DisasterMessageBase(BaseModel):
    create_date: datetime
    location_id: str = Field(..., min_length=1, max_length=5000)
    location_name: str = Field(..., min_length=1, max_length=10000)
    md101_sn: str = Field(..., min_length=1, max_length=50)
    msg: str = Field(..., min_length=1)
    send_platform: str = Field(..., min_length=1, max_length=50)

class DisasterMessageCreate(DisasterMessageBase):
    pass

class DisasterMessage(DisasterMessageBase):
    id: int

    class Config:
        orm_mode = True

class PaginatedDisasterMessages(BaseModel):
    totalPages: int
    totalElements: int
    currentPage: int
    isNext: bool
    isPrev: bool
    elementsPerPage: int
    messageList: List[DisasterMessage]

class TokenBase(BaseModel):
    token: str = Field(..., min_length=1, max_length=255)
    create_date: Optional[datetime] = None
    update_date: Optional[datetime] = None

class TokenCreate(TokenBase):
    token: str = Field(..., min_length=1, max_length=255)

class Token(TokenBase):
    token: str
    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    token_value: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        orm_mode = True