from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.user import User
from models import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"msg": "Missing required fields"}), 400
        
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"msg": "User or Email ID is already registered!"}), 400
        
    role = data.get('role', 'user')
    if role == 'admin':
        return jsonify({"msg": "Admin registration is disabled. Only one admin is allowed."}), 403

    hashed_password = generate_password_hash(data['password'])
    new_user = User(name=data['name'], email=data['email'], password=hashed_password, role='user')
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(new_user.id), additional_claims={"role": new_user.role})
    return jsonify({
        "msg": "User registered successfully",
        "access_token": access_token,
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "role": new_user.role}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid email or password"}), 401
        
    requested_role = data.get('role', 'user')
    if requested_role == 'admin' and user.role != 'admin':
        return jsonify({"msg": "Access Denied: You do not have admin privileges."}), 403
        
    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": access_token, "role": user.role, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}), 200
