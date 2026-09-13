from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone
from enum import Enum as PyEnum

Base = declarative_base()

class MessageStatus(str, PyEnum):
    UNREAD = "unread"
    READ = "read"
    DELIVERED = "delivered"

class Message(Base):
    __tablename__ = "messages"

    message_id = Column(String, primary_key=True)
    therapist_id = Column(String, nullable=False, index=True)
    patient_id = Column(String, nullable=False, index=True)
    encrypted_content = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    sequence_number = Column(Integer, nullable=False)
    read_status = Column(String, nullable=False, default="unread", index=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))