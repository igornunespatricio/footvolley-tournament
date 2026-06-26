# Quick Start & Deployment Guide

## 🚀 Development Setup (5 minutes)

### Prerequisites
- Node.js v16+ and npm
- PostgreSQL 12+ running locally
- Git

### Step 1: Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=footvolley
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:password@localhost:5432/footvolley
PORT=3001
NODE_ENV=development
```

Create database:
```bash
createdb footvolley
```

Initialize database:
```bash
npm run migrate
npm run seed
```

Start backend:
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3001
📡 WebSocket server ready
```

### Step 2: Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 3: Test the App

Open http://localhost:3000 in your browser and:

1. **Group Stage**
   - Select "Grupo 1" from dropdown
   - See 6 matches with team names
   - Click "Edit" on a match
   - Set scores: Team A=2, Team B=1
   - Set status to "completed"
   - Click Submit
   - Watch standings update in real-time

2. **Knockout Stage**
   - Complete matches in all 3 groups
   - Go to Knockout Stage tab
   - Click "Auto-Generate Bracket"
   - See semifinals created automatically
   - Top 2 teams from each group qualify

## 📊 Testing Checklist

Run the integration test script:
```bash
./run-tests.sh
```

This validates:
- ✅ Backend connectivity
- ✅ Database setup
- ✅ API endpoints working
- ✅ WebSocket ready
- ✅ Full CRUD operations

## 🧪 Manual Testing Scenarios

### Scenario 1: Single Match Update
1. Open Group Stage
2. Select "Grupo 1"
3. Edit first match: 3-2
4. Mark as "completed"
5. Verify standings show team with 3 points, 3 goals for, 2 against

### Scenario 2: Real-time Updates
1. Open app in 2 browser windows
2. Window 1: Edit a match score
3. Window 2: Should see standings update instantly

### Scenario 3: Knockout Bracket
1. Go to Group Stage
2. Edit all 6 matches in each group
3. Mark all as "completed"
4. Go to Knockout Stage
5. Click "Auto-Generate Bracket"
6. See 2 semifinals created (cross-group pairings)

### Scenario 4: Complete Tournament
1. Complete Step 3 above
2. Edit Semifinal 1: 2-1
3. Mark as completed
4. Edit Semifinal 2: 1-0
5. Mark as completed
6. Edit Final: scores auto-filled with SF winners
7. Mark as completed
8. Tournament complete!

## 🌐 Deployment to Production

### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend Deployment (Vercel)**
```bash
cd frontend
npm run build
# Install Vercel CLI
npm i -g vercel
vercel
```

**Backend Deployment (Render)**
1. Create account at render.com
2. Push backend code to GitHub
3. Create "New PostgreSQL" database
4. Create "New Web Service" from GitHub repo
5. Set environment variables:
   - `DATABASE_URL` = PostgreSQL connection string
   - `PORT` = 3001
   - `NODE_ENV` = production

Update frontend `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'https://your-render-backend.onrender.com',
    changeOrigin: true,
  }
}
```

### Option 2: Docker (Full Stack)

Create `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: footvolley
      POSTGRES_PASSWORD: footvolley
      POSTGRES_DB: footvolley
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_USER: footvolley
      DB_PASSWORD: footvolley
      DB_NAME: footvolley
      DB_HOST: postgres
      DB_PORT: 5432
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
```

Run:
```bash
docker-compose --env-file .env.production up
```

### Option 3: Traditional Server (Linux)

**Backend Setup**
```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone repo
git clone <repo-url>
cd asc-championship/backend

# Setup
npm install
cp .env.example .env
# Edit .env with server settings

# Run migrations
npm run migrate
npm run seed

# Start with PM2
npm install -g pm2
pm2 start server.js --name "tournament-api"
pm2 save
```

**Frontend Setup**
```bash
cd ../frontend
npm install
npm run build

# Serve with nginx
sudo apt-get install nginx
# Configure nginx to serve dist/ folder
sudo systemctl start nginx
```

## 📈 Performance Optimization

### Frontend
- Gzip compression enabled in Vite
- CSS variables for theming (cached)
- Lazy loading for components
- Production build reduces bundle to ~150KB

### Backend
- Connection pooling with pg
- Efficient database queries with indexes
- CORS caching for OPTIONS requests
- WebSocket for real-time updates (no polling)

### Database
- Indexes on foreign keys
- Materialized views for standings (optional)
- Connection pool size: 20 (tunable)

## 🔒 Security Checklist

- [ ] Remove `.env` file from git
- [ ] Use strong PostgreSQL password
- [ ] Enable CORS for specific domains
- [ ] Rate limiting on endpoints
- [ ] Input validation on all forms
- [ ] HTTPS in production
- [ ] Regular database backups
- [ ] Monitor error logs

## 📚 API Documentation

### Base URL: `http://localhost:3001/api`

### Endpoints Summary

**Groups**
- `GET /groups` - List all groups
- `GET /groups/:id` - Get group details

**Matches**
- `GET /groups/:id/matches` - Get group matches
- `POST /matches` - Create match
- `PUT /matches/:id` - Update match
- `DELETE /matches/:id` - Delete match

**Standings**
- `GET /groups/:id/standings` - Get standings

**Knockout**
- `GET /knockout-matches` - Get knockout matches
- `POST /knockout-matches` - Create knockout match
- `PUT /knockout-matches/:id` - Update knockout match
- `DELETE /knockout-matches/:id` - Delete knockout match
- `GET /qualified-teams` - Get teams qualified for knockout
- `POST /create-knockout-bracket` - Auto-generate bracket

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :3001

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Node version
node --version  # Should be v16+
```

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `vite.config.js` proxy settings
- Check browser console for CORS errors
- Verify API URL is correct

### Matches not updating in real-time
- Check WebSocket connection in browser DevTools
- Verify Socket.io is running on backend
- Check browser console for errors
- Restart browser tab

### Database issues
```bash
# Reset database (WARNING: deletes all data)
dropdb footvolley
createdb footvolley
npm run migrate
npm run seed
```

## 📞 Support & Issues

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check backend logs (terminal where `npm run dev` runs)
3. Check database connection
4. Review TESTING.md for common scenarios
5. Check API responses in Network tab

## Next Steps After Deployment

1. **Add Authentication**
   - JWT tokens for admin access
   - Restrict edit/delete to authenticated users

2. **Add Match History**
   - Log all changes with timestamps
   - Undo/redo functionality

3. **Add Scoring Rules**
   - Custom point systems
   - Tiebreaker logic

4. **Add Admin Dashboard**
   - Tournament management
   - Team management
   - Report generation

5. **Mobile App**
   - React Native version
   - Offline support
   - Push notifications
