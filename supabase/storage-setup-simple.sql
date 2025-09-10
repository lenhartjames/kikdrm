-- Simple storage setup for Supabase
-- Run this in your Supabase SQL editor

-- Create storage buckets (if they don't exist)
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

-- Create samples bucket for audio files
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

-- Note: Storage policies need to be configured in the Supabase Dashboard
-- Go to Storage > Policies and add the following policies for the 'images' bucket:
-- 1. Enable INSERT for anonymous users
-- 2. Enable SELECT for anonymous users
-- 3. Enable UPDATE for anonymous users (optional)
-- 4. Enable DELETE for anonymous users (optional)