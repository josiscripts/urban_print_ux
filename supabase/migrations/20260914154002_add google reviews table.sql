-- Create ENUM type for Google review ratings
-- Google Business Profile API uses standard 1-5 star ratings
DO $$ BEGIN
  CREATE TYPE public.google_star_rating AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create table for Google Business Profile reviews
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google API identifiers
  google_review_name TEXT UNIQUE NOT NULL,
  google_location_id TEXT,

  -- Reviewer information
  reviewer_display_name TEXT NOT NULL,
  reviewer_photo_url TEXT,

  -- Review content and rating
  star_rating public.google_star_rating NOT NULL,
  comment TEXT,

  -- Google timestamps
  google_create_time TIMESTAMPTZ,
  google_update_time TIMESTAMPTZ,

  -- Publishing status
  is_published BOOLEAN NOT NULL DEFAULT TRUE,

  -- Sync metadata
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_data JSONB,

  -- Local timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_google_reviews_star_rating ON public.google_reviews(star_rating);
CREATE INDEX idx_google_reviews_is_published ON public.google_reviews(is_published);
CREATE INDEX idx_google_reviews_google_location_id ON public.google_reviews(google_location_id);
CREATE INDEX idx_google_reviews_google_create_time ON public.google_reviews(google_create_time);
CREATE INDEX idx_google_reviews_synced_at ON public.google_reviews(synced_at);

-- Enable RLS
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anonymous/public users can only see published 5-star reviews
CREATE POLICY "Public can view 5-star reviews" ON public.google_reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND star_rating = 'FIVE');

-- Policy 2: Service role (backend) can perform all operations for sync
CREATE POLICY "Service role can manage all reviews" ON public.google_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.google_reviews TO anon, authenticated;
GRANT ALL ON public.google_reviews TO service_role;
