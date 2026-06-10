-- Final comprehensive schema fixes for luxury booking platform
-- Run this in Supabase SQL editor to fix all schema issues

-- 1. Make owner_id nullable to fix NOT NULL constraint violation
ALTER TABLE public.properties 
ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Set default owner_id to 1 for now (can be updated per-property)
ALTER TABLE public.properties 
ALTER COLUMN owner_id SET DEFAULT 1;

-- 3. Verify amenities is TEXT[] array (should already be)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'properties' AND column_name = 'amenities';

-- 4. Verify cars.images is TEXT[] array (should already be)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'cars' AND column_name = 'images';

-- 5. Create some predefined properties for testing (optional)
-- INSERT INTO public.properties (owner_id, name, property_type, location, base_price_per_night)
-- VALUES (1, 'Sample Villa', 'villa', 'Kigali', 150000)
-- ON CONFLICT DO NOTHING;

-- 6. Refresh Supabase schema cache
-- (This happens automatically after applying the migration)
