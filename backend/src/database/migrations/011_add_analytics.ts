export const up = `
  CREATE OR REPLACE VIEW dashboard_analytics AS
  SELECT
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM profiles WHERE status = 'PUBLISHED') as published_profiles,
    (SELECT COUNT(*) FROM profiles WHERE status = 'SUBMITTED') as pending_profiles,
    (SELECT COUNT(*) FROM profiles WHERE status = 'DRAFT') as draft_profiles,
    (SELECT COUNT(*) FROM applications) as total_applications,
    (SELECT COUNT(*) FROM applications WHERE status = 'SUBMITTED') as pending_applications;
`;

export const down = `
  DROP VIEW IF EXISTS dashboard_analytics;
`;
