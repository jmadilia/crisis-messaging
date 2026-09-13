from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.message import Base

DATABASE_URL = "sqlite:///./crisis_messaging.db"

engine = create_engine(
  DATABASE_URL,
  connect_args={"check_same_thread": False}
)

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
