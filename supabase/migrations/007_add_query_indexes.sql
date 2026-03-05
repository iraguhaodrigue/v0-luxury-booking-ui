-- Optimize database queries with indexes for better performance

-- Cars table indexes
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_created ON cars(created_at DESC);

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_status ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_created ON services(created_at DESC);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read_by_admin);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Bookings table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
