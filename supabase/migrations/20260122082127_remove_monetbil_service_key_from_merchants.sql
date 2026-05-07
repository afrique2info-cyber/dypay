/*
  # Suppression de la configuration externe individuelle des marchands

  1. Modifications
    - Suppression de la colonne `monetbil_service_key` de la table `merchants`

  2. Raison
    - Les marchands n'ont plus besoin de leur propre configuration de paiement
    - Dypay gère tous les paiements avec sa propre infrastructure
    - Les marchands utilisent uniquement les clés API Dypay

  3. Impact
    - Simplifie l'onboarding des marchands
    - Centralise la gestion des paiements via Dypay
    - Interface unifiée pour tous les marchands
*/

-- Supprimer la colonne monetbil_service_key de la table merchants
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'monetbil_service_key'
  ) THEN
    ALTER TABLE merchants DROP COLUMN monetbil_service_key;
  END IF;
END $$;
