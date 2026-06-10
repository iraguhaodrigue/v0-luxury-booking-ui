-- Migration: Fix owner_id foreign key constraint
-- Problem: properties.owner_id references users.id, but users table is empty
-- Solution: Change to reference auth.users(id) or make owner_id nullable

-- Option 1: Make owner_id nullable (if properties don't require an owner)
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;

ALTER TABLE public.properties 
ALTER COLUMN owner_id DROP NOT NULL;

ALTER TABLE public.properties
ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- Option 2 (Alternative): Reference auth.users instead
-- Uncomment below if you want to keep owner_id required but link to auth.users
-- ALTER TABLE public.properties
-- ADD CONSTRAINT properties_owner_id_fkey 
-- FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify the change
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'owner_id';
