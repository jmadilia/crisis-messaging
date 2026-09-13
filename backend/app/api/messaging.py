from fastapi import APIRouter, status, Depends, Query
from datetime import datetime, timezone
from sqlalchemy import func
from app.schemas.message import MessageRequest, MessageResponse, MessageListItem, MessageListResponse
from app.models.message import Message
from app.database import get_db
from sqlalchemy.orm import Session
import uuid

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def send_message(request: MessageRequest, db: Session = Depends(get_db)) -> MessageResponse:
  """Send a message from therapist to patient"""
  # Get max sequence number for this conversation
  max_seq = (
    db.query(func.max(Message.sequence_number))
    .filter(
        Message.therapist_id == request.therapist_id,
        Message.patient_id == request.patient_id
    )
    .scalar()
    or 0
  )

  message_id = str(uuid.uuid4())
  timestamp = datetime.now(timezone.utc)
  sequence_number = max_seq + 1

  # Create message row
  db_message = Message(
    message_id=message_id,
    therapist_id=request.therapist_id,
    patient_id=request.patient_id,
    encrypted_content=request.encrypted_content,
    timestamp=timestamp,
    sequence_number=sequence_number,
    read_status="unread",
    created_at=datetime.now(timezone.utc)
  )

  # Save to database
  db.add(db_message)
  db.commit()
  db.refresh(db_message)

  return MessageResponse(
    message_id=message_id,
    timestamp=timestamp
  )

@router.get("")
async def get_messages(
  therapist_id: str = Query(..., min_length=1),
  patient_id: str = Query(..., min_length=1),
  before_sequence: int | None = None,
  limit: int = Query(20, ge=1, le=100),
  db: Session = Depends(get_db)
) -> MessageListResponse:
  """Get the messages between therapist and patient"""

  # Get all messages for the conversation
  query = db.query(Message).filter(
    Message.therapist_id == therapist_id,
    Message.patient_id == patient_id
  )

  # Narrow to older messages
  if before_sequence is not None:
    query = query.filter(Message.sequence_number < before_sequence)

  # Order by newest first
  query = query.order_by(Message.sequence_number.desc())

  # If we have (limit + 1) results, then there are more messages
  results = query.limit(limit + 1).all()

  # Calculate has_more set messages to only the first 'limit'
  has_more = len(results) > limit
  messages = results[:limit]

  # Convert SQLAlchemy objects to Pydantic models
  message_items = [MessageListItem.model_validate(msg) for msg in messages]

  if messages:
    oldest_sequence = message_items[-1].sequence_number
  else:
    oldest_sequence = None

  return MessageListResponse(
    messages=message_items,
    has_more=has_more,
    oldest_sequence=oldest_sequence
  )