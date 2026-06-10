# KILUVA - Global Marketplace Transformation Plan

## Executive Summary

Transform KILUVA from a simple Rwanda booking website into a global marketplace platform similar to Booking.com and Airbnb with three-tier system: Customers, Property Owners, and Admins.

## Phase 1: Database Schema Enhancement (Foundation)

### 1.1 Location System
- Create `countries` table with worldwide locations
- Create `cities` table linked to countries
- Update `properties` to reference country_id and city_id
- Enable worldwide property search

### 1.2 User Role System Enhancement
- Extend user roles: `admin`, `owner`, `customer`
- Add `pending_approval` flag for new owners
- Track owner business information
- Enable owner activation workflow

### 1.3 Products & Shop System
- Create `products` table (food, travel items, add-ons)
- Create `orders` table for shop purchases
- Create `order_items` join table
- Support product categories

### 1.4 Review System
- Create `reviews` table for properties/rooms/services
- Support star ratings (1-5) and comments
- Link reviews to bookings for verification

### 1.5 Enhanced Messaging
- Create proper `conversations` table
- Support multi-party conversations
- Track read status and timestamps
- Enable real-time notifications

## Phase 2: Data Migration (Align Existing with New Structure)

1. Update existing users to have appropriate roles
2. Link existing properties to Rwanda cities
3. Migrate existing data structures
4. Ensure no data loss

## Phase 3: Owner Dashboard

### 3.1 Owner Signup & Approval Flow
- `/owner/register` - Business information collection
- Admin approval in `/admin/owners`
- Email notification on approval
- Owner can only publish after approval

### 3.2 Owner Dashboard Pages
- `/owner/dashboard` - Overview with KPIs
- `/owner/properties` - CRUD for properties
- `/owner/properties/[id]/rooms` - Room management
- `/owner/bookings` - Booking management with approval/rejection
- `/owner/messages` - Conversations with customers
- `/owner/reviews` - Property and service reviews
- `/owner/profile` - Account settings

### 3.3 Owner Features
- Upload multiple images for properties
- Manage availability and pricing
- View real-time booking requests
- Message customers
- Track revenue and bookings

## Phase 4: Customer Dashboard Redesign

### 4.1 Customer Pages
- `/dashboard/customer` - Personalized overview
- `/dashboard/customer/bookings` - Active and past bookings
- `/dashboard/customer/messages` - Customer conversations
- `/dashboard/customer/wishlist` - Saved properties
- `/dashboard/customer/profile` - Account and preferences

### 4.2 Customer Features
- Search properties globally
- View booking history
- Message property owners
- Leave reviews
- Manage reservations

## Phase 5: Marketplace Architecture

### 5.1 Global Search
- `/search` - Advanced search with filters
- Filters: Country, City, Property Type, Price Range, Guests, Rating
- Responsive to mobile and desktop
- Real-time results

### 5.2 Property Page Redesign
- `/properties/[id]` - Complete property showcase
- Image gallery with thumbnails
- Property and room information
- Two booking options:
  - Book entire property
  - Book individual room
- Related properties
- Reviews section

### 5.3 Booking Flows

**Property Booking Flow:**
- Step 1: Select dates (check-in/check-out)
- Step 2: Select guests
- Step 3: Choose property or room
- Step 4: Add extra services
- Step 5: Review all details
- Step 6: Process payment

**Room Booking Flow:**
- Step 1: Select dates
- Step 2: Select guests
- Step 3: Choose room
- Step 4: Add services
- Step 5: Review and pay

**Car Booking Flow:**
- Step 1: Pickup date
- Step 2: Return date
- Step 3: Pickup location
- Step 4: Car selection
- Step 5: Review and pay

**Service Booking Flow:**
- Step 1: Service selection
- Step 2: Schedule dates
- Step 3: Quantity
- Step 4: Review and pay

## Phase 6: Shop Module

### 6.1 Shop Pages
- `/shop` - Product listing with categories
- `/shop/[product-id]` - Product detail page
- `/shop/cart` - Shopping cart
- `/shop/checkout` - Payment

### 6.2 Shop Features
- Browse products by category
- Add to cart
- Manage quantities
- Apply discount codes
- Track orders

## Phase 7: Payment System Architecture

### 7.1 Payment Integration
- Integrate DPO Group gateway
- Support Visa, Mastercard, Mobile Money
- Webhook handling for payment confirmation
- Store payment logs and transaction history

### 7.2 Booking Confirmation
- Only confirm bookings after successful payment
- Send confirmation email to customer
- Notify property owner
- Create notification for admin

## Phase 8: Admin Panel Enhancements

### 8.1 Admin Pages
- `/admin/dashboard` - Platform overview
- `/admin/owners` - Owner approval and management
- `/admin/properties` - Property moderation
- `/admin/bookings` - All platform bookings
- `/admin/payments` - Payment monitoring
- `/admin/messages` - Support tickets
- `/admin/users` - User management
- `/admin/reports` - Analytics and reporting

### 8.2 Admin Features
- Approve/reject owners
- Moderate property listings
- Monitor payments
- Support customer issues
- View platform analytics

## Phase 9: Notifications & Real-Time

### 9.1 Notification Types
- Booking created
- Booking confirmed
- Booking rejected
- Payment successful
- New message
- Review posted
- Owner application status

### 9.2 Delivery Methods
- In-app notifications
- Email notifications
- Real-time Supabase subscriptions
- Admin alerts

## Phase 10: UI/UX Improvements

### 10.1 Design System
- Premium modern cards
- Professional dashboards
- Responsive layout (mobile-first)
- Dark/light mode support
- Accessibility standards

### 10.2 User Experience
- Loading states for all async operations
- Error states with helpful messages
- Empty states with guidance
- Confirmation dialogs for critical actions
- Progress indicators for multi-step flows

## Implementation Order

1. **Week 1:** Database schema creation + data migration
2. **Week 2:** Owner registration and approval system
3. **Week 3:** Owner dashboard and property management
4. **Week 4:** Customer dashboard redesign
5. **Week 5:** Marketplace search and property pages
6. **Week 6:** Booking flows and cart system
7. **Week 7:** Shop module
8. **Week 8:** Payment system integration
9. **Week 9:** Admin enhancements
10. **Week 10:** Notifications, testing, and optimization

## Success Criteria

- All users can search properties globally
- Owners can manage properties and bookings
- Customers can complete multi-step bookings
- All transactions logged and tracked
- Real-time notifications working
- Mobile responsive design
- Zero hardcoded data
- 100% database-driven application
- Production-ready with error handling

## Technical Requirements

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Real-time subscriptions
- Server components where possible
- Proper error handling
- Comprehensive logging
