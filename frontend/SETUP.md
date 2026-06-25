# Frontend Setup Guide

## Prerequisites
- Node.js (v16+)
- npm or yarn

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL (Optional)
The frontend is configured to proxy requests to `http://localhost:3001/api`.
If your backend runs on a different URL, update the `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://your-backend-url:port',
      changeOrigin: true,
    }
  }
}
```

## Running

### Development Server
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Building for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## Features

### 📊 Group Stage
- View all groups with team standings
- See matches scheduled, in progress, or completed
- Track W/L/GF/GA/Pts statistics
- Add new matches
- Edit match scores and status
- Delete matches
- Real-time standings updates via WebSocket

### 🏆 Knockout Stage
- View semifinal and final matches
- Create knockout matches
- Update scores and winners
- Delete knockout matches
- Real-time updates

### 🔄 Real-time Updates
- WebSocket connection for live match updates
- Automatic standings recalculation
- Live score notifications
- Connection status monitoring

## Architecture

### Components
- **App.jsx** - Main app container with routing
- **GroupStage.jsx** - Group stage page
- **KnockoutStage.jsx** - Knockout stage page
- **MatchCard.jsx** - Individual match display
- **StandingsTable.jsx** - Standings display
- **MatchModal.jsx** - Add/edit match form

### Services
- **api.js** - Axios HTTP client for backend API
- **socket.js** - Socket.io WebSocket connection

### Hooks
- **useSocket.js** - Custom hooks for WebSocket events

### Styles
- **index.css** - Global styles and variables
- **App.css** - App header and navigation
- **GroupStage.css** - Group stage page styles
- **KnockoutStage.css** - Knockout stage page styles
- **MatchCard.css** - Match card component styles
- **Modal.css** - Modal dialog styles
- **StandingsTable.css** - Standings table styles

## API Integration

The frontend connects to the backend API at `http://localhost:3001/api`

### Endpoints Used
```
GET  /groups              - Get all groups
GET  /groups/:id          - Get group details
GET  /groups/:id/matches  - Get group matches
GET  /groups/:id/standings - Get group standings
POST /matches             - Create match
PUT  /matches/:id         - Update match
DELETE /matches/:id       - Delete match

GET    /knockout-matches  - Get knockout matches
POST   /knockout-matches  - Create knockout match
PUT    /knockout-matches/:id - Update knockout match
DELETE /knockout-matches/:id - Delete knockout match
```

## WebSocket Events

### Server → Client (Listening)
- `match-updated` - Group match was updated
- `knockout-updated` - Knockout match was updated
- `standings-updated` - Standings were updated

### Client → Server (Emitting)
- `match-update` - Send match update
- `knockout-update` - Send knockout update
- `standings-update` - Send standings update

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on `http://localhost:3001`
- Check network tab in browser devtools
- Verify `vite.config.js` proxy settings

### WebSocket connection fails
- Check backend Socket.io server is running
- Verify CORS settings in backend
- Check browser console for WebSocket errors

### Styles not loading
- Clear browser cache
- Rebuild with `npm run build`
- Check CSS file paths in imports

### Hot reload not working
- Restart dev server with `npm run dev`
- Check terminal for build errors
