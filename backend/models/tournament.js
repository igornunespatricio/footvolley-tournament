const pool = require('../db');

// Groups
const getAllGroups = async () => {
  const result = await pool.query('SELECT * FROM groups ORDER BY id');
  return result.rows;
};

const getGroupById = async (id) => {
  const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
  return result.rows[0];
};

// Teams
const getAllTeams = async () => {
  const result = await pool.query('SELECT * FROM teams ORDER BY group_id, name');
  return result.rows;
};

const getTeamsByGroup = async (groupId) => {
  const result = await pool.query(
    'SELECT * FROM teams WHERE group_id = $1 ORDER BY name',
    [groupId]
  );
  return result.rows;
};

const getTeamById = async (id) => {
  const result = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
  return result.rows[0];
};

// Group Matches
const getGroupMatches = async (groupId) => {
  const result = await pool.query(
    `SELECT gm.*, 
            t1.name as team_a_name, 
            t2.name as team_b_name
     FROM group_matches gm
     LEFT JOIN teams t1 ON gm.team_a_id = t1.id
     LEFT JOIN teams t2 ON gm.team_b_id = t2.id
     WHERE gm.group_id = $1
     ORDER BY gm.id`,
    [groupId]
  );
  return result.rows;
};

const getMatchById = async (id) => {
  const result = await pool.query(
    `SELECT gm.*, 
            t1.name as team_a_name, 
            t2.name as team_b_name
     FROM group_matches gm
     LEFT JOIN teams t1 ON gm.team_a_id = t1.id
     LEFT JOIN teams t2 ON gm.team_b_id = t2.id
     WHERE gm.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateMatch = async (id, scoreA, scoreB, status) => {
  const result = await pool.query(
    `UPDATE group_matches 
     SET score_a = $1, score_b = $2, status = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [scoreA, scoreB, status, id]
  );
  await updateStandings(result.rows[0]);
  return result.rows[0];
};

