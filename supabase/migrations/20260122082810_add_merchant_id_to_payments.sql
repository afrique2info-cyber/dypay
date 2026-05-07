/*
  # Ajouter merchant_id à la table payments

  1. Modifications
    - Ajout de la colonne `merchant_id` à la table `payments`
    - Ajout d'une clé étrangère vers la table `merchants`
    - Ajout d'un index pour améliorer les performances des requêtes
    
  2. Raison
    - Permet de lier chaque paiement à un marchand spécifique
    - Nécessaire pour le traitement des paiements via liens de paiement
    - Permet de suivre les transactions par marchand
*/

-- Ajouter la colonne merchant_id à la table payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'merchant_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN merchant_id uuid REFERENCES merchants(id);
  END IF;
END $$;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_id);

-- Ajouter une politique RLS pour que les marchands puissent voir leurs propres paiements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payments' 
    AND policyname = 'Merchants can view their payments'
  ) THEN
    CREATE POLICY "Merchants can view their payments"
      ON payments
      FOR SELECT
      TO authenticated
      USING (merchant_id IN (
        SELECT id FROM merchants WHERE user_id = auth.uid()
      ));
  END IF;
END $$;
