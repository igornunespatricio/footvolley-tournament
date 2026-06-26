const { Pool } = require('pg');
require('dotenv').config();

const buildConnectionString = () => {
  const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
    return process.env.DATABASE_URL;
  }

  const databaseUrl = new URL('postgresql://localhost');
  databaseUrl.username = DB_USER;
  databaseUrl.password = DB_PASSWORD;
  databaseUrl.hostname = process.env.DB_HOST || 'localhost';
  databaseUrl.port = process.env.DB_PORT || '5432';
  databaseUrl.pathname = `/${DB_NAME}`;

  return databaseUrl.toString();
};

const connectionString = buildConnectionString();

if (!connectionString) {
  throw new Error(
    'Missing database configuration. Set DB_USER, DB_PASSWORD, DB_NAME, and optional DB_HOST/DB_PORT, or provide DATABASE_URL.'
  );
}

const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
