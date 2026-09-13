# Crisis Messaging

A real-time therapist-patient messaging system demonstrating full-stack system design principles.

## Overview

This project is a **learning portfolio piece** showcasing:

- Backend API design (FastAPI + SQLAlchemy)
- Database schema & query optimization
- Frontend/backend integration (Next.js + React)
- System design trade-offs (ordering, pagination, scalability)
- HIPAA-compliant architecture considerations

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
crisis-messaging/
├── backend/
│   ├── app/
│   │   ├── api/messaging.py
│   │   ├── models/message.py
│   │   ├── schemas/message.py
│   │   ├── database.py
│   │   └── main.py
│   ├── docs/ARCHITECTURE.md
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageForm.tsx
│   │   │   └── ConversationView.tsx
│   │   ├── lib/api.ts
│   │   └── app/page.tsx
│   └── package.json
└── README.md
```

## Key Features

- **Message Ordering:** Sequence numbers guarantee order across network delays
- **Cursor Pagination:** Stable pagination using sequence_number (no duplicates)
- **Validation:** Pydantic validates all inputs with clear error messages
- **E2EE Ready:** Architecture supports end-to-end encryption (client-side)
- **Full-Stack:** Complete flow from frontend to database and back

## Architecture Highlights

### Data Model

- Messages stored with therapist_id, patient_id, encrypted_content
- Sequence numbers for strict ordering within conversations
- Indexed on (therapist_id, patient_id, sequence_number)

### API Design

- **POST /messages** - Create a message (returns message_id + timestamp)
- **GET /messages** - Retrieve with cursor pagination (before_sequence parameter)

### Technology Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Database:** SQLite (MVP) → Cassandra (production scale)

## Design Decisions

See `backend/docs/ARCHITECTURE.md` for detailed discussion of:

- Why sequence numbers over timestamps
- Why cursor-based pagination
- Trade-offs and future improvements
- Production scaling considerations

## What's NOT Included (MVP Scope)

- WebSocket real-time delivery (uses polling instead)
- Actual E2EE encryption implementation (documented, not coded)
- Crisis detection AI analysis
- Production database (Cassandra)
- Full offline support

This project demonstrates:

1. **System Design Thinking** - Data modeling, indexing, pagination strategy
2. **Full-Stack Skills** - API design, database queries, frontend integration
3. **Production Awareness** - Understanding scale limitations and migrations
4. **Clean Code** - Type hints, validation, error handling
5. **Documentation** - Clear architecture explanations

See `backend/docs/ARCHITECTURE.md` for the complete design rationale.

## Future Enhancements

1. WebSocket for real-time messaging
2. Crisis detection using Claude API
3. Message search with Elasticsearch
4. Cassandra migration for scale
5. Redis caching for read receipts
