import sqlite3
import os
from app import create_app
from flask_jwt_extended import create_access_token

app = create_app()

with app.app_context():
    # create a fake token for admin user
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'herbs.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE is_admin=1 LIMIT 1")
    admin_id = c.fetchone()[0]
    
    token = create_access_token(identity=str(admin_id))

    import requests
    response = requests.get('http://localhost:5000/admin/orders', headers={'Authorization': f'Bearer {token}'})
    print("Status code:", response.status_code)
    try:
        print("Response:", response.json())
    except:
        print("Raw response:", response.text)
