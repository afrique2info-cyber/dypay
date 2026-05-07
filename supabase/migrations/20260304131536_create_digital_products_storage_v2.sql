/*
  # Digital Products Storage Bucket

  1. Storage Setup
    - Create 'digital-products' storage bucket
    - Configure security policies
    - Only merchants can upload files
    - Files are private by default
    - Access controlled through download tokens

  2. Security
    - Merchants can upload to their own folders
    - No public access
    - Downloads only through secure tokens
*/

-- Create storage bucket for digital products
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'digital-products',
  'digital-products',
  false,
  524288000, -- 500MB limit
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 
        'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp3',
        'application/epub+zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Merchants can upload digital products" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can view own digital products" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can update own digital products" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete own digital products" ON storage.objects;

-- Policy: Merchants can upload to their own folder
CREATE POLICY "Merchants can upload digital products"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Merchants can view their own files
CREATE POLICY "Merchants can view own digital products"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Merchants can update their own files
CREATE POLICY "Merchants can update own digital products"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Merchants can delete their own files
CREATE POLICY "Merchants can delete own digital products"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );