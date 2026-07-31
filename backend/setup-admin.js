const { query } = require('./dist/database/db.js');
const sql = `INSERT INTO app_users (auth_user_id, email, role, status) VALUES ('b00de445-ca81-42e6-a25d-f905174853e1', 'admin@admin.com', 'SUPER_ADMIN', 'ACTIVE') ON CONFLICT (auth_user_id) DO UPDATE SET role = 'SUPER_ADMIN';`;

query(sql)
  .then(() => {
    console.log('Admin user added');
    process.exit(0);
  })
  .catch(console.error);
