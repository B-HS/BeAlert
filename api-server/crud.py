# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
import models, schemas

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
    return db_disaster_message

def load_disaster_messages_from_gov(db: Session, disaster_messages: list[schemas.DisasterMessageCreate]):
    for message in disaster_messages:
        existing_message = db.query(models.DisasterMessage).filter(models.DisasterMessage.md101_sn == message.md101_sn).first()
        if existing_message is None:
            try:
                db_disaster_message = models.DisasterMessage(**message.dict())
                db.add(db_disaster_message)
                db.commit()
            except IntegrityError:
                db.rollback()
                print(f"Duplicate entry found for md101_sn: {message.md101_sn}, skipping...")