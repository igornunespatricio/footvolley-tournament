const pool = require('../db');

const seedData = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding tournament data...');

    // Insert groups
    const groupsResult = await client.query(`
      INSERT INTO groups (name) VALUES
      ('Grupo 1'),
      ('Grupo 2'),
      ('Grupo 3')
      RETURNING id, name;
    `);
    console.log('✅ Groups inserted');

    // Insert teams
    const teamsData = [
      // Grupo 1
      { name: 'Patrick e Caiafa', group: 'Grupo 1' },
      { name: 'Andresil e MG10', group: 'Grupo 1' },
      { name: 'Simão e Vinicius', group: 'Grupo 1' },
      { name: 'ET e PP', group: 'Grupo 1' },
      // Grupo 2
      { name: 'Sérgio e João', group: 'Grupo 2' },
      { name: 'Brunão e Edu', group: 'Grupo 2' },
      { name: 'Sávio e Dani', group: 'Grupo 2' },
      { name: 'Adjan e Caue', group: 'Grupo 2' },
      // Grupo 3
      { name: 'Igor e Nilo', group: 'Grupo 3' },
      { name: 'Pinha e Toco', group: 'Grupo 3' },
      { name: 'Caio e Cachaça', group: 'Grupo 3' },
      { name: 'Romero e Gui', group: 'Grupo 3' },
    ];

    const groupMap = {};
    groupsResult.rows.forEach(row => {
      groupMap[row.name] = row.id;
    });

    for (const team of teamsData) {
      await client.query(
        'INSERT INTO teams (name, group_id) VALUES ($1, $2)',
        [team.name, groupMap[team.group]]
      );
    }
    console.log('✅ Teams inserted');

    // Get teams for creating matches
    const teamsResult = await client.query(`
      SELECT id, name, group_id FROM teams ORDER BY group_id, name;
    `);

    const teamsByGroup = {};
    teamsResult.rows.forEach(team => {
      if (!teamsByGroup[team.group_id]) {
        teamsByGroup[team.group_id] = [];
      }
      teamsByGroup[team.group_id].push(team);
    });

    // Create round-robin matches for each group
    for (const groupId in teamsByGroup) {
      const teamsInGroup = teamsByGroup[groupId];
      for (let i = 0; i < teamsInGroup.length; i++) {
        for (let j = i + 1; j < teamsInGroup.length; j++) {
          await client.query(
            `INSERT INTO group_matches (group_id, team_a_id, team_b_id, status)
             VALUES ($1, $2, $3, 'pending')`,
            [groupId, teamsInGroup[i].id, teamsInGroup[j].id]
          );
        }
      }
    }
    console.log('✅ Group matches created');

    // Initialize standings for all teams
    for (const team of teamsResult.rows) {
      await client.query(
        `INSERT INTO standings (group_id, team_id, wins, losses, goals_for, goals_against, points, position)
         VALUES ($1, $2, 0, 0, 0, 0, 0, 0)`,
        [team.group_id, team.id]
      );
    }
    console.log('✅ Standings initialized');

    console.log('✅ Database seeding completed successfully');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    console.log('Seeding finished');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
