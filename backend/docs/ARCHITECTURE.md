## Table of Contents

- [Overview](#overview)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Design Decisions](#design-decisions)
- [Trade-offs & Future Improvements](#trade-offs--future-improvements)
- [How to Run Locally](#how-to-run-locally)

## Overview

Crisis Messaging is a real-time messaging system for therapist-patient communication. It ensures messages arrive in order, handles offline scenarios gracefully, and provides a foundation for mental health applications.

## Data Model

### Messages Table

Stores therapist-patient messages with the following schema:
| Column | Type | Purpose | Indexed |
|--------|------|---------|---------|
| message_id | UUID | Unique identifier for each message | Primary Key |
| therapist_id | String | ID of the therapist (sender) | Yes |
| patient_id | String | ID of the patient (receiver) | Yes |
| encrypted_content | String | Encrypted message body (E2EE) | No |
| timestamp | DateTime | When therapist sent the message | No |
| sequence_number | Integer | Order within the conversation | Yes |
| read_status | String | "unread", "read", or "delivered" | Yes |
| created_at | DateTime | Server-side timestamp (for auditing) | No |

### Indexing Strategy

- Composite index on (therapist_id, patient_id, sequence_number) for fast conversation retrieval
- Individual indexes on therapist_id, patient_id, read_status for common filters

### Why SQLite?

SQLite is sufficient for MVP. At scale (millions of messages), we would migrate to Cassandra for horizontal scaling and write-optimization.

## API Endpoints

### POST /messages

Creates a new message.

**Request:**

```json
{
  "therapist_id": "therapist-123",
  "patient_id": "patient-456",
  "encrypted_content": "encrypted blob..."
}
```

**Response (201 Created):**

```json
{
  "message_id": "a1b2c3d4-...",
  "timestamp": "2026-09-13T15:30:00Z"
}
```

**Validation:**

- therapist_id: required, min 1 character
- patient_id: required, min 1 character
- encrypted_content: required, 1-6000 characters

### GET /messages

Retrieves messages between a therapist and patient with cursor-based pagination.

**Query Parameters:**

- therapist_id (required)
- patient_id (required)
- before_sequence (optional) - get messages older than this sequence number
- limit (optional, default=20, range 1-100)

**Response (200 OK):**

```json
{
  "messages": [
    {
      "message_id": "...",
      "encrypted_content": "...",
      "timestamp": "2026-09-13T15:30:00Z",
      "sequence_number": 42,
      "read_status": "unread"
    }
  ],
  "has_more": true,
  "oldest_sequence": 40
}
```

## Design Decisions

### Sequence Numbers Over Timestamps

**Decision:** Use auto-incrementing sequence_number for message ordering instead of relying on timestamp.

**Why:**

- Timestamps can drift if client clocks are unsynchronized
- Sequence numbers guarantee strict ordering within a conversation
- Resilient to network delays: even if messages arrive out-of-order, clients render in correct order

### Cursor-Based Pagination

**Decision:** Use sequence_number-based pagination (before_sequence) instead of offset-based.

**Why:**

- Offset pagination breaks when new messages arrive mid-pagination (users see duplicates or miss messages)
- Cursor-based is stable: requesting "before_sequence=50" always returns the same messages regardless of new inserts
- This is what Signal, Slack, and WhatsApp use

### Client-Side Encryption (E2EE)

**Decision:** Messages are encrypted on the client before transmission.

**Why:**

- Server never sees plaintext (meets HIPAA requirements)
- In production, would implement Signal protocol for key exchange
- Current MVP assumes pre-shared keys; production would add key rotation

### Database Choice: SQLite for MVP

**Decision:** Use SQLite instead of Cassandra or PostgreSQL.

**Why:**

- No compilation issues on development machines (Python 3.13 compatible)
- Sufficient for learning and demonstration
- At production scale (100k+ concurrent users), migrate to Cassandra

### Read Status as Simple String

**Decision:** Store read_status as "unread" | "read" | "delivered" string, not a separate table.

**Why:**

- Simplicity for MVP
- Single table query instead of joins
- At scale, would move read receipts to Redis cache (frequently updated)

## Trade-offs & Future Improvements

### Current MVP vs Production

| Feature            | MVP                    | Production                             |
| ------------------ | ---------------------- | -------------------------------------- |
| Encryption         | Client-side (assumed)  | Signal protocol with key exchange      |
| Message Queue      | Synchronous writes     | Celery + Redis for async processing    |
| Real-time Delivery | REST polling           | WebSocket for instant push             |
| Scalability        | Single SQLite instance | Cassandra with horizontal sharding     |
| Caching            | None                   | Redis for read receipts & hot messages |
| Notification       | Manual polling         | Firebase Cloud Messaging + fallbacks   |
| Search             | No full-text search    | Elasticsearch for message search       |

### Known Limitations

1. **No WebSocket:** Messages require polling. Production would use WebSocket for real-time delivery.
2. **Synchronous Writes:** Database writes block the request. At scale, use async queue.
3. **Single Partition:** SQLite can't scale horizontally. Would shard by (therapist_id, patient_id).
4. **No Crisis Detection:** Could add AI-powered message analysis (Anthropic Claude API) to flag crisis keywords.
5. **No Offline Support:** Doesn't handle offline message queueing. Mobile apps would persist locally and sync on reconnect.

### What I'd Build Next (Priority Order)

1. WebSocket real-time delivery
2. Crisis detection with Claude API
3. Message search with full-text indexing
4. Read receipt caching with Redis
5. Cassandra migration for scale

## How to Run Locally

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # macOS/Linux

pip install -r requirements.txt

# Run migrations (creates database)
python -c "from app.database import init_db; init_db()"

# Start server
uvicorn app.main:app --reload
```

Server runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Testing the System

1. Open `http://localhost:3000` in your browser
2. Enter therapist_id: `therapist-123`, patient_id: `patient-456`
3. Click "Load Conversation"
4. Send a message
5. Open another browser tab, repeat steps 2-3 to see messages sync in real-time (via polling)

### API Testing (cURL)

```bash
# Send a message
curl -X POST http://localhost:8000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "therapist_id": "therapist-123",
    "patient_id": "patient-456",
    "encrypted_content": "Hello, how are you feeling?"
  }'

# Get messages
curl "http://localhost:8000/messages?therapist_id=therapist-123&patient_id=patient-456&limit=20"
```

### Database

SQLite database is created automatically at `backend/crisis_messaging.db`

To inspect:

```bash
cd backend
python << 'EOF'
from app.database import SessionLocal
from app.models.message import Message

db = SessionLocal()
messages = db.query(Message).all()
print(f"Total messages: {len(messages)}")
db.close()
EOF
```
