/*
  # Ajout de thèmes professionnels supplémentaires

  1. Nouveaux Thèmes
    - Nature & Organic
    - Tech & Innovation
    - Luxury Fashion
    - Creative Studio

  2. Améliorations
    - Ajout de configurations plus détaillées
    - Palettes de couleurs harmonieuses
    - Styles de boutons variés
*/

-- Ajouter de nouveaux thèmes professionnels
INSERT INTO shop_themes (name, slug, description, preview_image, config, is_active) VALUES
(
  'Nature & Organic',
  'nature-organic',
  'Design naturel et apaisant avec tons terreux. Idéal pour produits bio, wellness et écologie.',
  'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
  '{
    "colors": {
      "primary": "#16A34A",
      "secondary": "#166534",
      "accent": "#84CC16",
      "background": "#F0FDF4",
      "surface": "#FFFFFF",
      "text": "#14532D",
      "textSecondary": "#15803D",
      "border": "#BBF7D0"
    },
    "fonts": {
      "heading": "Quicksand, sans-serif",
      "body": "Nunito, sans-serif"
    },
    "layout": {
      "headerStyle": "clean",
      "productCardStyle": "organic",
      "spacing": "generous",
      "borderRadius": "rounded"
    },
    "components": {
      "buttonStyle": "solid",
      "cardShadow": "subtle",
      "imageStyle": "rounded"
    }
  }',
  true
),
(
  'Tech & Innovation',
  'tech-innovation',
  'Design futuriste avec accents néon. Pour les produits tech, gadgets et innovations.',
  'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
  '{
    "colors": {
      "primary": "#0F172A",
      "secondary": "#1E293B",
      "accent": "#06B6D4",
      "background": "#0F172A",
      "surface": "#1E293B",
      "text": "#F1F5F9",
      "textSecondary": "#94A3B8",
      "border": "#334155"
    },
    "fonts": {
      "heading": "Space Grotesk, sans-serif",
      "body": "Inter, sans-serif"
    },
    "layout": {
      "headerStyle": "tech",
      "productCardStyle": "modern",
      "spacing": "compact",
      "borderRadius": "minimal"
    },
    "components": {
      "buttonStyle": "gradient",
      "cardShadow": "strong",
      "imageStyle": "cover"
    }
  }',
  true
),
(
  'Luxury Fashion',
  'luxury-fashion',
  'Élégance et raffinement avec or et noir. Pour les marques de luxe et haute couture.',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
  '{
    "colors": {
      "primary": "#000000",
      "secondary": "#1C1C1C",
      "accent": "#D4AF37",
      "background": "#FFFFFF",
      "surface": "#F8F8F8",
      "text": "#000000",
      "textSecondary": "#666666",
      "border": "#E5E5E5"
    },
    "fonts": {
      "heading": "Cormorant Garamond, serif",
      "body": "Raleway, sans-serif"
    },
    "layout": {
      "headerStyle": "elegant",
      "productCardStyle": "luxury",
      "spacing": "spacious",
      "borderRadius": "slight"
    },
    "components": {
      "buttonStyle": "outline",
      "cardShadow": "none",
      "imageStyle": "framed"
    }
  }',
  true
),
(
  'Creative Studio',
  'creative-studio',
  'Design artistique et coloré. Pour les créatifs, artistes et studios design.',
  'https://images.pexels.com/photos/1470167/pexels-photo-1470167.jpeg',
  '{
    "colors": {
      "primary": "#7C3AED",
      "secondary": "#EC4899",
      "accent": "#F59E0B",
      "background": "#FAFAFA",
      "surface": "#FFFFFF",
      "text": "#18181B",
      "textSecondary": "#71717A",
      "border": "#E4E4E7"
    },
    "fonts": {
      "heading": "Fredoka, sans-serif",
      "body": "Work Sans, sans-serif"
    },
    "layout": {
      "headerStyle": "creative",
      "productCardStyle": "artistic",
      "spacing": "dynamic",
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
  'Ocean Breeze',
  'ocean-breeze',
  'Design frais et apaisant inspiré de l''océan. Pour produits lifestyle, voyage et détente.',
  'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
  '{
    "colors": {
      "primary": "#0891B2",
      "secondary": "#0E7490",
      "accent": "#06B6D4",
      "background": "#F0FDFA",
      "surface": "#FFFFFF",
      "text": "#134E4A",
      "textSecondary": "#14B8A6",
      "border": "#99F6E4"
    },
    "fonts": {
      "heading": "Comfortaa, sans-serif",
      "body": "Karla, sans-serif"
    },
    "layout": {
      "headerStyle": "fluid",
      "productCardStyle": "smooth",
      "spacing": "comfortable",
      "borderRadius": "rounded"
    },
    "components": {
      "buttonStyle": "solid",
      "cardShadow": "medium",
      "imageStyle": "rounded"
    }
  }',
  true
),
(
  'Sunset Vibes',
  'sunset-vibes',
  'Design chaleureux avec couleurs chaudes. Pour mode, beauté et lifestyle.',
  'https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg',
  '{
    "colors": {
      "primary": "#F97316",
      "secondary": "#EA580C",
      "accent": "#FB923C",
      "background": "#FFF7ED",
      "surface": "#FFFFFF",
      "text": "#7C2D12",
      "textSecondary": "#C2410C",
      "border": "#FED7AA"
    },
    "fonts": {
      "heading": "Outfit, sans-serif",
      "body": "DM Sans, sans-serif"
    },
    "layout": {
      "headerStyle": "warm",
      "productCardStyle": "cozy",
      "spacing": "comfortable",
      "borderRadius": "rounded"
    },
    "components": {
      "buttonStyle": "solid",
      "cardShadow": "subtle",
      "imageStyle": "soft"
    }
  }',
  true
)
ON CONFLICT (slug) DO NOTHING;
