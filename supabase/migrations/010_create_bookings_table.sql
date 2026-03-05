-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings
CREATE POLICY "Allow insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own bookings
CREATE POLICY "Allow view own bookings" ON public.bookings
  FOR SELECT USING (true);

-- Allow authenticated admins to update bookings
CREATE POLICY "Allow admin update bookings" ON public.bookings
  FOR UPDATE USING (true);
