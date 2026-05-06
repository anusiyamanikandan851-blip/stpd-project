from . import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(50), default='pending') # pending, paid, failed
    stripe_payment_id = db.Column(db.String(255), nullable=True)
    order_status = db.Column(db.String(50), default='created') # created, processing, shipped, delivered, cancelled
    tracking_id = db.Column(db.String(255), nullable=True)
    delivery_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    herb_id = db.Column(db.Integer, db.ForeignKey('herbs.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    
    herb = db.relationship('Herb')
