-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can submit contact form)
CREATE POLICY "Allow public insert"
ON public.messages
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for admin read
CREATE POLICY "Allow authenticated read"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS messages_email_idx ON public.messages(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
