const { query } = require('./dist/database/db.js');
const sql = `UPDATE profiles SET owner_id = (SELECT id FROM app_users WHERE auth_user_id = 'b00de445-ca81-42e6-a25d-f905174853e1') WHERE id = 1;`;

query(sql)
  .then(() => {
    console.log('Profile assigned to admin based on auth_user_id');
    process.exit(0);
  })
  .catch(console.error);
