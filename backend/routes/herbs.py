from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models.herb import Herb
from models.order import Order, OrderItem
from models import db
from sqlalchemy import func

herbs_bp = Blueprint('herbs', __name__)

def _herb_to_dict(h):
    # Dynamic Pricing Engine
    c_price = h.price
    if getattr(h, 'is_rare', False):
        c_price *= 1.15
    if getattr(h, 'stock', 0) < 15:
        c_price *= 1.10
    if getattr(h, 'discount', 0.0) > 0:
        c_price -= h.discount
        
    if c_price < 0: c_price = 0

    return {
        "id": h.id,
        "name": h.name,
        "description": h.description,
        "uses": h.uses,
        "category": getattr(h, 'category', 'Herbs'),
        "origin": getattr(h, 'origin', 'Ayurveda'),
        "benefits": getattr(h, 'benefits', ''),
        "usage_instructions": getattr(h, 'usage_instructions', ''),
        "is_rare": getattr(h, 'is_rare', False),
        "discount": getattr(h, 'discount', 0.0),
        "original_price": h.price,
        "price": round(c_price, 2),
        "stock": h.stock,
        "image_url": h.image_url
    }

@herbs_bp.route('/', methods=['GET'])
def get_herbs():
    herbs = Herb.query.all()
    return jsonify([_herb_to_dict(h) for h in herbs]), 200

@herbs_bp.route('/<int:herb_id>', methods=['GET'])
def get_herb(herb_id):
    h = Herb.query.get_or_404(herb_id)
    return jsonify(_herb_to_dict(h)), 200

@herbs_bp.route('/search', methods=['GET'])
def search_herbs():
    """Smart search + filter: ?q=tulsi&min_price=0&max_price=500&symptom=headache"""
    q = request.args.get('q', '').strip().lower()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    symptom = request.args.get('symptom', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    
    query = Herb.query
    
    if q:
        query = query.filter(
            db.or_(
                func.lower(Herb.name).contains(q),
                func.lower(Herb.description).contains(q),
                func.lower(Herb.uses).contains(q)
            )
        )
    
    if symptom:
        query = query.filter(func.lower(Herb.uses).contains(symptom))
        
    if category:
        query = query.filter(func.lower(Herb.category) == category)
    
    if min_price is not None:
        query = query.filter(Herb.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Herb.price <= max_price)
    
    herbs = query.all()
    return jsonify([_herb_to_dict(h) for h in herbs]), 200

@herbs_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """
    Personalized recommendations:
    - If logged-in: based on order history uses/categories & trending
    - If not logged-in: trending herbs (most purchased overall)
    """
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        from flask_jwt_extended import get_jwt_identity
        user_id = get_jwt_identity()
    except Exception:
        pass
    
    # Get top trending herbs (most ordered)
    trending_query = db.session.query(
        Herb.id, func.sum(OrderItem.quantity).label('total')
    ).join(OrderItem).group_by(Herb.id).order_by(func.sum(OrderItem.quantity).desc())
    
    trending_ids = [row.id for row in trending_query.limit(10).all()]
    
    if user_id:
        # Herbs the user already ordered
        user_ordered = db.session.query(OrderItem.herb_id).join(Order).filter(
            Order.user_id == user_id
        ).distinct().all()
        ordered_ids = {row.herb_id for row in user_ordered}
        
        # Get uses keywords from ordered herbs to find similar
        ordered_herbs = Herb.query.filter(Herb.id.in_(ordered_ids)).all() if ordered_ids else []
        uses_keywords = set()
        for h in ordered_herbs:
            words = h.uses.lower().split()
            uses_keywords.update(w for w in words if len(w) > 4)
        
        # Find similar herbs not yet purchased
        personalized = []
        if uses_keywords:
            all_herbs = Herb.query.filter(~Herb.id.in_(ordered_ids)).all() if ordered_ids else Herb.query.all()
            scored = []
            for h in all_herbs:
                score = sum(1 for kw in uses_keywords if kw in h.uses.lower())
                if score > 0:
                    scored.append((score, h))
            scored.sort(key=lambda x: x[0], reverse=True)
            personalized = [_herb_to_dict(h) for _, h in scored[:6]]
        
        if len(personalized) < 4:
            # Fallback: trending herbs not ordered
            extra = Herb.query.filter(
                Herb.id.in_(trending_ids), ~Herb.id.in_(ordered_ids)
            ).limit(6).all() if ordered_ids else Herb.query.filter(Herb.id.in_(trending_ids)).limit(6).all()
            seen = {h['id'] for h in personalized}
            for h in extra:
                if h.id not in seen:
                    personalized.append(_herb_to_dict(h))
        
        return jsonify(personalized[:6]), 200
    
    else:
        # Not logged in — return trending
        herbs = Herb.query.filter(Herb.id.in_(trending_ids)).limit(6).all()
        if not herbs:
            herbs = Herb.query.limit(6).all()
        return jsonify([_herb_to_dict(h) for h in herbs]), 200
