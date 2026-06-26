const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const pool = require('./db');
const { ensureDatabaseReady } = require('./scripts/bootstrap');
const tournamentRoutes = require('./routes/tournament');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', tournamentRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`⚡ User disconnected: ${socket.id}`);
  });

  // Listen for match updates
  socket.on('match-update', (data) => {
    console.log('📊 Match update:', data);
    // Broadcast to all connected clients
    io.emit('match-updated', data);
  });

  // Listen for knockout updates
  socket.on('knockout-update', (data) => {
    console.log('🏆 Knockout update:', data);
    io.emit('knockout-updated', data);
  });

  // Listen for standings updates
  socket.on('standings-update', (data) => {
    console.log('📈 Standings update:', data);
    io.emit('standings-updated', data);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await ensureDatabaseReady();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📡 WebSocket server ready');
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to initialize server:', err);
  process.exit(1);
});

module.exports = { app, io };
