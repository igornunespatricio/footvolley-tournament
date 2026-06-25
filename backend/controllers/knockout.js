const knockoutModel = require('../models/knockout');

exports.getQualifiedTeams = async (req, res) => {
  try {
    const teams = await knockoutModel.getQualifiedTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createKnockoutBracket = async (req, res) => {
  try {
    const result = await knockoutModel.createKnockoutBracket();
    
    // Broadcast via WebSocket
    req.io.emit('knockout-bracket-created', result);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
