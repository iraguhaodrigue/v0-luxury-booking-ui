-- Drop and recreate messages table with correct schema
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table with correct column names
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

-- Create indexes for fast queries
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_email ON public.messages(sender_email);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow insert for anyone (contact form submissions)
CREATE POLICY "Allow insert messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Allow select for anyone
CREATE POLICY "Allow select messages" ON public.messages
  FOR SELECT USING (true);

-- Allow update for admin replies
CREATE POLICY "Allow update messages" ON public.messages
  FOR UPDATE USING (true);
