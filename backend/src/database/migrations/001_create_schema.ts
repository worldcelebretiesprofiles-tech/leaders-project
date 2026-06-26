/**
 * Migration 001: Create Schema
 */

export const up = `
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_subcategory UNIQUE (category_id, name)
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    portrait VARCHAR(500),
    data JSONB NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
  CREATE INDEX IF NOT EXISTS idx_profiles_category_id ON profiles(category_id);
  CREATE INDEX IF NOT EXISTS idx_profiles_subcategory_id ON profiles(subcategory_id);
`;

export const down = `
  DROP INDEX IF EXISTS idx_profiles_subcategory_id;
  DROP INDEX IF EXISTS idx_profiles_category_id;
  DROP INDEX IF EXISTS idx_profiles_slug;
  DROP TABLE IF EXISTS profiles;
  DROP TABLE IF EXISTS subcategories;
  DROP TABLE IF EXISTS categories;
`;
