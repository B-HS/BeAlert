from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import time
import utils
import schemas
import crud
from database import SessionLocal

def load_disaster_messages():
    db = SessionLocal()
    try:
        disaster_messages_json = utils.fetch_disaster_messages()
        disaster_messages = [schemas.DisasterMessageCreate(**msg) for msg in disaster_messages_json]
        crud.load_disaster_messages_from_gov(db, disaster_messages)
        print(f"{datetime.now()}: Disaster messages loaded successfully")
    except ValueError as ve:
        print(f"{datetime.now()}: ValueError - {ve}")
    except Exception as e:
        print(f"{datetime.now()}: Exception - {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    load_disaster_messages,
    trigger=IntervalTrigger(seconds=10),
    id='load_disaster_messages_job',
    name='Load disaster messages every 10 seconds',
    replace_existing=True
)

import atexit
atexit.register(lambda: scheduler.shutdown())