-- MIGRATION: Fix all schema column issues and add service templates
-- Run this in your Supabase SQL Editor

-- 1. Create services template table (predefined services to select from)
CREATE TABLE IF NOT EXISTS public.service_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  default_price NUMERIC,
  service_type VARCHAR(100)
);

-- Insert predefined services
INSERT INTO public.service_templates (name, description, default_price, service_type) VALUES
('Room Cleaning', 'Professional room cleaning service', 15000, 'spa'),
('Airport Transfer', 'Convenient airport transportation', 25000, 'transport'),
('Tour Guide', 'Professional tour guide services', 50000, 'tour'),
('Spa Treatment', 'Relaxing spa and wellness services', 75000, 'spa'),
('Restaurant Reservation', 'Fine dining restaurant booking', 0, 'dining'),
('Laundry Service', 'Express laundry services', 5000, 'spa'),
('Car Rental', 'Vehicle rental services', 80000, 'transport'),
('Excursion Package', 'Guided day trips and excursions', 120000, 'tour'),
('Massage Service', 'Professional massage therapy', 40000, 'spa'),
('Breakfast Delivery', 'Room service breakfast', 8000, 'dining');

-- 2. Add RLS policies for service_templates
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_templates_select_all" ON public.service_templates
  FOR SELECT USING (true);

-- 3. Verify all required columns exist (these should all already exist)
-- If any of these ALTER TABLE commands fail, it means the column already exists - this is fine

ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS property_type VARCHAR(100) DEFAULT 'villa',
  ADD COLUMN IF NOT EXISTS star_rating NUMERIC DEFAULT 4.5,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS price_per_day NUMERIC DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS property_id INTEGER REFERENCES public.properties(id),
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS service_type VARCHAR(100) DEFAULT 'spa',
  ADD COLUMN IF NOT EXISTS price_per_day NUMERIC;

-- 4. Verify profiles table has correct structure for users to display
-- The users page fetches from here
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Clear Supabase schema cache by calling a function (helps with schema cache issues)
-- This is done automatically by Supabase after the migration completes

COMMIT;
