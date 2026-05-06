from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.order import Order, OrderItem
from models.herb import Herb
from models.notification import Notification
from models import db

orders_bp = Blueprint('orders', __name__)

def _create_notification(user_id, message, notif_type='order'):
    try:
        notif = Notification(user_id=user_id, message=message, type=notif_type)
        db.session.add(notif)
    except Exception:
        pass  # Don't fail the order if notification fails

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    items = data.get('items', [])
    
    if not items:
        return jsonify({"msg": "Order must contain items"}), 400
        
    total_price = 0
    order_items = []
    herb_names = []
    
    for item in items:
        h_id = item.get('herb_id') or item.get('id')
        if not h_id:
            continue
        herb = Herb.query.get(h_id)
        if not herb:
            continue
        total_price += herb.price * item['quantity']
        order_items.append(OrderItem(herb_id=herb.id, quantity=item['quantity']))
        herb_names.append(herb.name)
        
    new_order = Order(user_id=user_id, total_price=total_price)
    db.session.add(new_order)
    db.session.flush()
    
    for oi in order_items:
        oi.order_id = new_order.id
        db.session.add(oi)
    
    # Create order confirmation notification
    names_str = ', '.join(herb_names[:3])
    if len(herb_names) > 3:
        names_str += f' +{len(herb_names)-3} more'
    _create_notification(
        user_id,
        f"🎉 Order #{new_order.id} placed! Items: {names_str}. Total: ₹{total_price:.2f}",
        'order'
    )
    
    db.session.commit()
    
    return jsonify({"msg": "Order created", "order_id": new_order.id, "total_price": total_price}), 201

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "total_price": o.total_price,
            "payment_status": o.payment_status,
            "order_status": o.order_status,
            "tracking_id": o.tracking_id,
            "delivery_date": o.delivery_date.isoformat() if o.delivery_date else None,
            "created_at": o.created_at.isoformat(),
            "items": [{"herb_id": i.herb_id, "herb_name": i.herb.name, "quantity": i.quantity} for i in o.items]
        })
    return jsonify(result), 200
