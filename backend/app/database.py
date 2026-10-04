import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.models.message import Base

def get_database_url():
  """Use the hosted Postgres URL when set (Neon on Vercel), else a local SQLite file"""
  url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
  if not url:
    return "sqlite:///./crisis_messaging.db"
  # Neon and Vercel hand out postgres:// URLs; SQLAlchemy needs the psycopg driver named
  for prefix in ("postgres://", "postgresql://"):
    if url.startswith(prefix):
      return "postgresql+psycopg://" + url[len(prefix):]
  return url

DATABASE_URL = get_database_url()

if DATABASE_URL.startswith("sqlite"):
  engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
  )
else:
  # Serverless functions come and go, so let Neon's pooler hold connections
  engine = create_engine(DATABASE_URL, poolclass=NullPool, pool_pre_ping=True)

SessionLocal = sessionmaker(
  autocommit=False,
  autoflush=False,
  bind=engine
)

def init_db():
  """Create all tables"""
  Base.metadata.create_all(bind=engine)

def get_db():
  """Get a database session for each request"""
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
