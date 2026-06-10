-- Migration: Fix properties schema and add amenities management
-- Run this SQL in your Supabase SQL editor

-- 1. Create amenities lookup table
CREATE TABLE IF NOT EXISTS public.amenities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.amenities (name, description) VALUES
('WiFi', 'High-speed internet'),
('Pool', 'Swimming pool'),
('Gym', 'Fitness center'),
('Spa', 'Spa and wellness'),
('Restaurant', 'On-site dining'),
('Bar', 'Bar service'),
('Parking', 'Free parking'),
('Balcony', 'Balcony/terrace'),
('Air Conditioning', 'Climate control'),
('Heating', 'Central heating'),
('TV', 'Smart TV'),
('Kitchen', 'Full kitchen'),
('Washing Machine', 'Laundry facilities'),
('Pets Allowed', 'Pet friendly'),
('Accessibility', 'Wheelchair accessible')
ON CONFLICT (name) DO NOTHING;

-- 2. Enable RLS on amenities
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for amenities (everyone can read)
CREATE POLICY "amenities_select_all" ON public.amenities
  FOR SELECT USING (true);

-- 3. Create junction table for properties and amenities
CREATE TABLE IF NOT EXISTS public.properties_amenities (
  property_id INTEGER NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id INTEGER NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enable RLS on junction table
ALTER TABLE public.properties_amenities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties_amenities
CREATE POLICY "properties_amenities_select_all" ON public.properties_amenities
  FOR SELECT USING (true);

CREATE POLICY "properties_amenities_insert_admin" ON public.properties_amenities
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "properties_amenities_delete_admin" ON public.properties_amenities
  FOR DELETE USING (public.is_admin());

-- 5. Change owner_id to UUID and link to auth.users (optional but recommended)
-- NOTE: If you have existing data in properties, back it up first!
-- ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_uuid UUID REFERENCES auth.users(id);
-- You can migrate data manually: UPDATE properties SET owner_uuid = (SELECT id FROM auth.users LIMIT 1) WHERE owner_uuid IS NULL;

-- 6. Add is_available column to properties if it doesn't exist
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 7. Add missing columns to rooms if needed
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 8. Ensure all tables have created_at and updated_at timestamps
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
