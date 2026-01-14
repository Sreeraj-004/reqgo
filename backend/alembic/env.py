from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config, pool, create_engine, text
from alembic import context

# =========================
# ALEMBIC CONFIG
# =========================
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# =========================
# ENV VARIABLES
# =========================
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "request_letter")

DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

config.set_main_option("sqlalchemy.url", DATABASE_URL)

# =========================
# IMPORT MODELS & BASE
# =========================
from app.database import Base          # adjust path if needed
from app import models                 # MUST import all models

target_metadata = Base.metadata

# =========================
# DB CREATION (CRITICAL)
# =========================
def ensure_database_exists():
    admin_url = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"
    )

    admin_engine = create_engine(
        admin_url,
        isolation_level="AUTOCOMMIT",
        future=True,
    )

    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": DB_NAME},
        ).scalar()

        if not exists:
            conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))


# =========================
# OFFLINE MIGRATIONS
# =========================
def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# =========================
# ONLINE MIGRATIONS
# =========================
def run_migrations_online():
    ensure_database_exists()  # 🔥 THIS WAS MISSING

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# =========================
# ENTRY POINT
# =========================
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
