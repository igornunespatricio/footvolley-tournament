const { runMigration } = require('./bootstrap');

runMigration()
  .then(() => {
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration error:', err);
    process.exit(1);
  });
