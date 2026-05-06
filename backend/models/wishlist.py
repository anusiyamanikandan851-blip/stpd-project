from . import db
from datetime import datetime

class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    herb_id = db.Column(db.Integer, db.ForeignKey('herbs.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('wishlist_items', lazy=True))
    herb = db.relationship('Herb', backref=db.backref('wishlisted_by', lazy=True))
    
    __table_args__ = (db.UniqueConstraint('user_id', 'herb_id', name='unique_wishlist'),)
