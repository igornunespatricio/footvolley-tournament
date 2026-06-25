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

## Development Phases

- [x] Phase 1: Project Setup & Database Schema
- [ ] Phase 2: Backend Implementation
- [ ] Phase 3: Frontend Implementation
- [ ] Phase 4: Testing & Integration
- [ ] Phase 5: Deployment

## Database

See `backend/DATABASE_SCHEMA.md` for the complete database schema.

Initial tournament data:
- **Grupo 1**: Patrick e Caiafa, Andresil e MG10, Simão e Vinicius, ET e PP
- **Grupo 2**: Sérgio e João, Brunão e Edu, Sávio e Dani, Adjan e Caue
- **Grupo 3**: Igor e Nilo, Pinha e Toco, Caio e Cachaça, Romero e Gui
