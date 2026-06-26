const pool = require('../db');
const { databaseNeedsSeeding, runMigration, seedDatabase } = require('./bootstrap');

const seedData = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await runMigration(client);

    if (!(await databaseNeedsSeeding(client))) {
      throw new Error('Database already contains groups. Refusing to seed duplicate tournament data.');
    }

    await seedDatabase(client);
    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
