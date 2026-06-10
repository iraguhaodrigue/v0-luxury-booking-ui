// KILUVA Marketplace Types

export type UserRole = 'admin' | 'owner' | 'customer';
export type PropertyType = 'hotel' | 'villa' | 'apartment';
export type BookingType = 'property' | 'room' | 'car' | 'service';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ConversationStatus = 'open' | 'closed' | 'resolved';

// Location Types
export interface Country {
  id: number;
  name: string;
  code: string;
  region?: string;
  created_at: string;
}

export interface City {
  id: number;
  country_id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  country?: Country;
}

// User & Profile Types
export interface UserProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  
  // Owner fields
  business_name?: string | null;
  business_description?: string | null;
  owner_pending_approval?: boolean;
  owner_approved_at?: string | null;
  
  // Address
  country_id?: number | null;
  city_id?: number | null;
  
  created_at: string;
  updated_at: string;
}

// Property Types
export interface Property {
  id: number;
  owner_id?: number;
  owner_uuid?: string;
  name: string;
  description?: string;
  location: string;
  city?: string;
  country?: string;
  country_id?: number;
  city_id?: number;
  property_type: PropertyType;
  total_rooms: number;
  amenities: string[];
  base_price_per_night: number;
  currency: string;
  images: string[];
  is_active: boolean;
  is_approved?: boolean;
  star_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
  rooms?: Room[];
  city_data?: City;
  country_data?: Country;
  reviews?: Review[];
}

// Room Types
export interface Room {
  id: number;
  property_id: number;
  name: string;
  description?: string;
  capacity: number;
  bedrooms?: number;
  bathrooms?: number;
  price_per_night: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  property?: Property;
}

// Booking Types
export interface Booking {
  id: number;
  user_id?: number;
  auth_user_id?: string;
  property_id?: number;
  room_id?: number;
  car_id?: number;
  service_id?: number;
  booking_type: BookingType;
  check_in_date?: string;
  check_out_date?: string;
  pickup_date?: string;
  return_date?: string;
  total_guests?: number;
  total_price: number;
  status: BookingStatus;
  notes?: string;
  payment_status?: PaymentStatus;
  created_at: string;
  updated_at: string;
  property?: Property;
  room?: Room;
  payment?: Payment;
  services?: Service[];
}

// Service Types
export interface Service {
  id: number;
  name: string;
  service_type: string;
  description?: string;
  price_per_day: number;
  max_guests_per_day?: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: number;
  user_id: string;
  booking_id?: number;
  property_id?: number;
  room_id?: number;
  service_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// Payment Types
export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_method?: string;
  transaction_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// Shop Types
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
}

export interface Order {
  id: number;
  user_id: string;
  order_number: string;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

// Messaging Types
export interface Conversation {
  id: number;
  property_id?: number;
  booking_id?: number;
  customer_id: string;
  owner_id?: string;
  subject?: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  messages?: ConversationMessage[];
  property?: Property;
  booking?: Booking;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: string;
  message_text: string;
  read_at?: string;
  created_at: string;
  sender?: UserProfile;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  related_booking_id?: number;
  related_property_id?: number;
  is_read: boolean;
  created_at: string;
  booking?: Booking;
  property?: Property;
}

// Car Types
export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color?: string;
  capacity: number;
  transmission?: string;
  fuel_type?: string;
  price_per_day: number;
  images: string[];
  status: string;
  mileage_limit?: number;
  created_at: string;
  updated_at: string;
}

// Search & Filter Types
export interface PropertyFilters {
  country_id?: number;
  city_id?: number;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  guests?: number;
  min_rating?: number;
  check_in?: string;
  check_out?: string;
  search_query?: string;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}

// Cart Types
export interface CartItem {
  type: 'product' | 'service' | 'booking';
  id: number;
  quantity: number;
  price: number;
  data: Product | Service | Booking;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
