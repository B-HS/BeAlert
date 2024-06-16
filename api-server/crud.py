from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
import models, schemas
from firebase_admin import messaging

def send_firebase_message(location_id: str, msg: str):
    message = messaging.Message(
        notification=messaging.Notification(
            title=location_id,
            body=msg
        ),
        topic=location_id
    )
    try:
        response = messaging.send(message)
        print(f"Message sent to topic {location_id}: {response}")
    except Exception as e:
        print(f"Failed to send message to topic {location_id}: {e}")

def unsubscribe_token_from_locations(token: str, locations: list):
    try:
        response = messaging.unsubscribe_from_topic([token], locations)
        return response
    except Exception as e:
        print(f"Failed to unsubscribe token {token} from topics {locations}: {e}")
        return None


def get_disaster_message(db: Session, message_id: int):
    return db.query(models.DisasterMessage).filter(models.DisasterMessage.id == message_id).first()

def get_disaster_messages(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.DisasterMessage).order_by(desc(models.DisasterMessage.create_date)).offset(skip).limit(limit).all()

def get_disaster_messages_count(db: Session):
    return db.query(models.DisasterMessage).count()

def create_disaster_message(db: Session, disaster_message: schemas.DisasterMessageCreate):
    db_disaster_message = models.DisasterMessage(**disaster_message.dict())
    db.add(db_disaster_message)
    db.commit()
    db.refresh(db_disaster_message)
    
    location_ids = disaster_message.dict().get('location_id').split(',')
    for location_id in location_ids:
        send_firebase_message(location_id.strip(), disaster_message.dict().get('msg'))
    
    return db_disaster_message

def load_disaster_messages_from_gov(db: Session, disaster_messages: list[schemas.DisasterMessageCreate]):
    new_messages = []
    for message in disaster_messages:
        existing_message = db.query(models.DisasterMessage).filter(models.DisasterMessage.md101_sn == message.md101_sn).first()
        if existing_message is None:
            try:
                db_disaster_message = models.DisasterMessage(**message.dict())
                db.add(db_disaster_message)
                db.commit()
                new_messages.append(db_disaster_message)
            except IntegrityError:
                db.rollback()
                print(f"Duplicate entry found for md101_sn: {message.md101_sn}, skipping...")

    for new_message in new_messages:
        send_firebase_message(new_message.location_id, new_message.msg)

def get_token(db: Session, token_id: int):
    return db.query(models.Token).filter(models.Token.id == token_id).first()

def get_tokens(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Token).order_by(desc(models.Token.create_date)).offset(skip).limit(limit).all()

def get_tokens_count(db: Session):
    return db.query(models.Token).count()

def create_token(db: Session, token: schemas.TokenCreate):
    existing_token = db.query(models.Token).filter(models.Token.token == token.token).first()
    if existing_token:
        return existing_token

    db_token = models.Token(**token.dict())
    try:
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        
    except IntegrityError as e:
        db.rollback()
        print(f"IntegrityError: {e}")
        return None
    return db_token   

def delete_token(db: Session, token: str):
    try:
        locations = db.query(models.Location).filter(models.Location.token_value == token).all()
        location_names = [location.location for location in locations]
        unsubscribe_token_from_locations(token, location_names)
        db.query(models.Location).filter(models.Location.token_value == token).delete()
        db.query(models.Token).filter(models.Token.token == token).delete()
        db.commit()
        return {"message": "Token deleted successfully"}
    except IntegrityError as e:
        db.rollback()
        print(f"IntegrityError: {e}")
        return {"message": "Token deletion failed"}

def get_location(db: Session, location_id: int):
    return db.query(models.Location).filter(models.Location.id == location_id).first()

def get_locations(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Location).offset(skip).limit(limit).all()

def get_locations_by_token(db: Session, token: str):
    return db.query(models.Location).filter(models.Location.token_value == token).all()

def create_location(db: Session, location: schemas.LocationCreate):
    db_location = models.Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def delete_location(db: Session, location_id: int):
    try:
        db.query(models.Location).filter(models.Location.id == location_id).delete()
        db.commit()
        return {"message": "Location deleted successfully"}
    except IntegrityError as e:
        db.rollback()
        print(f"IntegrityError: {e}")
        return {"message": "Location deletion failed"}