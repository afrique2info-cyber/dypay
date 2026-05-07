/*
  # Ajouter policy pour les paiements des marchands

  1. Changements
    - Ajouter une policy permettant aux marchands authentifiés de voir leurs propres paiements
    - Les marchands peuvent voir les paiements liés à leur merchant_id
  
  2. Sécurité
    - Les marchands ne peuvent voir que leurs propres paiements
    - Utilise la relation merchants.auth_id = auth.uid() pour vérifier l'identité
*/

-- Policy: Les marchands peuvent voir leurs propres paiements
CREATE POLICY "Merchants can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );
