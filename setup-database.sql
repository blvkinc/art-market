-- Check if artworks table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'artworks' AND column_name = 'status') THEN
        ALTER TABLE artworks ADD COLUMN status text NOT NULL DEFAULT 'active';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'artworks' AND column_name = 'created_at') THEN
        ALTER TABLE artworks ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'artworks' AND column_name = 'updated_at') THEN
        ALTER TABLE artworks ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active artworks" ON public.artworks;
DROP POLICY IF EXISTS "Users can create their own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Users can update their own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Users can delete their own artworks" ON public.artworks;

-- Create policies
CREATE POLICY "Anyone can view active artworks"
ON public.artworks FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can create their own artworks"
ON public.artworks FOR INSERT
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update their own artworks"
ON public.artworks FOR UPDATE
USING (auth.uid() = artist_id);

CREATE POLICY "Users can delete their own artworks"
ON public.artworks FOR DELETE
USING (auth.uid() = artist_id);

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artwork-images', 'artwork-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own artwork images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'artwork-images');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'artwork-images' 
    AND auth.role() = 'authenticated'
    AND (
        (storage.foldername(name))[1] = 'artworks'
        OR (storage.foldername(name))[1] = 'avatars'
    )
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'artwork-images'
    AND auth.role() = 'authenticated'
    AND (
        (storage.foldername(name))[1] = 'artworks'
        OR (storage.foldername(name))[1] = 'avatars'
    )
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'artwork-images'
    AND auth.role() = 'authenticated'
    AND (
        (storage.foldername(name))[1] = 'artworks'
        OR (storage.foldername(name))[1] = 'avatars'
    )
); 