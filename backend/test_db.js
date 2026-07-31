const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/CodeBase/RBR profile/global-leader-sphere-main/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const res = await pool.query('SELECT id, first_name, last_name, status FROM applications');
  console.log(res.rows);
  pool.end();
}
run();
