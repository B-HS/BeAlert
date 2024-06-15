from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud, utils
from database import SessionLocal, engine
import scheduler 

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/disaster_messages/", response_model=schemas.PaginatedDisasterMessages)
def read_disaster_messages(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    total_elements = crud.get_disaster_messages_count(db)
    messages = crud.get_disaster_messages(db, skip=skip, limit=limit)
    total_pages = (total_elements + limit - 1) // limit
    current_page = (skip // limit) + 1
    is_next = current_page < total_pages
    is_prev = current_page > 1

    return {
        "totalPages": total_pages,
        "totalElements": total_elements,
        "currentPage": current_page,
        "isNext": is_next,
        "isPrev": is_prev,
        "elementsPerPage": limit,
        "messageList": messages
    }
