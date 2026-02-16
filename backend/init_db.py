"""
Database migration script to create all tables.
Run this before starting the application.
"""

from sqlalchemy import text
from app.database.db import engine
from app.database.base import Base
from app.models.user import User
from app.models.property import Property, Room
from app.models.booking import Booking, BookingService
from app.models.service import Service
from app.models.car import Car, CarBooking
from app.models.payment import Payment


def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All database tables created successfully!")


def drop_db():
    """Drop all database tables."""
    print("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ All database tables dropped!")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        drop_db()
    else:
        init_db()
