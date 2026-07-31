export const up = `
  -- 1. Audit Logs Table (Generic)
  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for faster querying
  CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

  -- 2. Notifications Table (Extended)
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    link VARCHAR(255),
    metadata JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Create index on unread notifications
  CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications (user_id) 
  WHERE read_at IS NULL;
`;

export const down = `
  DROP TABLE IF EXISTS notifications CASCADE;
  DROP TABLE IF EXISTS audit_logs CASCADE;
`;
