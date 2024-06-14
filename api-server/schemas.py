from typing import List, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class DisasterMessageBase(BaseModel):
    create_date: datetime
    location_id: str = Field(..., min_length=1, max_length=100)
    location_name: str = Field(..., min_length=1, max_length=255)
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