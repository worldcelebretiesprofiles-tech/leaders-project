require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function main() {
  const hash = await bcrypt.hash('SuperAdminPassword123!', 10);
  console.log("Hash:", hash);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, 'admin']);
    console.log("Admin password updated!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
main();
