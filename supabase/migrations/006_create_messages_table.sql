-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp DEFAULT now(),
  read_by_admin boolean DEFAULT false
);

-- Enable row level security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert (contact form submissions)
CREATE POLICY "allow_public_insert"
ON public.messages
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow authenticated users (admin) to read
CREATE POLICY "allow_admin_read"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users (admin) to update
CREATE POLICY "allow_admin_update"
ON public.messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read_by_admin);
