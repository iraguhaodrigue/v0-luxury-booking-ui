-- Update messages table to support threading and replies
ALTER TABLE IF EXISTS public.messages
ADD COLUMN IF NOT EXISTS thread_id uuid,
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS admin_name text DEFAULT 'Admin',
ADD COLUMN IF NOT EXISTS reply_created_at timestamp,
ADD COLUMN IF NOT EXISTS read_by_admin boolean DEFAULT false;

-- Create index for thread queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);

-- If messages table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message text NOT NULL,
  admin_reply text,
  admin_name text DEFAULT 'Admin',
  read_by_admin boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  reply_created_at timestamp,
  updated_at timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow insert
CREATE POLICY "Allow insert messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Allow select
CREATE POLICY "Allow select messages" ON public.messages
  FOR SELECT USING (true);

-- Allow update for admin replies
CREATE POLICY "Allow update messages" ON public.messages
  FOR UPDATE USING (true);
