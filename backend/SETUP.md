# Backend Setup Guide

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection details:
```
DATABASE_URL=postgresql://username:password@localhost:5432/footvolley
PORT=3001
NODE_ENV=development
```

### 3. Create Database
```bash
createdb footvolley
```

### 4. Run Migrations
```bash
npm run migrate
```

This will create all tables:
- `groups` - Tournament groups
- `teams` - Teams in each group
- `group_matches` - Group stage matches
- `standings` - Team standings
- `knockout_matches` - Knockout stage matches

### 5. Seed Tournament Data
```bash
npm run seed
```

This will populate:
- 3 Groups (Grupo 1, 2, 3)
- 12 Teams (4 per group)
- Round-robin group matches (6 matches per group)
- Initial standings

### 6. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:groupId` - Get group details with teams, standings, matches

### Group Matches
- `GET /api/groups/:groupId/matches` - Get matches for a group
- `POST /api/matches` - Create a new match
- `PUT /api/matches/:id` - Update match score/status
- `DELETE /api/matches/:id` - Delete a match

### Standings
- `GET /api/groups/:groupId/standings` - Get group standings

### Knockout Matches
- `GET /api/knockout-matches?stage=semifinal` - Get knockout matches
- `POST /api/knockout-matches` - Create knockout match
- `PUT /api/knockout-matches/:id` - Update knockout match
- `DELETE /api/knockout-matches/:id` - Delete knockout match

## WebSocket Events

The server broadcasts real-time updates:

### Emitted Events
- `match-updated` - When a group match score is updated
- `knockout-updated` - When a knockout match is updated
- `standings-updated` - When standings change

### Listen Events
- `match-update` - Send match update data
- `knockout-update` - Send knockout update data
- `standings-update` - Send standings update data

## Database Schema

See `DATABASE_SCHEMA.md` for complete schema details.

### Key Tables

**groups**
```
id (PK), name, created_at
```

**teams**
```
id (PK), name, group_id (FK), created_at
```

**group_matches**
```
id (PK), group_id, team_a_id, team_b_id, score_a, score_b, status, created_at, updated_at
```

**standings**
```
id (PK), group_id, team_id, wins, losses, goals_for, goals_against, points, position
```

**knockout_matches**
```
id (PK), stage, team_a_id, team_b_id, score_a, score_b, winner_id, status, created_at, updated_at
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Port Already in Use
- Change PORT in .env
- Or kill process on port 3001: `lsof -ti:3001 | xargs kill -9`

### Migration Issues
- Ensure database is empty or compatible
- Check database user has necessary permissions
