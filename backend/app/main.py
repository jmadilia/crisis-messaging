from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import messaging
from app.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
  init_db()
  print("Database initialized")
  yield
  pass

app = FastAPI(
  title="Crisis Messaging API",
  description="Real-time messaging system for therapist-patient communication",
  version="0.1.0",
  lifespan=lifespan
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000", "http://localhost:5173"],
  allow_credentials=True,
  allow_headers=["*"],
  allow_methods=["*"],
)

# Include routers
app.include_router(messaging.router)

@app.get("/health")
async def health():
  return {"status": "healthy", "service": "crisis-messaging-api"}

@app.get("/")
async def root():
  return {"message": "Welcome to Crisis Messaging API", "docs": "/docs"}