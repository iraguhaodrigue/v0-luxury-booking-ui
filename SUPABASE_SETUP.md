## Supabase Integration Setup Guide

This guide explains how to set up and use Supabase with the Luxury Booking Platform.

### Overview

The application is integrated with Supabase for:
- User management and authentication
- Property and room listings
- Booking management
- Car rental inventory
- Payment processing
- Service management

### Database Schema

The Supabase database includes the following tables:

- **users** - User accounts with roles (client/admin)
- **properties** - Property listings (villas, apartments, penthouses, suites)
- **rooms** - Individual rooms within properties
- **bookings** - Room bookings with status tracking
- **services** - Available services (spa, butler, chef, concierge, cleaning)
- **booking_services** - Services added to bookings
- **cars** - Car rental inventory
- **car_bookings** - Car rental bookings
- **payments** - Payment records

### Setup Instructions

#### 1. Run Database Migrations

The Supabase schema is defined in `supabase/migrations/001_initial_schema.sql`. To apply it:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query to create all tables and enable RLS

#### 2. Environment Variables

All required environment variables are automatically configured:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Using Supabase in the Application

#### Client-Side Data Fetching

Import the Supabase client in client components:

```typescript
import { supabase } from '@/lib/supabase/client'

// Fetch data
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('is_active', true)
```

#### Pre-built Query Functions

Use convenience functions from `lib/supabase/queries.ts`:

```typescript
import { getProperties, getProperty, getUserBookings } from '@/lib/supabase/queries'

// Fetch all active properties
const properties = await getProperties()

// Fetch specific property
const property = await getProperty(propertyId)

// Fetch user's bookings
const bookings = await getUserBookings(userId)
```

#### Server-Side Data Fetching

For Server Components, use the server client:

```typescript
import { createServerClient } from '@/lib/supabase/server'

const supabase = await createServerClient()
const { data } = await supabase.from('properties').select('*')
```

### Admin Dashboard Integration

The admin dashboard pages fetch real data from Supabase:

- **Bookings** - `/admin/bookings` displays all bookings with user and property details
- **Properties** - `/admin/properties` shows property inventory with pricing
- **Rooms** - `/admin/rooms` manages individual rooms
- **Users** - `/admin/users` views user accounts
- **Services** - `/admin/services` manages available services
- **Cars** - `/admin/cars` manages car rental inventory
- **Payments** - `/admin/payments` tracks payment history

### Sample Data

To seed sample data, create a SQL script in Supabase:

```sql
-- Insert sample user
INSERT INTO users (email, full_name, password_hash, role)
VALUES ('admin@luxury.com', 'Admin User', '$2a$12$...', 'admin');

-- Insert sample property
INSERT INTO properties (owner_id, name, location, property_type, base_price_per_night)
VALUES (1, 'Luxury Villa', 'Santorini, Greece', 'villa', 850);

-- Insert sample rooms
INSERT INTO rooms (property_id, name, capacity, price_per_night)
VALUES (1, 'Master Suite', 2, 950);
```

### Authentication

The application supports JWT authentication. To implement user authentication:

1. Create a sign-up/login page using Supabase Auth
2. Store JWT tokens in secure HTTP-only cookies
3. Use the `get_current_user` dependency to protect routes

### Real-Time Subscriptions

Listen to database changes in real-time:

```typescript
supabase
  .channel('bookings')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'bookings' },
    (payload) => console.log('Booking changed:', payload)
  )
  .subscribe()
```

### Troubleshooting

#### Connection Issues
- Verify Supabase URL and keys in environment variables
- Check that your Supabase project is active

#### RLS Policy Errors
- If you see permission denied errors, ensure RLS policies are configured
- For development, you can temporarily disable RLS (not recommended for production)

#### Data Not Showing
- Check that tables are properly created
- Verify data exists in the database
- Check browser console for error messages

### Next Steps

1. ✅ Database schema created
2. ✅ Supabase client set up
3. ✅ Admin pages connected to real data
4. Next: Set up authentication for user signup/login
5. Next: Create booking form with Supabase integration
6. Next: Add payment processing with Supabase

### Documentation

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Supabase Integration](https://supabase.com/partners/integrations/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
