/*
  # Système de Webhooks pour Marchands

  1. Nouvelle Table
    - `merchant_webhooks` : Configuration des webhooks pour chaque marchand
      - `id` (uuid, primary key)
      - `merchant_id` (uuid, foreign key vers merchants)
      - `url` (text) : URL où envoyer les notifications
      - `events` (text[]) : Types d'événements à notifier
      - `secret` (text) : Secret pour signer les requêtes webhook
      - `is_active` (boolean) : Statut du webhook
      - `last_triggered_at` (timestamptz) : Dernière notification envoyée
      - `last_response_status` (integer) : Code HTTP de la dernière réponse
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `merchant_webhooks`
    - Les marchands ne peuvent voir/gérer que leurs propres webhooks

  3. Événements Supportés
    - payment.completed : Paiement complété
    - payment.failed : Paiement échoué
    - order.completed : Commande complétée
    - order.cancelled : Commande annulée
    - pos.transaction.completed : Transaction POS complétée
    - withdrawal.completed : Retrait complété
*/

-- Création de la table merchant_webhooks
CREATE TABLE IF NOT EXISTS merchant_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  last_response_status integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_url CHECK (url ~ '^https?://.*')
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_merchant_webhooks_merchant_id ON merchant_webhooks(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_webhooks_active ON merchant_webhooks(merchant_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE merchant_webhooks ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres webhooks
CREATE POLICY "Merchants can view own webhooks"
  ON merchant_webhooks
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Politique pour créer ses webhooks
CREATE POLICY "Merchants can create own webhooks"
  ON merchant_webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Politique pour mettre à jour ses webhooks
CREATE POLICY "Merchants can update own webhooks"
  ON merchant_webhooks
  FOR UPDATE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Politique pour supprimer ses webhooks
CREATE POLICY "Merchants can delete own webhooks"
  ON merchant_webhooks
  FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_merchant_webhooks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_merchant_webhooks_timestamp_trigger ON merchant_webhooks;
CREATE TRIGGER update_merchant_webhooks_timestamp_trigger
  BEFORE UPDATE ON merchant_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_webhooks_timestamp();