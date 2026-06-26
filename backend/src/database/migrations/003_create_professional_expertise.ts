/**
 * Migration 003: Create Professional Expertise Schema
 */

export const up = `
  CREATE TABLE IF NOT EXISTS professional_expertise (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    roles JSONB DEFAULT '[]'::jsonb,
    expertise_areas JSONB DEFAULT '[]'::jsonb,
    services_offered JSONB DEFAULT '[]'::jsonb,
    industries_served JSONB DEFAULT '[]'::jsonb,
    who_i_help JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    years_experience VARCHAR(255) DEFAULT '',
    professional_summary TEXT DEFAULT '',
    keywords JSONB DEFAULT '[]'::jsonb,
    is_available_for_consultation BOOLEAN DEFAULT FALSE,
    cta_text VARCHAR(255) DEFAULT 'Book Consultation',
    impact_statistics JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    featured_services JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_professional_expertise_profile_id ON professional_expertise(profile_id);
`;

export const down = `
  DROP INDEX IF EXISTS idx_professional_expertise_profile_id;
  DROP TABLE IF EXISTS professional_expertise;
`;
