-- Migration: Add missing columns to properties and services tables
-- Run this in your Supabase SQL editor

-- Add missing columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS star_rating NUMERIC DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add missing columns to services table  
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Update existing services to have a default category based on service_type
UPDATE public.services 
SET category = CASE 
  WHEN service_type = 'spa' THEN 'Wellness'
  WHEN service_type = 'dining' THEN 'Food & Beverage'
  WHEN service_type = 'tour' THEN 'Activities'
  WHEN service_type = 'transport' THEN 'Transport'
  ELSE 'Other'
END
WHERE category IS NULL;

-- Verify the new columns exist
SELECT 'Properties columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Services columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public'
ORDER BY ordinal_position;
