-- Run this script to create/update all tables

-- 1. Create messages table
DROP TABLE IF EXISTS public.messages CASCADE;
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid,
  name text NOT NULL,
  sender_email text NOT NULL,
  message text NOT NULL,
  admin_reply text,
  admin_name text DEFAULT 'Admin',
  read_by_admin boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  reply_created_at timestamp,
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_email ON public.messages(sender_email);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow update messages" ON public.messages FOR UPDATE USING (true);

-- 2. Create bookings table
DROP TABLE IF EXISTS public.bookings CASCADE;
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('property', 'car', 'service')),
  user_name text NOT NULL,
  user_email text NOT NULL,
  guests integer NOT NULL,
  checkin date NOT NULL,
  checkout date NOT NULL,
  total_price numeric NOT NULL,
  payment_method text,
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_bookings_email ON public.bookings(user_email);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow view own bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow admin update bookings" ON public.bookings FOR UPDATE USING (true);

-- 3. Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_per_day numeric NOT NULL DEFAULT 0,
  duration text DEFAULT 'Per day',
  category text,
  created_at timestamp DEFAULT now()
);

-- Insert default services if table is empty
INSERT INTO public.services (name, description, price_per_day, duration)
SELECT * FROM (VALUES 
  ('Airport Transfer', 'Luxury vehicle pickup and drop-off at Kigali International Airport', 150, 'Per trip'),
  ('Private Chef', 'Personal chef service with authentic Rwandan cuisine', 200, 'Per day'),
  ('Spa Treatment', 'In-room massage and wellness treatments', 180, 'Per session'),
  ('Safari Guide', 'Expert wildlife guide for gorilla trekking and safari tours', 300, 'Per day'),
  ('Photography Tour', 'Professional photographer for memorable moments', 250, 'Per day'),
  ('Cultural Experience', 'Traditional dance, music, and local village visits', 120, 'Per half-day')
) AS v(name, description, price_per_day, duration)
WHERE NOT EXISTS (SELECT 1 FROM public.services LIMIT 1);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow select services" ON public.services FOR SELECT USING (true);
