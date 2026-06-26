/**
 * Migration 004: Update Professional Expertise Schema for Specifications
 */

export const up = `
  ALTER TABLE professional_expertise 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS published_by VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_types JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS professional_journey JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS current_activities JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS how_i_help JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS services_consultations JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS professional_gallery JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS publications JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS media_interviews JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS organizations_associations JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_collaboration JSONB DEFAULT '{}'::jsonb;
`;

export const down = `
  ALTER TABLE professional_expertise 
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS published_at,
    DROP COLUMN IF EXISTS published_by,
    DROP COLUMN IF EXISTS section_visibility,
    DROP COLUMN IF EXISTS contact_types,
    DROP COLUMN IF EXISTS professional_journey,
    DROP COLUMN IF EXISTS current_activities,
    DROP COLUMN IF EXISTS how_i_help,
    DROP COLUMN IF EXISTS services_consultations,
    DROP COLUMN IF EXISTS professional_gallery,
    DROP COLUMN IF EXISTS publications,
    DROP COLUMN IF EXISTS media_interviews,
    DROP COLUMN IF EXISTS testimonials,
    DROP COLUMN IF EXISTS organizations_associations,
    DROP COLUMN IF EXISTS contact_collaboration;
`;
