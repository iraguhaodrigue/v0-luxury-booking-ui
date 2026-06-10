'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Property,
  Room,
  Booking,
  Review,
  Conversation,
  Notification,
  Product,
  Order,
  UserProfile,
  PropertyFilters,
  SearchResult,
  City,
  Country,
} from '@/lib/types/marketplace';
import { revalidatePath } from 'next/cache';

const supabase = createClient();

// ==========================================
// LOCATION SERVICES
// ==========================================

export async function getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCitiesByCountry(countryId: number): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('country_id', countryId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCityWithCountry(cityId: number) {
  const { data, error } = await supabase
    .from('cities')
    .select('*, country:countries(*)')
    .eq('id', cityId)
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// PROPERTY SERVICES
// ==========================================

export async function searchProperties(filters: PropertyFilters): Promise<SearchResult> {
  let query = supabase
    .from('properties')
    .select('*, rooms:rooms(*), city:cities(*), country:countries(*), reviews:reviews(*)')
    .eq('is_active', true)
    .eq('is_approved', true);

  // Apply filters
  if (filters.country_id) {
    query = query.eq('country_id', filters.country_id);
  }

  if (filters.city_id) {
    query = query.eq('city_id', filters.city_id);
  }

  if (filters.property_type) {
    query = query.eq('property_type', filters.property_type);
  }

  if (filters.min_price !== undefined) {
    query = query.gte('base_price_per_night', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query = query.lte('base_price_per_night', filters.max_price);
  }

  if (filters.search_query) {
    query = query.or(`name.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%,location.ilike.%${filters.search_query}%`);
  }

  query = query.order('created_at', { ascending: false }).limit(20);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    properties: data || [],
    total: count || 0,
    page: 1,
    limit: 20,
  };
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*, rooms:rooms(*), city:cities(*), country:countries(*), reviews:reviews(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

export async function getPropertiesByOwner(ownerUuid: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*, rooms:rooms(*), city:cities(*), reviews:reviews(*)')
    .eq('owner_uuid', ownerUuid)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProperty(
  ownerUuid: string,
  property: Partial<Property>
): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert([
      {
        ...property,
        owner_uuid: ownerUuid,
        is_active: true,
        is_approved: false, // Requires admin approval
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(
  id: number,
  updates: Partial<Property>
): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/properties/${id}`);
  return data;
}

// ==========================================
// ROOM SERVICES
// ==========================================

export async function getRoomsByProperty(propertyId: number): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getRoomById(id: number): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, property:properties(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function createRoom(room: Partial<Room>): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ ...room, is_active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(id: number, updates: Partial<Room>): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// BOOKING SERVICES
// ==========================================

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, property:properties(*), room:rooms(*), payment:payments(*)')
    .eq('auth_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBookingsByProperty(propertyId: number): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, room:rooms(*), payment:payments(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBooking(booking: Partial<Booking>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        ...booking,
        status: 'pending',
        payment_status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBooking(
  id: number,
  updates: Partial<Booking>
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// REVIEW SERVICES
// ==========================================

export async function getReviewsByProperty(propertyId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;

  // Update property rating
  if (review.property_id) {
    await updatePropertyRating(review.property_id);
  }

  return data;
}

async function updatePropertyRating(propertyId: number) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('property_id', propertyId);

  if (reviews && reviews.length > 0) {
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabase
      .from('properties')
      .update({
        star_rating: averageRating,
        total_reviews: reviews.length,
      })
      .eq('id', propertyId);
  }
}

// ==========================================
// CONVERSATION SERVICES
// ==========================================

export async function getConversationsByUser(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages:conversation_messages(*), property:properties(*), booking:bookings(*)')
    .or(`customer_id.eq.${userId},owner_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createConversation(conversation: Partial<Conversation>): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ ...conversation, status: 'open' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function sendMessage(
  conversationId: number,
  senderId: string,
  message: string
): Promise<any> {
  const { data, error } = await supabase
    .from('conversation_messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: message,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

// ==========================================
// NOTIFICATION SERVICES
// ==========================================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function createNotification(notification: Partial<Notification>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ ...notification, is_read: false }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

// ==========================================
// SHOP SERVICES
// ==========================================

export async function getProducts(limit = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ==========================================
// ORDER SERVICES
// ==========================================

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        ...order,
        order_number: `ORD-${Date.now()}`,
        payment_status: 'pending',
        order_status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// PROFILE SERVICES
// ==========================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingOwners(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'owner')
    .eq('owner_pending_approval', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function approveOwner(
  userId: string,
  approvedBy: string
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      owner_pending_approval: false,
      owner_approved_at: new Date().toISOString(),
      owner_approved_by: approvedBy,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for owner
  await createNotification({
    user_id: userId,
    type: 'owner_approval',
    title: 'Account Approved',
    message: 'Your business account has been approved. You can now publish properties.',
  });

  return data;
}
