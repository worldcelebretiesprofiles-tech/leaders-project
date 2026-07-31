require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tables = tableRes.rows.map(x => x.table_name);
    console.log('Tables:', tables);

    if (tables.includes('profiles')) {
      const profileCountRes = await pool.query("SELECT count(*) FROM profiles");
      console.log('Profile count:', profileCountRes.rows[0].count);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
