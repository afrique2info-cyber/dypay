-- Add SMS and WhatsApp notification preferences to merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS notification_phone VARCHAR(20);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS whatsapp_notifications_enabled BOOLEAN DEFAULT false;

-- Allow service role to read notification preferences (for edge functions)
CREATE POLICY "service_role_select_merchants_notifications" ON merchants FOR SELECT
  TO service_role USING (true);