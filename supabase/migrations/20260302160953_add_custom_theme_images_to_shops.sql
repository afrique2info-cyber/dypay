/*
  # Personnalisation des images de thème par boutique

  1. Modifications
    - Ajouter `custom_theme_config` à la table `shops`
    - Permet aux marchands de personnaliser les images et autres éléments du thème

  2. Structure
    - Le champ stockera les surcharges personnalisées (images, couleurs, etc.)
    - Si null ou vide, utilise la configuration du thème par défaut
*/

-- Ajouter le champ custom_theme_config à la table shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'custom_theme_config'
  ) THEN
    ALTER TABLE shops ADD COLUMN custom_theme_config jsonb DEFAULT NULL;
  END IF;
END $$;

-- Commentaire pour la documentation
COMMENT ON COLUMN shops.custom_theme_config IS 'Configuration personnalisée du thème (images, couleurs, etc.). Surcharge la config du thème de base.';
