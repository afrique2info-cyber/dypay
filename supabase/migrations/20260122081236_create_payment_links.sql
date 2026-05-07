/*
  # Création de la table des liens de paiement

  1. Nouvelle table
    - `payment_links`
      - `id` (uuid, primary key)
      - `merchant_id` (uuid, foreign key vers merchants)
      - `link_id` (text, identifiant unique du lien)
      - `amount` (numeric, montant du paiement)
      - `currency` (text, devise)
      - `title` (text, titre du lien)
      - `description` (text, description optionnelle)
      - `metadata` (jsonb, métadonnées optionnelles)
      - `is_active` (boolean, lien actif ou désactivé)
      - `expires_at` (timestamptz, date d'expiration optionnelle)
      - `payment_count` (integer, nombre de paiements reçus)
      - `total_received` (numeric, montant total reçu)
      - `created_at` (timestamptz, date de création)
      - `updated_at` (timestamptz, date de mise à jour)

  2. Sécurité
    - Enable RLS on `payment_links` table
    - Add policies for authenticated merchants to manage their own payment links
*/

CREATE TABLE IF NOT EXISTS payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  link_id text UNIQUE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency IN ('XAF', 'XOF', 'CDF', 'UGX', 'LRD', 'GNF')),
  title text NOT NULL,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  payment_count integer DEFAULT 0,
  total_received numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide par link_id
CREATE INDEX IF NOT EXISTS idx_payment_links_link_id ON payment_links(link_id);

-- Index pour recherche par merchant_id
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant_id ON payment_links(merchant_id);

-- Index pour recherche par statut actif
CREATE INDEX IF NOT EXISTS idx_payment_links_is_active ON payment_links(is_active);

-- Enable RLS
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Policy: Les marchands peuvent voir leurs propres liens
CREATE POLICY "Merchants can view own payment links"
  ON payment_links FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Les marchands peuvent créer des liens
CREATE POLICY "Merchants can create payment links"
  ON payment_links FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Les marchands peuvent mettre à jour leurs propres liens
CREATE POLICY "Merchants can update own payment links"
  ON payment_links FOR UPDATE
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

-- Policy: Les marchands peuvent supprimer leurs propres liens
CREATE POLICY "Merchants can delete own payment links"
  ON payment_links FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payment_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS payment_links_updated_at ON payment_links;
CREATE TRIGGER payment_links_updated_at
  BEFORE UPDATE ON payment_links
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_links_updated_at();
