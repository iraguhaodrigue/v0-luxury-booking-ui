-- Add missing columns to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;

-- Add missing columns to cars table
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(10, 2) DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'price';

SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'cars' AND column_name = 'daily_rate';
