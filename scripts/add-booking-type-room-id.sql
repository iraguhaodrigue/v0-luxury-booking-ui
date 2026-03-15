-- Migration: Add booking_type and room_id to bookings table
-- Also add user_id to properly link bookings to auth.users

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_type TEXT NOT NULL DEFAULT 'property'
    CHECK (booking_type IN ('property', 'room', 'car', 'service')),
  ADD COLUMN IF NOT EXISTS room_id      INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS property_id  INTEGER REFERENCES properties(id) ON DELETE SET NULL;

-- Index for fast customer dashboard queries
CREATE INDEX IF NOT EXISTS bookings_user_id_idx    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_user_email_idx ON bookings(user_email);
CREATE INDEX IF NOT EXISTS bookings_room_id_idx    ON bookings(room_id);
CREATE INDEX IF NOT EXISTS bookings_property_id_idx ON bookings(property_id);
