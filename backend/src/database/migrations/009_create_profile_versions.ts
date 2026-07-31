export const up = `
  CREATE TABLE IF NOT EXISTS profile_versions (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PUBLISHED',
    
    -- Snapshot fields
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    portrait VARCHAR(255),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    
    -- JSONB Snapshot
    data JSONB DEFAULT '{}',
    
    -- Metadata
    change_summary TEXT,
    review_notes TEXT,
    created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS current_version_id INTEGER REFERENCES profile_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS latest_version_number INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS change_summary TEXT;
`;

export const down = `
  ALTER TABLE profiles 
  DROP COLUMN IF EXISTS current_version_id,
  DROP COLUMN IF EXISTS latest_version_number,
  DROP COLUMN IF EXISTS is_published,
  DROP COLUMN IF EXISTS submitted_at,
  DROP COLUMN IF EXISTS last_published_at,
  DROP COLUMN IF EXISTS change_summary;

  DROP TABLE IF EXISTS profile_versions;
`;
