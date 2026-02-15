# Luxury Booking Platform - FastAPI Backend

A production-ready FastAPI backend for managing luxury property bookings, including villas, apartments, rooms, car rentals, and additional services with integrated payment processing.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (Client, Admin)
- **Property Management**: Create and manage properties, rooms, with filtering and detailed listings
- **Booking System**: Advanced booking with availability checking, conflict detection, and date validation
- **Pricing Engine**: Dynamic pricing calculations including room modifiers, services, and car rentals
- **Services Management**: Offer additional services (Airport Transfer, Housekeeping, Chef, Massage & Spa, Shopping Tour)
- **Car Rental**: Manage car inventory with availability checking and rental pricing
- **Payment Integration**: Stub implementations for PayPal and Rwanda MoMo with webhook handlers
- **Comprehensive API**: Full REST API with 50+ endpoints, auto-documented with Swagger UI

## Technology Stack

- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Pydantic v2
- **Server**: Uvicorn

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── dependencies.py         # Authentication dependencies
│   ├── core/
│   │   ├── config.py          # Configuration from env vars
│   │   ├── security.py        # JWT and password utilities
│   │   └── constants.py       # Enums and app constants
│   ├── database/
│   │   ├── db.py              # Database connection & sessions
│   │   └── base.py            # Base model classes
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── booking.py
│   │   ├── service.py
│   │   ├── car.py
│   │   └── payment.py
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routes/                 # API route handlers
│   ├── services/               # Business logic layer
│   └── crud/                   # Database CRUD operations
├── init_db.py                  # Database initialization script
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── docker-compose.yml          # Docker setup
```

## Installation

### Prerequisites

- Python 3.9+
- PostgreSQL 14+
- pip or conda

### Setup

1. **Clone repository and navigate to backend**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**:
```bash
python init_db.py
```

6. **Run server**:
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/luxury_booking_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=False
APP_NAME=Luxury Booking Platform API
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info
- `POST /change-password` - Change password

### Properties (`/api/properties`)
- `GET /` - List properties with filters
- `GET /{id}` - Get property details with rooms
- `POST /` - Create property (admin)
- `PUT /{id}` - Update property (admin)
- `DELETE /{id}` - Delete property (admin)
- `POST /{id}/rooms` - Create room (admin)
- `GET /{id}/rooms` - List rooms in property
- `PUT /{id}/rooms/{room_id}` - Update room (admin)
- `DELETE /{id}/rooms/{room_id}` - Delete room (admin)

### Bookings (`/api/bookings`)
- `POST /` - Create booking
- `GET /me` - Get user's bookings
- `GET /{id}` - Get booking details
- `PUT /{id}` - Update booking (admin)
- `DELETE /{id}` - Cancel booking

### Services (`/api/services`)
- `GET /` - List services
- `GET /{id}` - Get service details
- `POST /` - Create service (admin)
- `PUT /{id}` - Update service (admin)
- `DELETE /{id}` - Delete service (admin)

### Cars (`/api/cars`)
- `GET /` - List cars
- `GET /{id}` - Get car details
- `GET /{id}/availability` - Check car availability
- `POST /` - Create car (admin)
- `PUT /{id}` - Update car (admin)
- `DELETE /{id}` - Delete car (admin)
- `POST /bookings` - Create car booking
- `GET /bookings/{id}` - Get car booking details
- `PUT /bookings/{id}` - Update car booking
- `DELETE /bookings/{id}` - Delete car booking

### Payments (`/api/payments`)
- `POST /` - Create payment
- `GET /me` - Get user's payments
- `GET /{id}` - Get payment details
- `POST /{id}/initiate` - Initiate payment processing
- `POST /webhook/paypal` - PayPal webhook handler
- `POST /webhook/momo` - MoMo webhook handler

## Key Business Logic

### Booking Availability Checking
- Prevents overlapping bookings for same room
- Booking entire property blocks all rooms
- Validates check-out is after check-in
- Conflict detection for date ranges

### Pricing Calculation
- Base price: property_price_per_night × number_of_nights
- Room modifier: property_price × room_modifier (if booking specific room)
- Services: sum of service prices × quantities
- Car rental: car_price_per_day × number_of_days
- Total: accommodation + services + car rental

### Authentication Flow
1. User registers with email and password (8+ chars)
2. Password hashed with bcrypt
3. Login returns access token (15 min) + refresh token (7 days)
4. Protected endpoints require Bearer token
5. Token refresh maintains session without login

## Testing

Create test data after initialization:

```python
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.crud.user import UserCRUD
from app.core.constants import PropertyType, UserRole

db = SessionLocal()

# Create admin user
admin = UserCRUD.create_user(
    db, "admin", "admin@example.com", "AdminPass123",
    role=UserRole.ADMIN
)

# Create client user
client = UserCRUD.create_user(
    db, "client", "client@example.com", "ClientPass123"
)
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., double booking)
- `500 Internal Server Error` - Server error

## Security Considerations

- Passwords hashed with bcrypt (cost=12)
- JWT tokens with expiration
- Refresh tokens separate from access tokens
- CORS configured for frontend origins
- SQL injection prevention via SQLAlchemy ORM
- Role-based access control
- User owns their bookings/payments
- Admin-only endpoints protected

## Deployment

### Docker

```bash
docker-compose up -d
```

### Heroku / Railway / Render

1. Ensure `Procfile` or Docker configuration
2. Set environment variables in platform dashboard
3. Deploy from Git repository

### AWS / Google Cloud / Azure

Use managed container services with PostgreSQL databases.

## Development

### Database Migrations

To add new models, modify `app/models/` and recreate database:

```bash
python init_db.py --drop  # Reset
python init_db.py         # Recreate with all tables
```

For production, use Alembic:

```bash
alembic init migrations
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

### Adding New Endpoints

1. Create schema in `app/schemas/`
2. Create CRUD in `app/crud/`
3. Create service (if needed) in `app/services/`
4. Create routes in `app/routes/`
5. Import router in `app/main.py`

## Payment Integration (Stubs)

PayPal and MoMo integrations are prepared but use stub implementations. To integrate:

1. Get API credentials from payment providers
2. Update `app/services/payment_service.py` with provider SDKs
3. Implement webhook signature validation
4. Test in sandbox environment first

## Support & Troubleshooting

- **Port already in use**: Change port with `--port 8001`
- **Database connection error**: Verify PostgreSQL running and DATABASE_URL correct
- **Migration issues**: Use `python init_db.py --drop` to reset
- **Token errors**: Ensure SECRET_KEY same across deployments

## License

Proprietary - Luxury Booking Platform
