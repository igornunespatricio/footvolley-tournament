const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament');
const knockoutController = require('../controllers/knockout');

// Groups
router.get('/groups', tournamentController.getAllGroups);
router.get('/groups/:groupId', tournamentController.getGroupDetails);

// Teams
router.get('/teams', tournamentController.getAllTeams);

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

// Knockout Bracket Generation
router.get('/qualified-teams', knockoutController.getQualifiedTeams);
router.post('/create-knockout-bracket', knockoutController.createKnockoutBracket);

module.exports = router;
