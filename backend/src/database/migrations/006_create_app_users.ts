/**
 * Migration 006: Create App Users Table
 * Maps Supabase auth users to application-specific roles and metadata.
 */

export const up = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'CLIENT',
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
  );

  CREATE INDEX IF NOT EXISTS idx_app_users_auth_user_id ON app_users(auth_user_id);
  CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
`;

export const down = `
  DROP INDEX IF EXISTS idx_app_users_email;
  DROP INDEX IF EXISTS idx_app_users_auth_user_id;
  DROP TABLE IF EXISTS app_users;
`;
