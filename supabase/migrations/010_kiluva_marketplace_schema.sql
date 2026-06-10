-- KILUVA Global Marketplace Schema Enhancement
-- Phase 1: Location system, extended roles, products, reviews

-- Drop existing ENUM types and recreate with new values
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'customer');

-- Drop and recreate property_type ENUM
DROP TYPE IF EXISTS property_type CASCADE;
CREATE TYPE property_type AS ENUM ('hotel', 'villa', 'apartment');

-- Drop and recreate booking_type ENUM
DROP TYPE IF EXISTS booking_type CASCADE;
CREATE TYPE booking_type AS ENUM ('property', 'room', 'car', 'service');

-- ==========================================
-- 1. LOCATION SYSTEM (WORLDWIDE)
-- ==========================================

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country_id, name)
);

CREATE INDEX idx_cities_country_id ON cities(country_id);

-- ==========================================
-- 2. ENHANCED USER PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  role user_role DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  
  -- Owner-specific fields
  business_name VARCHAR(255),
  business_description TEXT,
  owner_pending_approval BOOLEAN DEFAULT false,
  owner_approved_at TIMESTAMP,
  owner_approved_by UUID REFERENCES auth.users(id),
  
  -- Address fields
  country_id INTEGER REFERENCES countries(id),
  city_id INTEGER REFERENCES cities(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_country_id ON profiles(country_id);

-- ==========================================
-- 3. ENHANCED PROPERTIES TABLE
-- ==========================================

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id),
ADD COLUMN IF NOT EXISTS owner_uuid UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS star_rating DECIMAL(2, 1) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_properties_country_id ON properties(country_id);
CREATE INDEX IF NOT EXISTS idx_properties_city_id ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_uuid ON properties(owner_uuid);

-- ==========================================
-- 4. REVIEWS SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_room_id ON reviews(room_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- ==========================================
-- 5. SHOP / MARKETPLACE PRODUCTS
-- ==========================================

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ==========================================
-- 6. ORDERS SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ==========================================
-- 7. ORDER ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ==========================================
-- 8. ENHANCED CONVERSATIONS/MESSAGING
-- ==========================================

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_owner_id ON conversations(owner_id);
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);

-- ==========================================
-- 9. NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_booking_id INTEGER REFERENCES bookings(id),
  related_property_id INTEGER REFERENCES properties(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ==========================================
-- 10. POPULATE COUNTRIES AND CITIES
-- ==========================================

INSERT INTO countries (name, code, region) VALUES
('Rwanda', 'RW', 'Africa'),
('Kenya', 'KE', 'Africa'),
('Uganda', 'UG', 'Africa'),
('Tanzania', 'TZ', 'Africa'),
('South Africa', 'ZA', 'Africa'),
('Egypt', 'EG', 'Africa'),
('United Arab Emirates', 'AE', 'Middle East'),
('United Kingdom', 'GB', 'Europe'),
('France', 'FR', 'Europe'),
('Germany', 'DE', 'Europe'),
('Spain', 'ES', 'Europe'),
('Italy', 'IT', 'Europe'),
('United States', 'US', 'North America'),
('Canada', 'CA', 'North America'),
('Mexico', 'MX', 'North America'),
('Brazil', 'BR', 'South America'),
('Thailand', 'TH', 'Asia'),
('Japan', 'JP', 'Asia'),
('India', 'IN', 'Asia'),
('Australia', 'AU', 'Oceania')
ON CONFLICT DO NOTHING;

-- Rwanda Cities
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Kigali', -1.9536, 29.8739 FROM countries WHERE code = 'RW' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Musanze', -1.5031, 29.6331 FROM countries WHERE code = 'RW' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Huye', -2.6033, 29.7412 FROM countries WHERE code = 'RW' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Rubavu', -1.2497, 29.3012 FROM countries WHERE code = 'RW' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Ruhengeri', -1.5031, 29.6331 FROM countries WHERE code = 'RW' ON CONFLICT DO NOTHING;

-- Kenya Cities
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Nairobi', -1.2865, 36.8172 FROM countries WHERE code = 'KE' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude) 
SELECT id, 'Mombasa', -4.0435, 39.6682 FROM countries WHERE code = 'KE' ON CONFLICT DO NOTHING;

-- More cities can be added as needed
INSERT INTO cities (country_id, name, latitude, longitude)
SELECT id, 'Dubai', 25.2048, 55.2708 FROM countries WHERE code = 'AE' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude)
SELECT id, 'London', 51.5074, -0.1278 FROM countries WHERE code = 'GB' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude)
SELECT id, 'Paris', 48.8566, 2.3522 FROM countries WHERE code = 'FR' ON CONFLICT DO NOTHING;
INSERT INTO cities (country_id, name, latitude, longitude)
SELECT id, 'Cape Town', -33.9249, 18.4241 FROM countries WHERE code = 'ZA' ON CONFLICT DO NOTHING;

-- ==========================================
-- 11. POPULATE PRODUCT CATEGORIES
-- ==========================================

INSERT INTO product_categories (name, description) VALUES
('Food & Beverage', 'Food, drinks, and dining items'),
('Travel Items', 'Travel accessories and essentials'),
('Local Products', 'Local crafts and products'),
('Property Add-ons', 'Extra services and amenities')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (users can see their own)
CREATE POLICY profiles_self_access ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for orders (users can see their own)
CREATE POLICY orders_self_access ON orders FOR SELECT
  USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for notifications (users can see their own)
CREATE POLICY notifications_self_access ON notifications FOR SELECT
  USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
