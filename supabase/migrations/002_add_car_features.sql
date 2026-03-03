-- Add features column to cars table if it doesn't exist
ALTER TABLE cars ADD COLUMN IF NOT EXISTS features TEXT;

-- Add image_url column as alias for better compatibility
ALTER TABLE cars ADD COLUMN IF NOT EXISTS image_url TEXT;
