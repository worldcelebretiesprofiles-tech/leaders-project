/**
 * Migration 012: Drop legacy admins table
 */

export const up = `
  DROP TABLE IF EXISTS admins CASCADE;
`;

export const down = `
  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
