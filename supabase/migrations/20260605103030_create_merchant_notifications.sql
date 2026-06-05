-- Create merchant notifications table
CREATE TABLE IF NOT EXISTS merchant_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_notifications_merchant_id ON merchant_notifications(merchant_id);
CREATE INDEX idx_notifications_merchant_read ON merchant_notifications(merchant_id, read);
CREATE INDEX idx_notifications_created_at ON merchant_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE merchant_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: merchants can only see/manage their own notifications
CREATE POLICY "select_own_notifications" ON merchant_notifications FOR SELECT
  TO authenticated USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_id = auth.uid())
  );

CREATE POLICY "insert_own_notifications" ON merchant_notifications FOR INSERT
  TO authenticated WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE auth_id = auth.uid())
  );

CREATE POLICY "update_own_notifications" ON merchant_notifications FOR UPDATE
  TO authenticated USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_id = auth.uid())
  ) WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE auth_id = auth.uid())
  );

CREATE POLICY "delete_own_notifications" ON merchant_notifications FOR DELETE
  TO authenticated USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_id = auth.uid())
  );

-- Allow service role to insert notifications (for edge functions)
CREATE POLICY "service_role_insert_notifications" ON merchant_notifications FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "service_role_select_notifications" ON merchant_notifications FOR SELECT
  TO service_role USING (true);