-- Add missing columns to cars table
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS features TEXT;

-- Add missing columns to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
