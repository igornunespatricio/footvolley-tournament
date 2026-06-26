const pool = require('../db');

// Get 8 qualified teams: Top 2 from each group (6 teams) + Best 2 third-place teams (2 teams)
const getQualifiedTeams = async () => {
  // Get top 2 teams from each group
  const top2Result = await pool.query(`
    SELECT s.*, t.name as team_name, g.name as group_name, 'group_1st_or_2nd' as qualification_type
    FROM standings s
    JOIN teams t ON s.team_id = t.id
    JOIN groups g ON s.group_id = g.id
    WHERE s.position <= 2
    ORDER BY s.group_id, s.position
  `);

  const top2Teams = top2Result.rows;

  // Get all third-place teams and sort by points (descending) and goals_for (descending)
  const thirdPlaceResult = await pool.query(`
    SELECT s.*, t.name as team_name, g.name as group_name, 'group_3rd' as qualification_type
    FROM standings s
    JOIN teams t ON s.team_id = t.id
    JOIN groups g ON s.group_id = g.id
    WHERE s.position = 3
    ORDER BY s.points DESC, s.goals_for DESC
  `);

  const thirdPlaceTeams = thirdPlaceResult.rows;

  // Get best 2 third-place teams
  const best2ThirdPlace = thirdPlaceTeams.slice(0, 2);

  // Combine and sort for bracket seeding
  const qualified = [...top2Teams, ...best2ThirdPlace];

  // Sort by qualification type (1st/2nd first) and then by ranking within type
  qualified.sort((a, b) => {
    if (a.qualification_type !== b.qualification_type) {
      return a.qualification_type === 'group_1st_or_2nd' ? -1 : 1;
    }
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // For third-place teams with same position, sort by points then goals_for
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.goals_for - a.goals_for;
  });

  return qualified;
};

// Auto-create knockout matches from qualified teams (8 teams → 4 QF → 2 SF → 1 F)
const createKnockoutBracket = async () => {
  try {
    const qualified = await getQualifiedTeams();

    if (qualified.length < 8) {
      throw new Error(`Not enough qualified teams for knockout stage. Expected 8, got ${qualified.length}`);
    }

    // Delete existing knockout matches
    await pool.query('DELETE FROM knockout_matches');

    // Seed bracket: 1v8, 4v5, 3v6, 2v7 (standard tournament seeding)
    // Qualified is sorted: [1st places, 2nd places, best 3rd places]
    // We need to rearrange for proper seeding
    const seeded = [];
    const indices = [0, 7, 3, 4, 2, 5, 1, 6]; // Indices to create 1v8, 4v5, 3v6, 2v7
    for (let i = 0; i < 8; i++) {
      seeded.push(qualified[indices[i]]);
    }

    // Create 4 quarterfinal matches
    const quarterfinals = [];
    for (let i = 0; i < 4; i++) {
      const team_a_id = seeded[i * 2].team_id;
      const team_b_id = seeded[i * 2 + 1].team_id;

      const result = await pool.query(
        `INSERT INTO knockout_matches (stage, team_a_id, team_b_id, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        ['quarterfinal', team_a_id, team_b_id]
      );

      quarterfinals.push({
        ...result.rows[0],
        team_a_name: seeded[i * 2].team_name,
        team_b_name: seeded[i * 2 + 1].team_name,
      });
    }

    // Create 2 empty semifinal matches (will be filled as QF matches complete)
    for (let i = 0; i < 2; i++) {
      await pool.query(
        `INSERT INTO knockout_matches (stage, status)
         VALUES ('semifinal', 'pending')`
      );
    }

    // Create 1 empty final match (will be filled as SF matches complete)
    await pool.query(
      `INSERT INTO knockout_matches (stage, status)
       VALUES ('final', 'pending')`
    );

    return {
      success: true,
      message: '8-team knockout bracket created with 4 quarterfinals',
      qualified_teams: qualified.map((t, i) => ({
        seed: i + 1,
        team_id: t.team_id,
        team_name: t.team_name,
        group_name: t.group_name,
        position: t.position,
        qualification_type: t.qualification_type,
        points: t.points,
        wins: t.wins,
        goals_for: t.goals_for,
        goals_against: t.goals_against,
      })),
      quarterfinals: quarterfinals.map(q => ({
        id: q.id,
        team_a_id: q.team_a_id,
        team_a_name: q.team_a_name,
        team_b_id: q.team_b_id,
        team_b_name: q.team_b_name,
        score_a: q.score_a,
        score_b: q.score_b,
        status: q.status,
      })),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getQualifiedTeams,
  createKnockoutBracket,
};
