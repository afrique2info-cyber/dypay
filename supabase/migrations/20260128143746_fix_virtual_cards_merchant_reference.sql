/*
  # Corriger la référence merchant_id dans virtual_cards

  1. Changements
    - Modifier virtual_cards.merchant_id pour référencer merchants(id) au lieu de auth.users(id)
    - Modifier card_transactions.merchant_id pour référencer merchants(id)
    - Mettre à jour les policies RLS pour utiliser la table merchants correctement
  
  2. Sécurité
    - Les policies vérifient maintenant que auth.uid() correspond au merchant via la table merchants
    - Meilleure séparation entre utilisateurs auth et marchands
*/

-- Supprimer les anciennes contraintes de clé étrangère
ALTER TABLE IF EXISTS virtual_cards DROP CONSTRAINT IF EXISTS virtual_cards_merchant_id_fkey;
ALTER TABLE IF EXISTS card_transactions DROP CONSTRAINT IF EXISTS card_transactions_merchant_id_fkey;

-- Ajouter de nouvelles contraintes référençant merchants(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merchants') THEN
    ALTER TABLE virtual_cards 
    ADD CONSTRAINT virtual_cards_merchant_id_fkey 
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

    ALTER TABLE card_transactions 
    ADD CONSTRAINT card_transactions_merchant_id_fkey 
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Merchants can view own virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Merchants can create virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Merchants can update own virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Merchants can delete own virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Merchants can view own card transactions" ON card_transactions;
DROP POLICY IF EXISTS "Merchants can create card transactions" ON card_transactions;

-- Créer de nouvelles policies avec la logique correcte
CREATE POLICY "Merchants can view own virtual cards"
  ON virtual_cards FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can create virtual cards"
  ON virtual_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update own virtual cards"
  ON virtual_cards FOR UPDATE
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

CREATE POLICY "Merchants can delete own virtual cards"
  ON virtual_cards FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can view own card transactions"
  ON card_transactions FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can create card transactions"
  ON card_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );
