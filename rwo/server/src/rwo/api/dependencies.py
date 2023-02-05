from ..db.database import DBSession

def get_db_session():
    print("Getting DB Session")
    db_session = None
    try:
        db_session = DBSession()
        yield db_session
    finally:
        if (db_session):
            db_session.close()