const deleteMatch = async (id) => {
  const match = await getMatchById(id);
  if (match) {
    // Reset standings for both teams
    const team1Result = await pool.query(
      'SELECT group_id FROM teams WHERE id = $1',
      [match.team_a_id]
    );
    const groupId = team1Result.rows[0].group_id;
    await recalculateStandings(groupId);
  }
  
  const result = await pool.query(
    'DELETE FROM group_matches WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

const createMatch = async (groupId, teamAId, teamBId) => {
  const result = await pool.query(
    `INSERT INTO group_matches (group_id, team_a_id, team_b_id, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [groupId, teamAId, teamBId]
  );
  return result.rows[0];
};

// Standings
const getStandings = async (groupId) => {
  const result = await pool.query(
    `SELECT s.*, t.name as team_name
     FROM standings s
     JOIN teams t ON s.team_id = t.id
     WHERE s.group_id = $1
     ORDER BY s.points DESC, s.goals_for DESC`,
    [groupId]
  );
  return result.rows;
};

const updateStandings = async (match) => {
  const groupId = match.group_id;
  
  // Recalculate all standings for the group
  await recalculateStandings(groupId);
};

const recalculateStandings = async (groupId) => {
  const matches = await pool.query(
    'SELECT * FROM group_matches WHERE group_id = $1 AND status = $2',
    [groupId, 'completed']
  );

  const teams = await pool.query(
    'SELECT id FROM teams WHERE group_id = $1',
    [groupId]
  );

  // Reset standings
  for (const team of teams.rows) {
    await pool.query(
      `UPDATE standings 
       SET wins = 0, losses = 0, goals_for = 0, goals_against = 0, points = 0, position = NULL
       WHERE group_id = $1 AND team_id = $2`,
      [groupId, team.id]
    );
  }

  // Recalculate from completed matches
  for (const match of matches.rows) {
    const teamAWins = match.score_a > match.score_b ? 1 : 0;
    const teamBWins = match.score_b > match.score_a ? 1 : 0;
    const teamALosses = match.score_a < match.score_b ? 1 : 0;
    const teamBLosses = match.score_b < match.score_a ? 1 : 0;

    // Update team A
    await pool.query(
      `UPDATE standings 
       SET wins = wins + $1,
           losses = losses + $2,
           goals_for = goals_for + $3,
           goals_against = goals_against + $4,
           points = points + $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE group_id = $6 AND team_id = $7`,
      [teamAWins, teamALosses, match.score_a, match.score_b, teamAWins * 3, groupId, match.team_a_id]
    );

    // Update team B
    await pool.query(
      `UPDATE standings 
       SET wins = wins + $1,
           losses = losses + $2,
           goals_for = goals_for + $3,
           goals_against = goals_against + $4,
           points = points + $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE group_id = $6 AND team_id = $7`,
      [teamBWins, teamBLosses, match.score_b, match.score_a, teamBWins * 3, groupId, match.team_b_id]
    );
  }

  // Update positions based on ranking (points DESC, goals_for DESC)
  const standings = await pool.query(
    `SELECT id FROM standings 
     WHERE group_id = $1 
     ORDER BY points DESC, goals_for DESC`,
    [groupId]
  );

  for (let i = 0; i < standings.rows.length; i++) {
    await pool.query(
      `UPDATE standings SET position = $1 WHERE id = $2`,
      [i + 1, standings.rows[i].id]
    );
  }
};

// Knockout Matches
const getKnockoutMatches = async (stage = null) => {
  let query = `SELECT km.*, 
                      t1.name as team_a_name, 
                      t2.name as team_b_name,
                      tw.name as winner_name
               FROM knockout_matches km
               LEFT JOIN teams t1 ON km.team_a_id = t1.id
               LEFT JOIN teams t2 ON km.team_b_id = t2.id
               LEFT JOIN teams tw ON km.winner_id = tw.id`;
  
  const params = [];
  if (stage) {
    query += ' WHERE km.stage = $1';
    params.push(stage);
  }
  
  query += ' ORDER BY km.id';
  const result = await pool.query(query, params);
  return result.rows;
};

const getKnockoutMatchById = async (id) => {
  const result = await pool.query(
    `SELECT km.*, 
            t1.name as team_a_name, 
            t2.name as team_b_name,
            tw.name as winner_name
     FROM knockout_matches km
     LEFT JOIN teams t1 ON km.team_a_id = t1.id
     LEFT JOIN teams t2 ON km.team_b_id = t2.id
     LEFT JOIN teams tw ON km.winner_id = tw.id
     WHERE km.id = $1`,
    [id]
  );
  return result.rows[0];
};

const createKnockoutMatch = async (stage, teamAId = null, teamBId = null) => {
  const result = await pool.query(
    `INSERT INTO knockout_matches (stage, team_a_id, team_b_id, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [stage, teamAId, teamBId]
  );
  return result.rows[0];
};

const updateKnockoutMatch = async (id, scoreA, scoreB, status, winnerId) => {
  const result = await pool.query(
    `UPDATE knockout_matches 
     SET score_a = $1, score_b = $2, status = $3, winner_id = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [scoreA, scoreB, status, winnerId, id]
  );
  return result.rows[0];
};

const deleteKnockoutMatch = async (id) => {
  const result = await pool.query(
    'DELETE FROM knockout_matches WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

// Handle knockout match completion and progression (QF → SF → F)
const handleKnockoutMatchCompletion = async (matchId) => {
  const match = await getKnockoutMatchById(matchId);
  
  if (match.status !== 'completed' || !match.winner_id) {
    return null;
  }

  if (match.stage === 'quarterfinal') {
    // Check if all quarterfinals are complete
    const qfMatches = await pool.query(`
      SELECT * FROM knockout_matches WHERE stage = 'quarterfinal'
    `);
    
    const allQFComplete = qfMatches.rows.every(m => m.status === 'completed');
    
    if (allQFComplete) {
      // Auto-populate semifinals with winners
      const sfMatches = await pool.query(`
        SELECT * FROM knockout_matches WHERE stage = 'semifinal' ORDER BY id
      `);

      const winners = qfMatches.rows
        .sort((a, b) => a.id - b.id)
        .map(m => m.winner_id);

      // SF pairings: QF1 winner vs QF2 winner (SF1), QF3 winner vs QF4 winner (SF2)
      for (let i = 0; i < sfMatches.rows.length && i < 2; i++) {
        await pool.query(
          `UPDATE knockout_matches 
           SET team_a_id = $1, team_b_id = $2 
           WHERE id = $3`,
          [winners[i * 2], winners[i * 2 + 1], sfMatches.rows[i].id]
        );
      }

      return { stage: 'quarterfinal', nextStage: 'semifinal', populated: true };
    }
  } else if (match.stage === 'semifinal') {
    // Check if all semifinals are complete
    const sfMatches = await pool.query(`
      SELECT * FROM knockout_matches WHERE stage = 'semifinal'
    `);
    
    const allSFComplete = sfMatches.rows.every(m => m.status === 'completed');
    
    if (allSFComplete) {
      // Auto-populate final with winners
      const finalMatch = await pool.query(`
        SELECT * FROM knockout_matches WHERE stage = 'final'
      `);

      const winners = sfMatches.rows
        .sort((a, b) => a.id - b.id)
        .map(m => m.winner_id);

      // Final pairing: SF1 winner vs SF2 winner
      await pool.query(
        `UPDATE knockout_matches 
         SET team_a_id = $1, team_b_id = $2 
         WHERE id = $3`,
        [winners[0], winners[1], finalMatch.rows[0].id]
      );

      return { stage: 'semifinal', nextStage: 'final', populated: true };
    }
  }

  return null;
};

module.exports = {
  // Groups
  getAllGroups,
  getGroupById,
  // Teams
  getAllTeams,
  getTeamsByGroup,
  getTeamById,
  // Group Matches
  getGroupMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  createMatch,
  // Standings
  getStandings,
  updateStandings,
  recalculateStandings,
  // Knockout
  getKnockoutMatches,
  getKnockoutMatchById,
  createKnockoutMatch,
  updateKnockoutMatch,
  deleteKnockoutMatch,
  handleKnockoutMatchCompletion,
};
