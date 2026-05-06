from flask import Blueprint, request, jsonify
import stripe
from config import Config
from models import db
from models.order import Order
from flask_jwt_extended import jwt_required

stripe.api_key = Config.STRIPE_SECRET_KEY

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-payment', methods=['POST'])
def create_payment():
    data = request.get_json()
    order_id = data.get('order_id')
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"msg": "Order not found"}), 404
        
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(order.total_price * 100), # amount in cents
            currency='usd',
            metadata={'order_id': order.id}
        )
        return jsonify({
            'clientSecret': intent['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

@payments_bp.route('/verify-payment', methods=['POST'])
def verify_payment():
    data = request.get_json()
    payment_intent_id = data.get('payment_intent_id')
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status == 'succeeded':
            order_id = intent.metadata.get('order_id')
            if order_id:
                order = Order.query.get(int(order_id))
                if order:
                    order.payment_status = 'paid'
                    order.stripe_payment_id = payment_intent_id
                    db.session.commit()
                    return jsonify({"msg": "Payment verified"}), 200
        return jsonify({"msg": "Payment not verified"}), 400
    except Exception as e:
        return jsonify(error=str(e)), 403
