/**
 * Migration 008: Link Profiles to Users and Add Status
 */

export const up = `
  ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';

  -- For existing profiles, assume they are published if they have a slug
  UPDATE profiles SET status = 'PUBLISHED' WHERE status = 'DRAFT' AND slug IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON profiles(owner_id);
  CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
`;

export const down = `
  DROP INDEX IF EXISTS idx_profiles_status;
  DROP INDEX IF EXISTS idx_profiles_owner_id;

  ALTER TABLE profiles
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS owner_id;
`;
