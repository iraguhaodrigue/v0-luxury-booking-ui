# KILUVA Marketplace - Quick Start Guide

## 5-Minute Setup

### 1. Clone & Install
```bash
git clone <repository>
cd kiluva-marketplace
npm install
```

### 2. Set Up Supabase
```bash
# Create new project at https://supabase.com
# Get your credentials and add to .env.local

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Migrations
```bash
# Connect to your project
supabase link --project-ref <your-ref>

# Run all migrations
supabase migration up

# Or manually execute: supabase/migrations/010_kiluva_marketplace_schema.sql
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

## Default Test Accounts

### Admin Account
- Email: admin@kiluva.com
- Password: AdminPass123!
- Role: admin
- Access: `/admin/dashboard`

### Owner Account
- Email: owner@kiluva.com
- Password: OwnerPass123!
- Role: owner
- Access: `/owner/dashboard`

### Customer Account
- Email: customer@kiluva.com
- Password: CustomerPass123!
- Role: customer
- Access: `/dashboard`

## Core Pages

### Public Pages
| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Feature showcase |
| Search | `/search` | Advanced property search |
| Browse | `/browse` | Featured properties |
| Property Detail | `/properties/[id]` | Full property information |
| Shop | `/shop` | E-commerce products |

### Customer Pages
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Bookings & profile |
| Bookings | `/dashboard/bookings` | Booking history |
| Booking Flow | `/booking` | Multi-step booking (6 steps) |
| Messages | `/messages` | Messaging with owners |

### Owner Pages
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/owner/dashboard` | Overview & stats |
| Properties | `/owner/properties` | Manage listings |
| Bookings | `/owner/bookings` | Manage reservations |

### Admin Pages
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/dashboard` | Platform overview |
| Bookings | `/admin/bookings` | All bookings |
| Users | `/admin/users` | User management |
| Properties | `/admin/properties` | Property verification |

## Key Features to Test

### 1. Property Browsing
```
1. Go to http://localhost:3000
2. Click "Browse Properties" or go to /search
3. Use filters to search
4. Click on property to view details
```

### 2. Booking Flow
```
1. View a property at /properties/[id]
2. Click "Book This Property" or "Book This Room"
3. Complete 6-step booking form:
   - Select dates
   - Enter guest count
   - Fill personal info
   - Select add-ons
   - Review booking
   - Select payment method (demo)
4. Click confirm to complete
```

### 3. Owner Dashboard
```
1. Login as owner@kiluva.com
2. Go to /owner/dashboard
3. View properties and bookings
4. Click "Manage Properties" to add/edit
5. Click "View Bookings" to see reservations
```

### 4. Messaging
```
1. Go to /messages
2. Start conversation with owner
3. Send and receive messages
4. See real-time updates
```

### 5. Admin Functions
```
1. Login as admin@kiluva.com
2. Go to /admin/dashboard
3. View platform statistics
4. Access management sections
5. Monitor all bookings and users
```

## API Endpoints

### Bookings
```
POST /api/bookings/create
- Create new booking
- Body: { propertyId, checkInDate, checkOutDate, ... }

GET /api/bookings/[id]
- Get booking details
- Response: { id, item_name, user_name, total_price, ... }
```

### Cart (E-commerce)
```
POST /api/cart/add
- Add item to cart
- Body: { productId, quantity }

GET /api/cart
- Get cart contents
```

### Reviews
```
POST /api/reviews/submit
- Submit review
- Body: { itemId, itemType, rating, comment }

GET /api/reviews/[itemId]
- Get item reviews
```

## Database Schema Highlights

### Main Tables
- **properties** - Property listings with images, amenities, pricing
- **rooms** - Individual rooms within properties
- **cars** - Car rental inventory
- **services** - Service offerings
- **bookings** - All booking records (universal)
- **shop_products** - E-commerce products
- **conversations** - Messaging conversations
- **messages** - Individual messages
- **reviews** - Rating and review system
- **users** - User accounts with roles

