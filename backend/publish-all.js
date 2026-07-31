const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/global_leader_sphere' });
const sql = `UPDATE profiles SET is_published = true, status = 'PUBLISHED'`;
pool.query(sql).then(res => { 
  console.log('Profiles published!'); 
  pool.end(); 
}).catch(console.error);
