/**
 * Migration 005: Create Family Details Schema
 */

export const up = `
  CREATE TABLE IF NOT EXISTS family_details (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    father_name VARCHAR(255) DEFAULT '',
    mother_name VARCHAR(255) DEFAULT '',
    spouse_name VARCHAR(255) DEFAULT '',
    children JSONB DEFAULT '[]'::jsonb,
    background TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_family_details_profile_id ON family_details(profile_id);
`;

export const down = `
  DROP INDEX IF EXISTS idx_family_details_profile_id;
  DROP TABLE IF EXISTS family_details;
`;
