import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from models import db
from models.herb import Herb

def update_oils():
    updates = {
        'Mahanarayan Oil': '/images/oils/mahanarayan_oil.jpg',
        'Anu Thailam': '/images/oils/anu_thailam.jpg',
        'Ksheerabala Thailam': '/images/oils/ksheerabala_thailam.jpg',
        'Pind Thailam': '/images/oils/pind_thailam.jpg',
        'Nalpamaradi Thailam': '/images/oils/nalpamaradi_thailam.jpg'
    }

    with app.app_context():
        updated = 0
        for name, img in updates.items():
            h = Herb.query.filter_by(name=name).first()
            if h:
                h.image_url = img
                updated += 1
        
        db.session.commit()
        print(f"Successfully updated image URLs for {updated} thailams/oils.")

if __name__ == '__main__':
    update_oils()
