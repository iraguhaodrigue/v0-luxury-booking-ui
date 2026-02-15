# Luxury Booking Platform Backend - Setup & API Guide

## Quick Start

1. **Clone the repository**
2. **Navigate to backend directory**: `cd backend`
3. **Copy environment file**: `cp .env.example .env`
4. **Install dependencies**: `pip install -r requirements.txt`
5. **Initialize database**: `python init_db.py`
6. **Run server**: `python -m uvicorn app.main:app --reload`

Access the API at: http://localhost:8000/docs

## Architecture Overview

### Core Layers

**Database Layer** (`app/database/`)
- Connection pooling and session management
- Base model classes with timestamps

**Models** (`app/models/`)
- 9 SQLAlchemy ORM models with relationships
- Automatic timestamps on create/update
- Cascade deletes for data integrity

**Schemas** (`app/schemas/`)
- Pydantic v2 validation schemas
- Separate request/response models
- Type hints throughout

**CRUD** (`app/crud/`)
- Database operations for each model
- Query building with filters
- Atomic transactions

**Services** (`app/services/`)
- Business logic implementation
- Availability checking
- Pricing calculations
- Payment processing

**Routes** (`app/routes/`)
- FastAPI route handlers
- Request/response mapping
- Authorization checks

## Key Features Implemented

### 1. User Authentication
```python
# Registration
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}

# Returns tokens
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {...}
}
```

### 2. Booking System
```python
# Create booking with availability check
POST /api/bookings
{
  "property_id": 1,
  "room_id": 2,
  "check_in": "2024-03-15",
  "check_out": "2024-03-20",
  "services": [{"service_id": 1, "quantity": 1}]
}

# Automatically calculates:
# - Base accommodation price
# - Room modifiers
# - Service costs
# - Checks for conflicts
# - Prevents double bookings
```

### 3. Dynamic Pricing
```python
# Example calculation:
property_price = 150/night
room_modifier = 1.2
nights = 5
services = 100 (airport transfer)

total = (150 * 1.2 * 5) + 100 = $1000
```

### 4. Car Rental Integration
```python
# Check availability and price
GET /api/cars/{car_id}/availability?start_date=2024-03-15&end_date=2024-03-20

# Returns:
{
  "available": true,
  "price_per_day": 80,
  "num_days": 5,
  "total_price": 400
}
```

### 5. Payment Processing
```python
# Create payment for booking
POST /api/payments
{
  "booking_id": 1,
  "payment_method": "paypal"
}

# Initiate with provider
POST /api/payments/{payment_id}/initiate

# Webhook handler
POST /api/payments/webhook/paypal
{
  "transaction_id": "...",
  "status": "completed"
}
```

## Database Schema

### Users Table
- id, username, email, password_hash, role, is_active
- Relationships: bookings, payments

### Properties Table
- id, name, description, location, price_per_night, property_type, images
- Relationships: rooms, bookings

### Rooms Table
- id, property_id, name, capacity, price_modifier, is_active
- Relationships: property, bookings

### Bookings Table
- id, user_id, property_id, room_id (nullable), check_in, check_out, total_price, status
- Relationships: user, property, room, services, car_bookings, payment

### BookingServices (Junction)
- id, booking_id, service_id, quantity, price_at_booking

### Services Table
- id, name, service_type (enum), price, is_active

### Cars Table
- id, name, brand, model, license_plate, price_per_day, availability_status

### CarBookings Table
- id, booking_id (nullable), car_id, start_date, end_date, total_price

### Payments Table
- id, booking_id, user_id, amount, payment_method, payment_status, transaction_id

## Authentication Flow

1. **Register**: User provides credentials → Password hashed with bcrypt → User created
2. **Login**: Email/password verified → JWT tokens generated → Tokens returned
3. **Protected Routes**: Bearer token in Authorization header → Decoded and validated
4. **Token Refresh**: Old refresh token → New access token generated
5. **Admin Check**: User role validated for admin endpoints

## Booking Validation Rules

1. **Date Validation**:
   - Check-out must be after check-in
   - Minimum 1 night stay

2. **Availability Checking**:
   - No overlapping bookings for same room
   - Entire property booking blocks all rooms
   - Cancelled bookings don't block dates

3. **Business Rules**:
   - User must be authenticated
   - Only one payment per booking
   - Payment required before confirmation

## Error Responses

All errors follow consistent format:

```json
{
  "detail": "Error message description"
}
```

Common status codes:
- `400` - Validation error (bad dates, conflicting bookings)
- `401` - Missing/invalid token
- `403` - Permission denied (not owner of booking)
- `404` - Resource not found
- `409` - Conflict (duplicate booking, already paid)

## Testing Scenarios

### Scenario 1: Full Booking Flow
```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Pass123!"}'

# 2. Login and get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'

# 3. Browse properties
curl http://localhost:8000/api/properties

# 4. Create booking
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"property_id":1,"check_in":"2024-03-15","check_out":"2024-03-20"}'

# 5. Create payment
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"payment_method":"paypal"}'
```

### Scenario 2: Admin Property Setup
```bash
# Create property (requires admin token)
curl -X POST http://localhost:8000/api/properties \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Luxury Villa",
    "location":"Kigali, Rwanda",
    "price_per_night":250,
    "property_type":"villa"
  }'

# Add room to property
curl -X POST http://localhost:8000/api/properties/1/rooms \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Master Suite",
    "capacity":2,
    "price_modifier":1.0
  }'
```

## Performance Optimization

- Connection pooling: pool_size=10, max_overflow=20
- Query filtering for active records
- Indexed fields: user_id, property_id, booking status, dates
- Lazy loading for relationships
- DB echo disabled in production

## Security Best Practices

1. **Password Security**:
   - Minimum 8 characters
   - Bcrypt hashing with cost 12
   - Never stored in plain text

2. **Token Security**:
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Tokens signed with SECRET_KEY
   - Never transmitted in URL

3. **Authorization**:
   - User can only access own bookings
   - Admin-only endpoints protected
   - Row-level ownership checks

4. **Data Protection**:
   - SQL injection prevention (ORM)
   - CORS configured
   - HTTPS in production
   - Environment variables for secrets

## Deployment Checklist

- [ ] Database backed up
- [ ] Environment variables set securely
- [ ] SECRET_KEY changed (strong, random)
- [ ] DEBUG set to False
- [ ] ALLOWED_ORIGINS updated for frontend
- [ ] CORS properly configured
- [ ] Database migrations run
- [ ] Payment API keys configured
- [ ] Webhooks configured for payment providers
- [ ] Logging enabled
- [ ] Monitoring set up
- [ ] Regular backups scheduled

## Next Steps

1. **Frontend Integration**: Connect Next.js frontend to API
2. **Payment Providers**: Integrate PayPal and MoMo SDKs
3. **Email Notifications**: Add confirmation emails for bookings
4. **Analytics**: Track bookings, revenue, popular properties
5. **Admin Dashboard**: Build admin interface for management
6. **Search & Filters**: Advanced property search with dates
7. **Reviews & Ratings**: Allow guests to review properties
8. **Refund Policy**: Implement cancellation and refund logic

## Support

For issues or questions:
1. Check the README.md in backend directory
2. Review API documentation at `/docs`
3. Check error messages in response body
4. Enable DEBUG mode for stack traces
