const { query } = require('./dist/database/db.js');
query("UPDATE app_users SET auth_user_id = '47d90a0c-4699-45b2-8f1d-0ab9ef901a98' WHERE email = 'admin@admin.com'")
  .then(() => console.log('DB Updated'))
  .catch(console.error);
