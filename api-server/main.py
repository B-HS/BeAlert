from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud, utils
from database import SessionLocal, engine


ROOTPATH = "/disaster_messages/"
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post(ROOTPATH, response_model=schemas.DisasterMessage)
def create_disaster_message(disaster_message: schemas.DisasterMessageCreate, db: Session = Depends(get_db)):
    return crud.create_disaster_message(db=db, disaster_message=disaster_message)

@app.get(ROOTPATH + "{message_id}", response_model=schemas.DisasterMessage)
def read_disaster_message(message_id: int, db: Session = Depends(get_db)):
    db_disaster_message = crud.get_disaster_message(db, message_id=message_id)
    if db_disaster_message is None:
        raise HTTPException(status_code=404, detail="Disaster message not found")
    return db_disaster_message

@app.get(ROOTPATH, response_model=schemas.PaginatedDisasterMessages)
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

@app.post("/load_disaster_messages/")
def load_disaster_messages(db: Session = Depends(get_db)):
    try:
        disaster_messages_json = utils.fetch_disaster_messages()
        disaster_messages = [schemas.DisasterMessageCreate(**msg) for msg in disaster_messages_json]
        crud.load_disaster_messages_from_gov(db, disaster_messages)
        return {"message": "Disaster messages loaded successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))