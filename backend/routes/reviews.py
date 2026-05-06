from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.review import Review
from models.herb import Herb
from models import db
from sqlalchemy import func

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/<int:herb_id>', methods=['GET'])
def get_reviews(herb_id):
    herb = Herb.query.get(herb_id)
    if not herb:
        return jsonify({"msg": "Herb not found"}), 404
    
    reviews = Review.query.filter_by(herb_id=herb_id).order_by(Review.created_at.desc()).all()
    
    avg_rating = db.session.query(func.avg(Review.rating)).filter_by(herb_id=herb_id).scalar()
    avg_rating = round(float(avg_rating), 1) if avg_rating else 0.0
    
    result = [{
        "id": r.id,
        "user_name": r.user.name,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at.isoformat()
    } for r in reviews]
    
    return jsonify({
        "reviews": result,
        "average_rating": avg_rating,
        "total_reviews": len(result)
    }), 200

@reviews_bp.route('/<int:herb_id>', methods=['POST'])
@jwt_required()
def submit_review(herb_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment', '').strip()
    
    if not rating or not (1 <= int(rating) <= 5):
        return jsonify({"msg": "Rating must be between 1 and 5"}), 400
    
    herb = Herb.query.get(herb_id)
    if not herb:
        return jsonify({"msg": "Herb not found"}), 404
    
    # Allow multiple reviews from the same user (they can review again after buying more)
    review = Review(user_id=user_id, herb_id=herb_id, rating=int(rating), comment=comment)
    db.session.add(review)
    db.session.commit()
    
    return jsonify({"msg": "Review submitted", "review_id": review.id}), 201

@reviews_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_reviews():
    """Admin endpoint to get all reviews across all herbs"""
    from models.user import User
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    
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
