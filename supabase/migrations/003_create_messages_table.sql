-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for contact form submissions)
CREATE POLICY "Allow public insert" ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow admins to view all messages
CREATE POLICY "Allow admins to select messages" ON public.messages
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
