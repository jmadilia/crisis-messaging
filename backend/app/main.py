import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import messaging
from app.database import init_db
from app.seed import seed_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
  init_db()
  seed_demo_data()
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
  allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    *[o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()],
  ],
  allow_credentials=True,
  allow_headers=["*"],
  allow_methods=["*"],
)

# Include routers. On Vercel requests arrive under /api (see vercel.json),
# so serve both paths rather than depend on how the rewrite forwards them
app.include_router(messaging.router)
app.include_router(messaging.router, prefix="/api")

@app.get("/health")
async def health():
  return {"status": "healthy", "service": "crisis-messaging-api"}

@app.get("/")
async def root():
  return {"message": "Welcome to Crisis Messaging API", "docs": "/docs"}