/**
 * Migration 007: Create Applications Table
 */

export const up = `
  CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    job_title VARCHAR(255),
    linkedin_url VARCHAR(500),
    motivation TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
  CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
`;

export const down = `
  DROP INDEX IF EXISTS idx_applications_status;
  DROP INDEX IF EXISTS idx_applications_email;
  DROP TABLE IF EXISTS applications;
`;
