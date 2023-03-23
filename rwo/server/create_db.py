from rwo.db import models
from rwo.db.database import engine, DBSession

try:
    models.Base.metadata.create_all(bind=engine)
except:
    pass
