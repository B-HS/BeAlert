from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import SessionLocal, engine
import scheduler 
import firebase_admin
from firebase_admin import credentials, messaging
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "https://alert.hyns.dev"
]

cred_path = "firebase.json"
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/addtoken/", response_model=schemas.Token)
def add_token(token: schemas.TokenCreate, db: Session = Depends(get_db)):
    db_token = crud.create_token(db, token)
    if not db_token:
        raise HTTPException(status_code=400, detail="Token already exists or could not be created.")
    return db_token

@app.delete("/deletetoken/{token}")
def delete_token(token: str, db: Session = Depends(get_db)):
    result = crud.delete_token(db, token)
    if result.get("message") != "Token deleted successfully":
        raise HTTPException(status_code=404, detail="Token not found or could not be deleted.")
    return result


@app.post("/addlocation/", response_model=schemas.Location)
def add_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):

    targettoken = location.dict().get("token_value")
    targetlocation = location.dict().get("location")

    try:
        response = messaging.subscribe_to_topic(targettoken, targetlocation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to subscribe to topic: {e}")


    db_location = crud.create_location(db, location)
    if not db_location:
        raise HTTPException(status_code=400, detail="Location could not be created.")
    return db_location


@app.get("/locations/by_token/{token}", response_model=List[schemas.Location])
def read_locations_by_token(token: str, db: Session = Depends(get_db)):
    locations = crud.get_locations_by_token(db, token)
    if not locations:
        raise HTTPException(status_code=404, detail="No locations found for this token.")
    return locations

@app.delete("/deletelocation/{token}/{location}")
def delete_location_by_token_and_location(token: str, location: str, db: Session = Depends(get_db)):
    result = crud.delete_location_by_token_and_location(db, token, location)
    if result.get("message") != "Location deleted successfully":
        raise HTTPException(status_code=404, detail="Location not found or could not be deleted.")
    return result

## UNUSED ENDPOINTS

# @app.post("/adddisastermessage/", response_model=schemas.DisasterMessage)
# def add_disaster_message(message: schemas.DisasterMessageCreate, db: Session = Depends(get_db)):
#     db_message = crud.create_disaster_message(db, message)
#     return db_message

# @app.get("/sendmsg")
# def sendmsg(msg: str, location_id: str):
#     message = messaging.Message(
#         notification=messaging.Notification(
#             title=msg,
#             body=msg
#         ),
#         topic=location_id 
#     )
#     try:
#         response = messaging.send(message)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to send message: {e}")
#     return {"message": "Message sent successfully", "response": response}

# @app.get("/locations/", response_model=List[schemas.Location])
# def read_locations(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
#     return crud.get_locations(db, skip=skip, limit=limit)