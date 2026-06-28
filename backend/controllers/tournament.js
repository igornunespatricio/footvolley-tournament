const Tournament = require('../models/tournament');
const { broadcastMatchUpdate, broadcastKnockoutUpdate, broadcastStandingsUpdate } = require('../middleware/broadcast');
const ALLOWED_STATUSES = new Set(['pending', 'completed']);

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Tournament.getAllTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Group handlers
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Tournament.getAllGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Tournament.getGroupById(groupId);
    const teams = await Tournament.getTeamsByGroup(groupId);
    const standings = await Tournament.getStandings(groupId);
    const matches = await Tournament.getGroupMatches(groupId);
    
    res.json({
      group,
      teams,
      standings,
      matches,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Match handlers
exports.getGroupMatches = async (req, res) => {
  try {
    const { groupId } = req.params;
    const matches = await Tournament.getGroupMatches(groupId);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { groupId, teamAId, teamBId } = req.body;
    
    if (!groupId || !teamAId || !teamBId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const match = await Tournament.createMatch(groupId, teamAId, teamBId);
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreA, scoreB, status } = req.body;
    
    if (scoreA === undefined || scoreB === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }
    
    const match = await Tournament.updateMatch(id, scoreA, scoreB, status);
    
    // Broadcast update via WebSocket
    broadcastMatchUpdate(req.io, {
      type: 'match-updated',
      match,
    });
    
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Tournament.deleteMatch(id);
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Standings handler
exports.getStandings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const standings = await Tournament.getStandings(groupId);
    
    // Broadcast standings update via WebSocket
    broadcastStandingsUpdate(req.io, {
      type: 'standings-updated',
      groupId,
      standings,
    });
    
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Knockout handlers
exports.getKnockoutMatches = async (req, res) => {
  try {
    const { stage } = req.query;
    const matches = await Tournament.getKnockoutMatches(stage);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createKnockoutMatch = async (req, res) => {
  try {
    const { stage, teamAId, teamBId } = req.body;
    
    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }
    
    const match = await Tournament.createKnockoutMatch(stage, teamAId || null, teamBId || null);
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateKnockoutMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreA, scoreB, status } = req.body;
    
    if (scoreA === undefined || scoreB === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }

    const existingMatch = await Tournament.getKnockoutMatchById(id);
    if (!existingMatch) {
      return res.status(404).json({ error: 'Knockout match not found' });
    }

    let winnerId = null;
    if (status === 'completed') {
      if (!existingMatch.team_a_id || !existingMatch.team_b_id) {
        return res.status(400).json({ error: 'Both teams must be set before completing a match' });
      }

      if (Number(scoreA) === Number(scoreB)) {
        return res.status(400).json({ error: 'Knockout completed matches cannot end in a tie' });
      }

      winnerId = Number(scoreA) > Number(scoreB) ? existingMatch.team_a_id : existingMatch.team_b_id;
    }
    
    const match = await Tournament.updateKnockoutMatch(id, scoreA, scoreB, status, winnerId);
    
    // Handle match progression (QF → SF → F)
    const progressionResult = await Tournament.handleKnockoutMatchCompletion(id);
    
    // Broadcast update via WebSocket
    broadcastKnockoutUpdate(req.io, {
      type: 'knockout-updated',
      match,
      progression: progressionResult,
    });
    
    res.json({ match, progression: progressionResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteKnockoutMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Tournament.deleteKnockoutMatch(id);
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
