"""
Fix admin password: Re-hash using pbkdf2:sha256 (Python 3.7 compatible).
Run this once: python fix_admin.py
"""
from app import create_app
from models import db
from models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

ADMIN_EMAIL = "admin@herbnest.com"
ADMIN_PASSWORD = "Admin@123"   # change this if needed
ADMIN_NAME = "Admin"

with app.app_context():
    admin = User.query.filter_by(email=ADMIN_EMAIL).first()
    
    # Force pbkdf2:sha256 — works on Python 3.7
    new_hash = generate_password_hash(ADMIN_PASSWORD, method='pbkdf2:sha256')
    
    if admin:
        admin.password = new_hash
        admin.role = 'admin'
        db.session.commit()
        print(f"[OK] Admin password reset successfully for: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
    else:
        # Create admin from scratch
        new_admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password=new_hash,
            role='admin'
        )
        db.session.add(new_admin)
        db.session.commit()
        print(f"[OK] Admin user created: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
