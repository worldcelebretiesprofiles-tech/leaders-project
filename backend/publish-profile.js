require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.query("UPDATE profiles SET status = 'PUBLISHED' WHERE id = 1");
    console.log("Updated profile status to PUBLISHED!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
