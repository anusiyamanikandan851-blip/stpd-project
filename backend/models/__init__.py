from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .herb import Herb
from .order import Order, OrderItem
from .feedback import Feedback
from .symptom_map import SymptomHerbMap
from .wishlist import Wishlist
from .review import Review
from .notification import Notification
