"""Seed the sample conversations the landing page links to.

Safe to run any number of times: a conversation is only written when it has
no messages yet, and message IDs are fixed so concurrent runs can't duplicate.

Run manually with: python -m app.seed
"""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from app.database import SessionLocal, init_db
from app.models.message import Message

# Keep in sync with frontend/src/lib/demo.ts
DEMO_THERAPIST_ID = "therapist-demo"

DEMO_CONVERSATIONS = {
  "patient-alex": [
    "Hi Alex, I wanted to check in before your interview on Thursday. How are you feeling about it?",
    "It's completely normal to feel anxious before something that matters to you. That nervous energy means you care.",
    "Try the box breathing we practiced: in for 4, hold for 4, out for 4, hold for 4. A few rounds before you walk in can help.",
    "Remember to write down three things you're proud of from your last role. Looking at them beforehand can ground you.",
    "Checking in after the interview. However it went, showing up was a real step. Let's talk about it at our next session.",
  ],
  "patient-jordan": [
    "Hi Jordan, following up on what you shared about trouble sleeping this week.",
    "Let's try keeping a consistent wake-up time, even on weekends, and putting screens away 30 minutes before bed.",
    "If your mind is racing at night, jot your thoughts in a notebook by the bed so you can set them aside until morning.",
    "If you ever feel unsafe or overwhelmed between sessions, you can call or text 988 to reach the Suicide & Crisis Lifeline any time.",
    "You can also text HOME to 741741 for the Crisis Text Line. I'm glad you reached out, and we'll keep working on this together.",
  ],
}

def seed_demo_data():
  """Insert any demo conversation that doesn't exist yet"""
  init_db()
  db = SessionLocal()
  try:
    now = datetime.now(timezone.utc)
    for patient_id, contents in DEMO_CONVERSATIONS.items():
      exists = db.query(Message.message_id).filter(
        Message.therapist_id == DEMO_THERAPIST_ID,
        Message.patient_id == patient_id
      ).first()
      if exists:
        continue

      start = now - timedelta(days=len(contents))
      for i, content in enumerate(contents, start=1):
        sent_at = start + timedelta(days=i - 1)
        db.add(Message(
          message_id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"demo/{DEMO_THERAPIST_ID}/{patient_id}/{i}")),
          therapist_id=DEMO_THERAPIST_ID,
          patient_id=patient_id,
          encrypted_content=content,
          timestamp=sent_at,
          sequence_number=i,
          read_status="read",
          created_at=sent_at
        ))
      try:
        db.commit()
      except IntegrityError:
        # Another instance seeded this conversation first
        db.rollback()
  finally:
    db.close()

if __name__ == "__main__":
  seed_demo_data()
  print("Demo data seeded")
