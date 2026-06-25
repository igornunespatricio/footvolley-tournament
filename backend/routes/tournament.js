const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament');

// Groups
router.get('/groups', tournamentController.getAllGroups);
router.get('/groups/:groupId', tournamentController.getGroupDetails);

// Group Matches
router.get('/groups/:groupId/matches', tournamentController.getGroupMatches);
router.post('/matches', tournamentController.createMatch);
router.put('/matches/:id', tournamentController.updateMatch);
router.delete('/matches/:id', tournamentController.deleteMatch);

// Standings
router.get('/groups/:groupId/standings', tournamentController.getStandings);

// Knockout Matches
router.get('/knockout-matches', tournamentController.getKnockoutMatches);
router.post('/knockout-matches', tournamentController.createKnockoutMatch);
router.put('/knockout-matches/:id', tournamentController.updateKnockoutMatch);
router.delete('/knockout-matches/:id', tournamentController.deleteKnockoutMatch);

module.exports = router;
