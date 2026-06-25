const express = require('express');
const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Broadcast match update via WebSocket
const broadcastMatchUpdate = (io, data) => {
  io.emit('match-updated', data);
};

// Broadcast knockout update via WebSocket
const broadcastKnockoutUpdate = (io, data) => {
  io.emit('knockout-updated', data);
};

// Broadcast standings update via WebSocket
const broadcastStandingsUpdate = (io, data) => {
  io.emit('standings-updated', data);
};

module.exports = {
  asyncHandler,
  broadcastMatchUpdate,
  broadcastKnockoutUpdate,
  broadcastStandingsUpdate,
};
