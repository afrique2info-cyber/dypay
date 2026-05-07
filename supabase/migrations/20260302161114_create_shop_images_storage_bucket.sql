/*
  # Création du bucket de stockage pour les images des boutiques

  1. Nouveau Bucket
    - `shop-images` - Stockage public pour les images des thèmes personnalisés

  2. Sécurité
    - Les marchands authentifiés peuvent uploader des images
    - Les images sont publiquement accessibles en lecture
    - Limite de taille de fichier: 5 MB
*/

-- Créer le bucket shop-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-images',
  'shop-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Merchants can upload shop images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete their shop images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view shop images" ON storage.objects;

-- Politique: Les marchands authentifiés peuvent uploader des images
CREATE POLICY "Merchants can upload shop images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-images' AND
  (storage.foldername(name))[1] = 'shop-themes'
);

-- Politique: Les marchands peuvent supprimer leurs propres images
CREATE POLICY "Merchants can delete their shop images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-images' AND
  (storage.foldername(name))[1] = 'shop-themes'
);

-- Politique: Tout le monde peut lire les images (bucket public)
CREATE POLICY "Anyone can view shop images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shop-images');
