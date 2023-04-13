from rwo.db import models
from rwo.db.database import engine, DBSession

try:
    models.Base.metadata.drop_all(bind=engine)
except Exception as e:
    print(e)
    pass
