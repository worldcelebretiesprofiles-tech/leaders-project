import { query } from "../db";

async function check() {
  const r = await query(`
    SELECT p.id, p.name, p.slug, pe.is_published, pe.status
    FROM profiles p 
    LEFT JOIN professional_expertise pe ON p.id = pe.profile_id 
  `);
  console.log(r.rows);
  process.exit(0);
}

check();

