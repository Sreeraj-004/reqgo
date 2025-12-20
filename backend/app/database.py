import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# You can override this with an environment variable when running the app.
# Example:
#   DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/leave_db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:123@localhost:5432/Leave_request",
)

engine = create_engine(DATABASE_URL, echo=False, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


