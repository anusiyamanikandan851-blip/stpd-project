from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.wishlist import Wishlist
from models.herb import Herb
from models import db

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    items = Wishlist.query.filter_by(user_id=user_id).order_by(Wishlist.created_at.desc()).all()
    result = []
    for w in items:
        result.append({
            "wishlist_id": w.id,
            "herb_id": w.herb_id,
            "name": w.herb.name,
            "description": w.herb.description,
            "price": w.herb.price,
            "image_url": w.herb.image_url,
            "stock": w.herb.stock,
            "added_at": w.created_at.isoformat()
        })
    return jsonify(result), 200

@wishlist_bp.route('/', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    user_id = get_jwt_identity()
    data = request.get_json()
    herb_id = data.get('herb_id')
    
    if not herb_id:
        return jsonify({"msg": "herb_id is required"}), 400
    
    herb = Herb.query.get(herb_id)
    if not herb:
        return jsonify({"msg": "Herb not found"}), 404
    
    existing = Wishlist.query.filter_by(user_id=user_id, herb_id=herb_id).first()
    if existing:
        return jsonify({"msg": "Already in wishlist"}), 409
    
    item = Wishlist(user_id=user_id, herb_id=herb_id)
    db.session.add(item)
    db.session.commit()
    return jsonify({"msg": "Added to wishlist", "wishlist_id": item.id}), 201

@wishlist_bp.route('/<int:herb_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(herb_id):
    user_id = get_jwt_identity()
    item = Wishlist.query.filter_by(user_id=user_id, herb_id=herb_id).first()
    if not item:
        return jsonify({"msg": "Not found in wishlist"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Removed from wishlist"}), 200

@wishlist_bp.route('/ids', methods=['GET'])
@jwt_required()
def get_wishlist_ids():
    """Return just the herb IDs for quick frontend lookup"""
    user_id = get_jwt_identity()
    items = Wishlist.query.filter_by(user_id=user_id).all()
    return jsonify([w.herb_id for w in items]), 200
