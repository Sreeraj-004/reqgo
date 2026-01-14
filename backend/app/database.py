from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# =========================
# HARD-CODED DATABASE URL
# =========================
DATABASE_URL = "postgresql://postgres:123@localhost:5432/request_letter"

# =========================
# SQLALCHEMY ENGINE
# =========================
engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

# =========================
# SESSION
# =========================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# =========================
# BASE
# =========================
Base = declarative_base()

# =========================
# FASTAPI DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
