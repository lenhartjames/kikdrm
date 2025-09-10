-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']::text[];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public uploads to images bucket
CREATE POLICY "Allow public uploads to images bucket" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'images');

-- Create policy to allow public viewing of images
CREATE POLICY "Allow public to view images" ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Create policy to allow public updates (for replacing files)
CREATE POLICY "Allow public updates to images" ON storage.objects
FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Create policy to allow public deletes
CREATE POLICY "Allow public deletes from images" ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- If you also want to create a bucket for audio samples
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'samples', 
  'samples', 
  true, 
  52428800, -- 50MB in bytes
  ARRAY['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm']::text[];

-- Create policies for samples bucket
CREATE POLICY "Allow public uploads to samples bucket" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'samples');

CREATE POLICY "Allow public to view samples" ON storage.objects
FOR SELECT
USING (bucket_id = 'samples');

CREATE POLICY "Allow public updates to samples" ON storage.objects
FOR UPDATE
USING (bucket_id = 'samples')
WITH CHECK (bucket_id = 'samples');

CREATE POLICY "Allow public deletes from samples" ON storage.objects
FOR DELETE
USING (bucket_id = 'samples');