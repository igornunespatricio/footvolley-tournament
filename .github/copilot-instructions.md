# Copilot Instructions for ASC Championship

## Project Overview

**ASC Championship** is a full-stack footvolley tournament management application with real-time updates. It enables tournament organizers to manage group stage matches, generate knockout brackets, and track live scores.

- **Backend**: Node.js + Express API with PostgreSQL
- **Frontend**: React 18 + Vite single-page application
- **Real-time**: Socket.io for live match and standings updates

## Architecture

### Frontend (React + Vite)

**Location**: `/frontend/`

**Structure**:
- `src/App.jsx` - Main app component with tab navigation (Group Stage / Knockout Stage)
- `src/pages/` - Two main pages:
  - `GroupStage.jsx` - Group round-robin matches, standings, CRUD operations
  - `KnockoutStage.jsx` - Semifinals/Finals, bracket generation, match management
- `src/components/` - Reusable components:
  - `MatchCard.jsx` - Individual match display
  - `MatchModal.jsx` - Form for creating/editing matches
  - `StandingsTable.jsx` - Team standings display
- `src/services/` - API & WebSocket communication:
  - `api.js` - Axios instance with service methods for groups, matches, standings, knockout operations
  - `socket.js` - Socket.io initialization and event handlers (match-updated, knockout-updated, standings-updated)
- `src/styles/` - CSS modules with CSS variables for theming

**Key patterns**:
- Components use hooks (useState, useEffect) for state management
- API responses update component state, triggering re-renders
- WebSocket events trigger data reloads (e.g., `onMatchUpdated` in App.jsx reloads groups)
- Axios calls go through `api.js` services, not directly in components

### Backend (Express + PostgreSQL)

**Location**: `/backend/`

**Structure**:
- `server.js` - Express app, Socket.io setup, middleware configuration
- `routes/tournament.js` - Route definitions for all API endpoints
- `controllers/tournament.js` & `controllers/knockout.js` - Route handlers
- `models/tournament.js` & `models/knockout.js` - Database query abstractions
- `db.js` - PostgreSQL connection pool
- `middleware/` - Custom middleware (if any)
- `scripts/` - Migration and seed scripts
  - `migrate.js` - Creates database schema
  - `seed.js` - Populates initial tournament data

**Database Tables** (see `backend/DATABASE_SCHEMA.md`):
- `groups` - Tournament groups (3 groups)
- `teams` - Teams per group (4 per group = 12 total)
- `group_matches` - Round-robin matches (6 per group, 18 total)
- `standings` - Live standings (auto-calculated from match results)
- `knockout_matches` - Semifinal and Final matches

**Key patterns**:
- Models: Query functions accept params, return raw data
- Controllers: Call model functions, handle req/res, emit WebSocket events
- Routes: Map HTTP methods to controllers
- Socket.io events trigger database updates and broadcast to all clients

## Build, Test, and Lint Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Development server (with nodemon auto-reload)
npm run dev

# Run database migrations
npm run migrate

# Seed tournament data (3 groups, 12 teams, 18 matches)
npm run seed

# Production server
npm start
```

**No built-in test or lint commands** - tests are documented in `TESTING.md` (manual testing guide)

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development server (Vite, hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

**No built-in test or lint commands**

### Running the Full Stack

```bash
# Terminal 1: Database + Backend
cd backend
npm run migrate
npm run seed
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:3000
# Backend API: http://localhost:3001
# WebSocket: ws://localhost:3001
```

## Environment Setup

### Backend Configuration

Create `backend/.env` with:
```
DATABASE_URL=postgresql://username:password@localhost:5432/footvolley
PORT=3001
NODE_ENV=development
```

See `backend/.env.example` for reference.

### Frontend Configuration

Frontend uses hardcoded API URL: `http://localhost:3001/api` (in `src/services/api.js`)

## Key Workflows

### Adding a Group Match

1. **Frontend**: User clicks "Add Match" → `MatchModal` opens with team selectors
2. **Submit**: `matchService.create(groupId, teamAId, teamBId)` calls `POST /api/matches`
3. **Backend**: `tournament.createMatch()` inserts into `group_matches`, emits `match-update` WebSocket
4. **Frontend**: `onMatchUpdated()` callback in `GroupStage` reloads groups, re-renders

### Updating Standings

1. **User**: Edits match, sets score and status to "completed"
2. **Backend**: `updateMatch()` in model calculates standings:
   - Determines winner/loser
   - Updates `standings` table (wins, points, goals_for, goals_against)
3. **WebSocket**: Broadcasts `standings-updated` event
4. **Frontend**: Rerenders `StandingsTable` with new standings

### Generating Knockout Bracket

1. **Frontend**: User clicks "Auto-Generate Bracket"
2. **API call**: `knockoutService.createBracket()` → `POST /api/create-knockout-bracket`
3. **Backend**:
   - `getQualifiedTeams()` identifies top 2 teams per group (sorted by points, then goals_for)
   - Creates 2 semifinal matches (1st vs 2nd cross-group pairings)
4. **Frontend**: Displays semifinals and Final slot

## Common Development Tasks

### Adding a New API Endpoint

1. Add route in `backend/routes/tournament.js`
2. Add controller function in `backend/controllers/tournament.js`
3. Add model function in `backend/models/tournament.js` (database query)
4. Add service method in `frontend/src/services/api.js`
5. Call service in React component via `useEffect` or event handler
6. Emit WebSocket event from backend if data should update all clients

### Modifying Match Display

1. Edit `MatchCard.jsx` for appearance
2. Edit `MatchModal.jsx` for form fields
3. Update `matchService` in `api.js` if API contract changes
4. Update `groupService` or `standingsService` if related data changes

### Debugging WebSocket Issues

1. Check `socket.js` connection initialization
2. Verify backend emits event name: `io.emit('match-updated', data)`
3. Verify frontend listener name matches: `onMatchUpdate(callback)`
4. Browser DevTools → Network → WS tab to inspect socket messages

## Important Conventions

- **Match Status**: Only "completed" matches update standings (values: "pending", "completed")
- **Standings Calculation**: Triggered only when match marked "completed", not on every score change
- **Team Qualification**: Top 2 teams per group by points (tiebreaker: goals_for)
- **Knockout Pairing**: Semifinal 1: Group 1 1st vs Group 2 2nd; Semifinal 2: Group 1 2nd vs Group 2 1st; etc.
- **API Error Handling**: Frontend catches errors, displays in component or console
- **Real-time Updates**: All clients receive updates via Socket.io, not polling

## Database Connection

- Pool-based connection via `pg` library
- Queries use parameterized statements ($1, $2, etc.) to prevent SQL injection
- Connection string from `DATABASE_URL` env var
- Initial connection in `db.js`, imported by models

## Common Ports

- Frontend dev server: `http://localhost:3000` (Vite)
- Backend dev server: `http://localhost:3001` (Express)
- PostgreSQL: `localhost:5432` (default)

## Files to Reference

- `backend/DATABASE_SCHEMA.md` - Complete database schema with relationships
- `backend/SETUP.md` - Detailed backend setup and API endpoint list
- `TESTING.md` - Comprehensive testing guide and scenarios
- `DEPLOYMENT.md` - Production deployment instructions
- `README.md` - High-level project overview
