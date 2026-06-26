const pool = require('../db');

const schema = `
-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group matches table
CREATE TABLE IF NOT EXISTS group_matches (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  team_a_id INTEGER NOT NULL REFERENCES teams(id),
  team_b_id INTEGER NOT NULL REFERENCES teams(id),
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  position INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, team_id)
);

-- Knockout matches table
CREATE TABLE IF NOT EXISTS knockout_matches (
  id SERIAL PRIMARY KEY,
  stage VARCHAR(50) NOT NULL,
  team_a_id INTEGER REFERENCES teams(id),
  team_b_id INTEGER REFERENCES teams(id),
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  winner_id INTEGER REFERENCES teams(id),
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const teamsData = [
  { name: 'Patrick e Caiafa', group: 'Grupo 1' },
  { name: 'Andresil e MG10', group: 'Grupo 1' },
  { name: 'Simão e Vinicius', group: 'Grupo 1' },
  { name: 'ET e PP', group: 'Grupo 1' },
  { name: 'Sérgio e João', group: 'Grupo 2' },
  { name: 'Brunão e Edu', group: 'Grupo 2' },
  { name: 'Sávio e Dani', group: 'Grupo 2' },
  { name: 'Adjan e Caue', group: 'Grupo 2' },
  { name: 'Igor e Nilo', group: 'Grupo 3' },
  { name: 'Pinha e Toco', group: 'Grupo 3' },
  { name: 'Caio e Cachaça', group: 'Grupo 3' },
  { name: 'Romero e Gui', group: 'Grupo 3' },
];

const runMigration = async (client = pool) => {
  await client.query(schema);
};

const seedDatabase = async (client = pool) => {
  const groupsResult = await client.query(`
    INSERT INTO groups (name) VALUES
    ('Grupo 1'),
    ('Grupo 2'),
    ('Grupo 3')
    RETURNING id, name;
  `);

  const groupMap = Object.fromEntries(
    groupsResult.rows.map(({ id, name }) => [name, id])
  );

  for (const team of teamsData) {
    await client.query(
      'INSERT INTO teams (name, group_id) VALUES ($1, $2)',
      [team.name, groupMap[team.group]]
    );
  }

  const teamsResult = await client.query(`
    SELECT id, group_id FROM teams ORDER BY group_id, name;
  `);

  const teamsByGroup = teamsResult.rows.reduce((groups, team) => {
    if (!groups[team.group_id]) {
      groups[team.group_id] = [];
    }

    groups[team.group_id].push(team);
    return groups;
  }, {});

  for (const [groupId, teamsInGroup] of Object.entries(teamsByGroup)) {
    for (let i = 0; i < teamsInGroup.length; i += 1) {
      for (let j = i + 1; j < teamsInGroup.length; j += 1) {
        await client.query(
          `INSERT INTO group_matches (group_id, team_a_id, team_b_id, status)
           VALUES ($1, $2, $3, 'pending')`,
          [groupId, teamsInGroup[i].id, teamsInGroup[j].id]
        );
      }
    }
  }

  for (const [groupId, teamsInGroup] of Object.entries(teamsByGroup)) {
    for (let i = 0; i < teamsInGroup.length; i += 1) {
      await client.query(
        `INSERT INTO standings (group_id, team_id, wins, losses, goals_for, goals_against, points, position)
         VALUES ($1, $2, 0, 0, 0, 0, 0, $3)`,
        [groupId, teamsInGroup[i].id, i + 1]
      );
    }
  }
};

const databaseNeedsSeeding = async (client = pool) => {
  const result = await client.query('SELECT COUNT(*)::int AS count FROM groups');
  return result.rows[0].count === 0;
};

const ensureDatabaseReady = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await runMigration(client);

    if (await databaseNeedsSeeding(client)) {
      await seedDatabase(client);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  runMigration,
  seedDatabase,
  databaseNeedsSeeding,
  ensureDatabaseReady,
};
