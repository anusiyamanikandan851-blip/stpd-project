from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from services.analytics_service import AnalyticsService

admin_analytics_bp = Blueprint('admin_analytics', __name__)

def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.role == 'admin'

@admin_analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    if not is_admin():
        return jsonify({"message": "Unauthorized"}), 403
    return jsonify(AnalyticsService.get_summary()), 200

@admin_analytics_bp.route('/top-products', methods=['GET'])
@jwt_required()
def get_top_products():
    if not is_admin():
        return jsonify({"message": "Unauthorized"}), 403
    return jsonify(AnalyticsService.get_top_products()), 200

@admin_analytics_bp.route('/revenue-trend', methods=['GET'])
@jwt_required()
def get_revenue_trend():
    if not is_admin():
        return jsonify({"message": "Unauthorized"}), 403
    return jsonify(AnalyticsService.get_revenue_trend()), 200
