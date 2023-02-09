from rwo.db import models
from rwo.db.database import engine, DBSession

models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)
