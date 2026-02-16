from enum import Enum


class UserRole(str, Enum):
    """User roles in the system."""
    CLIENT = "client"
    ADMIN = "admin"


class PropertyType(str, Enum):
    """Types of properties available."""
    VILLA = "villa"
    APARTMENT = "apartment"
    ROOM = "room"


class BookingStatus(str, Enum):
    """Booking status states."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class CarAvailabilityStatus(str, Enum):
    """Car availability states."""
    AVAILABLE = "available"
    BOOKED = "booked"
    MAINTENANCE = "maintenance"


class PaymentStatus(str, Enum):
    """Payment status states."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    """Available payment methods."""
    PAYPAL = "paypal"
    MOMO = "momo"
    CARD = "card"


class ServiceType(str, Enum):
    """Available additional services."""
    AIRPORT_TRANSFER = "airport_transfer"
    HOUSEKEEPING = "housekeeping"
    CHEF = "chef"
    MASSAGE_SPA = "massage_spa"
    SHOPPING_TOUR = "shopping_tour"
