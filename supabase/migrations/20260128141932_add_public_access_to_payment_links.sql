/*
  # Autoriser l'accès public aux liens de paiement

  1. Changements
    - Ajouter une policy pour permettre aux utilisateurs anonymes (non authentifiés) de consulter les liens de paiement actifs
    - Les clients peuvent maintenant accéder aux liens de paiement partagés sans avoir besoin d'être authentifiés
  
  2. Sécurité
    - Les utilisateurs anonymes peuvent uniquement VOIR les liens actifs (SELECT)
    - Ils ne peuvent pas créer, modifier ou supprimer des liens
    - Seuls les liens actifs (is_active = true) sont accessibles
*/

-- Policy: Permettre l'accès public en lecture aux liens de paiement actifs
CREATE POLICY "Anyone can view active payment links"
  ON payment_links FOR SELECT
  TO anon
  USING (is_active = true);