### Key Relationships
```
properties → rooms (one-to-many)
users → bookings (one-to-many)
properties → bookings (one-to-many)
bookings → messages (through conversation)
users → conversations (many-to-many)
```

## Component Usage

### Search Filters
```tsx
import { LocationFilter, PropertyFilters } from '@/components/search'

<LocationFilter onSelect={(location) => setLocation(location)} />
<PropertyFilters onFiltersChange={(filters) => handleFilter(filters)} />
```

### Property Card
```tsx
import { PropertyCard } from '@/components/marketplace'

<PropertyCard
  id={property.id}
  name={property.name}
  location={property.location}
  price={property.base_price_per_night}
  image={property.images[0]}
/>
```

### Image Gallery
```tsx
import { ImageGallery } from '@/components/marketplace'

<ImageGallery images={property.images} title={property.name} />
```

### Date Range Picker
```tsx
import { DateRangePicker } from '@/components/marketplace'

<DateRangePicker
  onRangeChange={(from, to) => handleDateRange(from, to)}
/>
```

## Service Layer Usage

### Search Properties
```typescript
import { searchProperties } from '@/lib/services/marketplace.service'

const results = await searchProperties({
  location: 'Kigali',
  minPrice: 100,
  maxPrice: 500,
  limit: 10,
})
```

### Create Booking
```typescript
import { createBooking } from '@/lib/services/marketplace.service'

const booking = await createBooking({
  itemId: 1,
  itemType: 'property',
  userId: 'user-id',
  checkInDate: '2026-05-01',
  checkOutDate: '2026-05-07',
  numberOfGuests: 2,
})
```

### Get Reviews
```typescript
import { getReviewsByProperty } from '@/lib/services/marketplace.service'

const reviews = await getReviewsByProperty(propertyId)
```

## Troubleshooting

### Database Connection Error
```bash
# Check Supabase credentials in .env.local
# Verify project is running in Supabase dashboard
supabase status
```

### Migration Issues
```bash
# Reset and re-run migrations
supabase db reset
supabase migration up
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

## Performance Tips

1. **Image Optimization**: Use Next.js Image component
2. **Data Caching**: Implement SWR for client-side queries
3. **Database Queries**: Use select() to limit fields
4. **RLS Policies**: Ensure efficient policy checks
5. **API Routes**: Use proper caching headers

## Common Tasks

### Add a New Property Type
1. Add entry to `property_type` enum in database
2. Create component for property-specific booking fields
3. Update booking flow to include new fields
4. Add filters for new property type

### Add a New Service
1. Insert into `services` table via Supabase admin
2. Add to service selection in booking flow
3. Update pricing calculations
4. Test in booking confirmation

### Create Admin User
```sql
-- In Supabase SQL editor
UPDATE users 
SET role = 'admin' 
WHERE email = 'newadmin@kiluva.com';
```

### View Database
```bash
# Open Supabase admin dashboard
# Project → SQL Editor → View tables
# Or use: supabase db pull
```

## Next Actions

1. **Test Booking Flow**: Complete full booking from search to confirmation
2. **Verify Messaging**: Send messages between accounts
3. **Check Admin Tools**: View all bookings and users
4. **Review Database**: Inspect tables and data in Supabase
5. **Test Payment**: Configure payment gateway when ready

## Documentation Files

- `KILUVA_MARKETPLACE_PLAN.md` - Overall strategy (10 phases)
- `KILUVA_COMPLETE_IMPLEMENTATION.md` - Full implementation details
- `DEPLOYMENT_GUIDE.md` - Production deployment checklist
- `PHASE_3_SEARCH_AND_BROWSE.md` - Search system docs
- `PHASE_4_OWNER_DASHBOARD.md` - Owner features docs
- `UI_COMPONENTS_BUILT.md` - Component library reference

## Support

For questions or issues:
1. Check TypeScript types in `lib/types/marketplace.ts`
2. Review service functions in `lib/services/marketplace.service.ts`
3. Examine existing implementations in `/app` pages
4. Check component props and usage in `/components`

---

**Ready to start building!** Your KILUVA marketplace is fully functional and ready for customization.
