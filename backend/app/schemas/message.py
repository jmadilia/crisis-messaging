from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class MessageRequest(BaseModel):
  therapist_id: str = Field(
    ...,
    min_length=1,
    description="ID of the therapist sending the message"
  )
  patient_id: str = Field(
    ...,
    min_length=1,
    description="ID of the patient receiving the message"
  )
  encrypted_content: str = Field(
    ...,
    min_length=1,
    max_length=6000,
    description="Encrypted blob of message content",
  )

class MessageResponse(BaseModel):
  message_id: str
  timestamp: datetime

class MessageListItem(BaseModel):
  model_config = ConfigDict(from_attributes=True)
  message_id: str
  encrypted_content: str
  timestamp: datetime
  sequence_number: int
  read_status: str

class MessageListResponse(BaseModel):
  messages: list[MessageListItem] = Field(
    default_factory=list,
    description="Messages in the conversation"
  )
  has_more: bool = Field(
    description="Whether there are more messages before oldest_sequence"
  )
  oldest_sequence: int | None = Field(
    default=None,
    description="Lowest sequence_number in this batch"
  )