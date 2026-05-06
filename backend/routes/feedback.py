from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.feedback import Feedback
from models import db

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/', methods=['POST'])
@jwt_required()
def submit_feedback():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    message = data.get('message')
    rating = data.get('rating')
    
    if not message or not rating:
        return jsonify({"msg": "Message and rating are required"}), 400
        
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError
    except:
        return jsonify({"msg": "Rating must be an integer between 1 and 5"}), 400
        
    feedback = Feedback(user_id=user_id, message=message, rating=rating)
    db.session.add(feedback)
    db.session.commit()
    
    return jsonify({"msg": "Feedback submitted successfully"}), 201
    
@feedback_bp.route('/', methods=['GET'])
def get_feedback():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).limit(20).all()
    result = []
    for f in feedbacks:
        result.append({
            "id": f.id,
            "user_name": f.user.name,
            "message": f.message,
            "rating": f.rating,
            "created_at": f.created_at.isoformat()
        })
    return jsonify(result), 200
