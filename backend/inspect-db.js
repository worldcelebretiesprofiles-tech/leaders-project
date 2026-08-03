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

    if (tables.includes('app_users')) {
      const usersRes = await pool.query("SELECT id, auth_user_id, email, role, status FROM app_users");
      console.log('App Users in DB:', usersRes.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
