from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.order import Order, OrderItem
from models.herb import Herb
from models.notification import Notification
from models import db
from sqlalchemy import func
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard_stats():
    total_users = User.query.filter_by(role='user').count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total_price)).scalar() or 0.0
    
    # Frequently bought herbs
    top_herbs_query = db.session.query(
        Herb.name, func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem).group_by(Herb.id).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()
    top_herbs = [{"name": row.name, "sold": row.total_sold} for row in top_herbs_query]
    
    # Revenue by month (last 6 months)
    from sqlalchemy import extract
    monthly_data = db.session.query(
        extract('year', Order.created_at).label('year'),
        extract('month', Order.created_at).label('month'),
        func.sum(Order.total_price).label('revenue'),
        func.count(Order.id).label('orders')
    ).filter(Order.payment_status == 'paid').group_by('year', 'month').order_by('year', 'month').limit(12).all()
    
    monthly_revenue = []
    month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    for row in monthly_data:
        monthly_revenue.append({
            "month": month_names[int(row.month) - 1],
            "revenue": round(float(row.revenue), 2),
            "orders": row.orders
        })
    
    # Low stock items (< 10)
    low_stock = Herb.query.filter(Herb.stock < 10).count()
    
    return jsonify({
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "frequently_bought_herbs": top_herbs,
        "monthly_revenue": monthly_revenue,
        "low_stock": low_stock
    }), 200

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        items = [{"herb_name": item.herb.name, "quantity": item.quantity} for item in o.items]
        result.append({
            "id": o.id,
            "user": o.user.name,
            "user_email": o.user.email,
            "total_price": o.total_price,
            "payment_status": o.payment_status,
            "stripe_payment_id": o.stripe_payment_id,
            "order_status": o.order_status,
            "tracking_id": o.tracking_id,
            "delivery_date": o.delivery_date.isoformat() if o.delivery_date else None,
            "created_at": o.created_at.isoformat(),
            "items": items
        })
    return jsonify(result), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = ['created', 'processing', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({"msg": "Invalid status"}), 400
        
    order.order_status = new_status
    
    if 'tracking_id' in data:
        order.tracking_id = data['tracking_id']
    if 'delivery_date' in data and data['delivery_date']:
        try:
            # handle formats like 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'
            order.delivery_date = datetime.fromisoformat(data['delivery_date'].replace('Z', '+00:00'))
        except ValueError:
            pass

    # Notify the user about status change
    status_messages = {
        'processing': f'🔄 Your Order #{order_id} is now being processed!',
        'shipped': f'🚚 Great news! Your Order #{order_id} has been shipped and is on its way!',
        'delivered': f'✅ Your Order #{order_id} has been delivered. Enjoy your herbs!',
        'cancelled': f'❌ Your Order #{order_id} has been cancelled. Contact support if needed.'
    }
    if new_status in status_messages:
        notif = Notification(
            user_id=order.user_id,
            message=status_messages[new_status],
            type='order'
        )
        db.session.add(notif)
    
    db.session.commit()
    return jsonify({"msg": f"Order status updated to {new_status}"}), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.filter_by(role='user').all()
    result = []
    for u in users:
        total_orders = len(u.orders)
        items = OrderItem.query.join(Order).filter(Order.user_id == u.id).all()
        plant_counts = {}
        for item in items:
            name = item.herb.name
            plant_counts[name] = plant_counts.get(name, 0) + item.quantity
        frequent_plants = sorted(plant_counts.items(), key=lambda x: x[1], reverse=True)
        top_plants = [{"name": name, "count": count} for name, count in frequent_plants[:3]]
        
        user_orders = [{"id": o.id, "total": o.total_price, "status": o.order_status, "date": o.created_at.isoformat()} for o in u.orders]
        user_orders.sort(key=lambda x: x["date"], reverse=True)

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": "Active",
            "last_login": u.created_at.isoformat(),
            "total_orders": total_orders,
            "frequent_plants": top_plants,
            "orders_list": user_orders[:5] # Top 5 recent
        })
    return jsonify(result), 200

from models.feedback import Feedback

@admin_bp.route('/feedbacks', methods=['GET'])
@admin_required
def get_feedbacks():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    result = [{
        "id": f.id,
        "user_name": f.user.name,
        "message": f.message,
        "rating": f.rating,
        "created_at": f.created_at.isoformat()
    } for f in feedbacks]
    return jsonify(result), 200

@admin_bp.route('/herbs', methods=['GET'])
@admin_required
def get_herbs():
    herbs = Herb.query.order_by(Herb.id.desc()).all()
    result = [{
        "id": h.id,
        "name": h.name,
        "description": h.description,
        "category": h.category,
        "price": h.price,
        "stock": h.stock,
        "image_url": h.image_url
    } for h in herbs]
    return jsonify(result), 200

@admin_bp.route('/herbs', methods=['POST'])
@admin_required
def create_herb():
    data = request.get_json()
    new_herb = Herb(
        name=data.get('name'),
        description=data.get('description'),
        category=data.get('category', 'Herbs'),
        price=float(data.get('price', 0.0)),
        stock=int(data.get('stock', 0)),
        image_url=data.get('image_url', '/images/default-herb.png'),
        uses=data.get('uses', 'General wellness')
    )
    db.session.add(new_herb)
    db.session.commit()
    return jsonify({"msg": "Herb created successfully", "id": new_herb.id}), 201

@admin_bp.route('/herbs/<int:herb_id>', methods=['PUT'])
@admin_required
def update_herb(herb_id):
    herb = Herb.query.get_or_404(herb_id)
    data = request.get_json()
    
    herb.name = data.get('name', herb.name)
    herb.description = data.get('description', herb.description)
    herb.category = data.get('category', herb.category)
    if 'price' in data: herb.price = float(data['price'])
    if 'stock' in data: herb.stock = int(data['stock'])
    herb.image_url = data.get('image_url', herb.image_url)
    
    db.session.commit()
    return jsonify({"msg": "Herb updated successfully"}), 200

@admin_bp.route('/herbs/<int:herb_id>', methods=['DELETE'])
@admin_required
def delete_herb(herb_id):
    herb = Herb.query.get_or_404(herb_id)
    # Be careful when deleting if it sits in OrderItems. Normally we use soft delete.
    db.session.delete(herb)
    db.session.commit()
    return jsonify({"msg": "Herb deleted successfully"}), 200

from models.review import Review

@admin_bp.route('/reviews', methods=['GET'])
@admin_required
def get_all_reviews():
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    result = [{
        "id": r.id,
        "user_name": r.user.name,
        "herb_name": r.herb.name,
        "herb_id": r.herb_id,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at.isoformat()
    } for r in reviews]
    return jsonify(result), 200

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    db.session.delete(review)
    db.session.commit()
    return jsonify({"msg": "Review deleted"}), 200
