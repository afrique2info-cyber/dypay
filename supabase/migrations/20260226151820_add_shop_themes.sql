/*
  # Système de thèmes pour les boutiques

  1. Nouvelles Tables
    - `shop_themes`
      - `id` (uuid, primary key)
      - `name` (text) - Nom du thème
      - `slug` (text, unique) - Identifiant du thème
      - `description` (text) - Description du thème
      - `preview_image` (text) - URL de l'image de prévisualisation
      - `config` (jsonb) - Configuration complète du thème (couleurs, polices, etc.)
      - `is_active` (boolean) - Thème disponible ou non
      - `created_at` (timestamptz)

  2. Modifications
    - Ajouter `theme_id` à la table `shops`
    - Relation foreign key vers `shop_themes`

  3. Sécurité
    - RLS activé sur `shop_themes`
    - Les thèmes sont lisibles par tous (public)
    - Seuls les admins peuvent créer/modifier des thèmes
*/

-- Créer la table des thèmes
CREATE TABLE IF NOT EXISTS shop_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  preview_image text,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ajouter le champ theme_id à la table shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE shops ADD COLUMN theme_id uuid REFERENCES shop_themes(id);
  END IF;
END $$;

-- Activer RLS
ALTER TABLE shop_themes ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique des thèmes actifs
CREATE POLICY "Anyone can view active themes"
  ON shop_themes
  FOR SELECT
  USING (is_active = true);

-- Insérer les thèmes par défaut
INSERT INTO shop_themes (name, slug, description, preview_image, config, is_active) VALUES
(
  'Minimal',
  'minimal',
  'Design épuré et moderne avec focus sur les produits. Parfait pour les boutiques de mode et tech.',
  'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg',
  '{
    "colors": {
      "primary": "#000000",
      "secondary": "#FFFFFF",
      "accent": "#3B82F6",
      "background": "#FFFFFF",
      "surface": "#F9FAFB",
      "text": "#111827",
      "textSecondary": "#6B7280",
      "border": "#E5E7EB"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    },
    "layout": {
      "headerStyle": "minimal",
      "productCardStyle": "clean",
      "spacing": "comfortable",
      "borderRadius": "minimal"
    },
    "components": {
      "buttonStyle": "solid",
      "cardShadow": "none",
      "imageStyle": "cover"
    }
  }',
  true
),
(
  'Modern',
  'modern',
  'Design contemporain avec des gradients et animations. Idéal pour les marques innovantes.',
  'https://images.pexels.com/photos/7679672/pexels-photo-7679672.jpeg',
  '{
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#EC4899",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "surface": "#F3F4F6",
      "text": "#1F2937",
      "textSecondary": "#6B7280",
      "border": "#E5E7EB"
    },
    "fonts": {
      "heading": "Poppins, sans-serif",
      "body": "Inter, sans-serif"
    },
    "layout": {
      "headerStyle": "gradient",
      "productCardStyle": "elevated",
      "spacing": "spacious",
      "borderRadius": "rounded"
    },
    "components": {
      "buttonStyle": "gradient",
      "cardShadow": "medium",
      "imageStyle": "rounded"
    }
  }',
  true
),
(
  'Elegant',
  'elegant',
  'Sophistiqué et luxueux avec typographie élégante. Pour les boutiques haut de gamme.',
  'https://images.pexels.com/photos/6214478/pexels-photo-6214478.jpeg',
  '{
    "colors": {
      "primary": "#92400E",
      "secondary": "#78350F",
      "accent": "#D97706",
      "background": "#FFFBEB",
      "surface": "#FFFFFF",
      "text": "#1C1917",
      "textSecondary": "#78716C",
      "border": "#E7E5E4"
    },
    "fonts": {
      "heading": "Playfair Display, serif",
      "body": "Lora, serif"
    },
    "layout": {
      "headerStyle": "classic",
      "productCardStyle": "bordered",
      "spacing": "generous",
      "borderRadius": "slight"
    },
    "components": {
      "buttonStyle": "outline",
      "cardShadow": "subtle",
      "imageStyle": "framed"
    }
  }',
  true
),
(
  'Bold',
  'bold',
  'Énergique et vibrant avec couleurs vives. Parfait pour les marques jeunes et dynamiques.',
  'https://images.pexels.com/photos/7679673/pexels-photo-7679673.jpeg',
  '{
    "colors": {
      "primary": "#DC2626",
      "secondary": "#EA580C",
      "accent": "#FACC15",
      "background": "#FAFAFA",
      "surface": "#FFFFFF",
      "text": "#0F172A",
      "textSecondary": "#475569",
      "border": "#E2E8F0"
    },
    "fonts": {
      "heading": "Montserrat, sans-serif",
      "body": "Open Sans, sans-serif"
    },
    "layout": {
      "headerStyle": "bold",
      "productCardStyle": "vibrant",
      "spacing": "compact",
      "borderRadius": "rounded"
    },
    "components": {
      "buttonStyle": "solid",
      "cardShadow": "strong",
      "imageStyle": "full"
    }
  }',
  true
),
(
  'Classic',
  'classic',
  'Intemporel et professionnel. Pour les boutiques traditionnelles et établies.',
  'https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg',
  '{
    "colors": {
      "primary": "#1E40AF",
      "secondary": "#1E3A8A",
      "accent": "#2563EB",
      "background": "#F8FAFC",
      "surface": "#FFFFFF",
      "text": "#0F172A",
      "textSecondary": "#475569",
      "border": "#CBD5E1"
    },
    "fonts": {
      "heading": "Georgia, serif",
      "body": "Helvetica, Arial, sans-serif"
    },
    "layout": {
      "headerStyle": "traditional",
      "productCardStyle": "simple",
      "spacing": "standard",
      "borderRadius": "minimal"
    },
    "components": {
      "buttonStyle": "classic",
      "cardShadow": "light",
      "imageStyle": "standard"
    }
  }',
  true
);
