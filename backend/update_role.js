const { query } = require('./dist/database/db.js');
query("INSERT INTO app_users (auth_user_id, email, role, status) VALUES ('b00de445-ca81-42e6-a25d-f905174853e1', 'newuser@leader.com', 'SUPER_ADMIN', 'ACTIVE') ON CONFLICT (auth_user_id) DO UPDATE SET role = 'SUPER_ADMIN' RETURNING *")
  .then((res) => console.log('Inserted/Updated user:', res.rows))
  .catch(console.error);
