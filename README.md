# ASC Championship - Footvolley Tournament

A web application for managing a footvolley tournament with group stage and knockout stage.

## Project Structure

```
asc-championship/
├── backend/          # Node.js + Express API
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── scripts/
│   └── DATABASE_SCHEMA.md
├── frontend/         # React + Vite UI
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── assets/           # Tournament reference materials
└── README.md
```

## Features

- **Group Stage**
  - Round-robin matches (each team plays every other team in their group)
  - Live standings with W/L/GF/GA/Pts
  - Real-time score updates
  - Add, edit, delete group matches

- **Knockout Stage**
  - Semifinal and Final matches
  - Top 2 teams from each group auto-advance
  - Real-time knockout updates

- **Management**
  - CRUD operations for all matches
  - Live WebSocket updates
  - Responsive web interface

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **HTTP Client**: Axios

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`
The API will be available at `http://localhost:3001`

When the backend starts against an empty PostgreSQL database, it now creates the schema and seeds the default tournament data automatically. That includes the Docker Compose flow on a fresh volume.

## Development Phases

- [x] Phase 1: Project Setup & Database Schema
- [x] Phase 2: Backend Implementation
- [x] Phase 3: Frontend Implementation
- [x] Phase 4: Testing & Integration
- [ ] Phase 5: Deployment

## Features Implemented

### Backend ✅
- REST API with Express.js
- PostgreSQL database with 5 tables
- Group stage match management (CRUD)
- Knockout stage match management
- Dynamic standings calculation
- **Auto-generate knockout bracket from group standings**
- **Qualified teams identification (top 2 per group)**
- **Cross-group semifinal pairings**
- WebSocket real-time updates via Socket.io
- CORS support
- Comprehensive error handling

### Frontend ✅
- React + Vite single-page application
- Group Stage page with:
  - Group selector
  - Match cards with status badges
  - Add/Edit/Delete match modal
  - Live score display
  - Real-time standings updates
- Knockout Stage page with:
  - **Auto-generate bracket button**
  - **Qualified teams preview**
  - Semifinal matches
  - Final match
  - Match management
- Real-time updates via WebSocket
- Responsive design for mobile/tablet/desktop
- Comprehensive styling with CSS variables
- Service layer for API communication
- Error handling and validation

### Database ✅
- Groups table (3 groups)
- Teams table (12 teams total)
- Group matches (round-robin scheduling)
- Standings table (auto-calculated)
- Knockout matches table
- Migration and seed scripts

### Testing & Documentation ✅
- **Comprehensive integration testing guide** (TESTING.md)
- **End-to-end test scenarios and checklists**
- **Integration test script** (run-tests.sh)
- **Complete deployment guide** (DEPLOYMENT.md)
- **API documentation**
- **Setup guides for backend and frontend**
- Browser compatibility testing guidelines
- Performance testing guidelines

### Deployment Ready ✅
- Docker Compose setup
- Vercel + Render deployment instructions
- Traditional server deployment guide
- Security checklist
- Production optimization guidelines

## Database

See `backend/DATABASE_SCHEMA.md` for the complete database schema.

Initial tournament data:
- **Grupo 1**: Patrick e Caiafa, Andresil e MG10, Simão e Vinicius, ET e PP
- **Grupo 2**: Sérgio e João, Brunão e Edu, Sávio e Dani, Adjan e Caue
- **Grupo 3**: Igor e Nilo, Pinha e Toco, Caio e Cachaça, Romero e Gui
