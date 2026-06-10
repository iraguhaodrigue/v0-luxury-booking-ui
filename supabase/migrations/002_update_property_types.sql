-- Migration to update property types to only include Villas and Apartments
-- This removes penthouse and suite types, and updates the enum

-- Drop the old enum type (requires dropping dependent columns first)
ALTER TABLE properties ALTER COLUMN property_type TYPE VARCHAR(50);

-- Drop the old enum
DROP TYPE property_type;

-- Create new enum with only villa and apartment
CREATE TYPE property_type AS ENUM ('villa', 'apartment');

-- Convert the property_type column back to enum
ALTER TABLE properties ALTER COLUMN property_type TYPE property_type USING property_type::text::property_type;

-- Add a 'type' column as an alias for compatibility (some code references 'type')
-- First check if column exists before adding
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'type'
  ) THEN
    ALTER TABLE properties ADD COLUMN type VARCHAR(50);
  END IF;
END $$;

-- Commit successful migration
COMMENT ON TABLE properties IS 'Updated to support only Villas and Apartments';
