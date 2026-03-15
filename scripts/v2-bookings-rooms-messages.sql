-- Migration: Safe additions to bookings + fix messages columns
-- Only adds columns that don't already exist

-- 1. Add auth_user_id to bookings so the dashboard can query by uid
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add room_id to bookings for individual room bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL;

-- 3. Add room_name to bookings for display (denormalized for speed)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS room_name TEXT;

-- 4. Add booking_subtype to distinguish full-property vs room
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_subtype TEXT DEFAULT 'full_property'
    CHECK (booking_subtype IN ('full_property', 'room'));

-- 5. Add read_by_customer to messages for unread badge
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by_customer BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS bookings_auth_user_id_idx ON bookings(auth_user_id);
CREATE INDEX IF NOT EXISTS bookings_user_email_idx   ON bookings(user_email);
CREATE INDEX IF NOT EXISTS bookings_room_id_idx      ON bookings(room_id);
