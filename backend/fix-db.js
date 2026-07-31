const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/global_leader_sphere' });
const sql = `
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_version_id INTEGER, 
ADD COLUMN IF NOT EXISTS latest_version_number INTEGER DEFAULT 0, 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE, 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP, 
ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMP, 
ADD COLUMN IF NOT EXISTS change_summary TEXT, 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';
`;
pool.query(sql).then(res => { 
  console.log('Columns added!'); 
  pool.end(); 
}).catch(console.error);
