const pool = require('../db');

// Get top 2 teams from each group for knockout
const getQualifiedTeams = async () => {
  const result = await pool.query(`
    SELECT s.*, t.name as team_name, g.name as group_name
    FROM standings s
    JOIN teams t ON s.team_id = t.id
    JOIN groups g ON s.group_id = g.id
    WHERE s.position <= 2
    ORDER BY s.group_id, s.position
  `);
  return result.rows;
};

// Auto-create knockout matches from qualified teams
const createKnockoutBracket = async () => {
  try {
    const qualified = await getQualifiedTeams();
    
    if (qualified.length < 4) {
      throw new Error('Not enough qualified teams for knockout stage');
    }

    // Group by group
    const byGroup = {};
    qualified.forEach(team => {
      if (!byGroup[team.group_id]) {
        byGroup[team.group_id] = [];
      }
      byGroup[team.group_id].push(team);
    });

    const groups = Object.keys(byGroup).map(id => parseInt(id)).sort();

    if (groups.length < 2) {
      throw new Error('Not enough groups for knockout stage');
    }

    // Pair teams for semifinals (cross-group)
    // SF1: 1st Group 1 vs 2nd Group 2
    // SF2: 1st Group 2 vs 2nd Group 1 (or 1st Group 3 vs 2nd Group 1 for 3 groups)
    // SF3: 1st Group 3 vs 2nd Group 3 (if exists)
    
    const semifinals = [];
    
    if (groups.length === 2) {
      // 2 groups: SF1 (1st G1 vs 2nd G2), SF2 (1st G2 vs 2nd G1)
      semifinals.push({
        stage: 'semifinal',
        team_a_id: byGroup[groups[0]][0].team_id,
        team_b_id: byGroup[groups[1]][1].team_id,
      });
      semifinals.push({
        stage: 'semifinal',
        team_a_id: byGroup[groups[1]][0].team_id,
        team_b_id: byGroup[groups[0]][1].team_id,
      });
    } else if (groups.length >= 3) {
      // 3+ groups: SF1 (1st G1 vs 2nd G2), SF2 (1st G2 vs 2nd G3), SF3 (1st G3 vs 2nd G1)
      for (let i = 0; i < groups.length; i++) {
        const nextGroup = groups[(i + 1) % groups.length];
        semifinals.push({
          stage: 'semifinal',
          team_a_id: byGroup[groups[i]][0].team_id,
          team_b_id: byGroup[nextGroup][1].team_id,
        });
      }
    }

    // Delete existing knockout matches and create new ones
    await pool.query('DELETE FROM knockout_matches');

    for (const sf of semifinals) {
      await pool.query(
        `INSERT INTO knockout_matches (stage, team_a_id, team_b_id, status)
         VALUES ($1, $2, $3, 'pending')`,
        [sf.stage, sf.team_a_id, sf.team_b_id]
      );
    }

    // Create empty final match
    await pool.query(
      `INSERT INTO knockout_matches (stage, status)
       VALUES ('final', 'pending')`
    );

    return {
      success: true,
      message: `Knockout bracket created with ${semifinals.length} semifinals`,
      semifinals,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getQualifiedTeams,
  createKnockoutBracket,
};
