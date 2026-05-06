import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from models import db
from models.herb import Herb

def update_images():
    updates = {
        'Safed Musli': '/images/herbs/safed_musli.jpg',
        'Punarnava': '/images/herbs/punarnava.jpg',
        'Giloy (Guduchi)': '/images/herbs/guduchi.jpg',
        'Manjistha': '/images/herbs/manjistha.jpg',
        'Kadal Azhinji (Salacia)': '/images/herbs/salacia.jpg',
        'Kalmegh': '/images/herbs/kalmegh.jpg',
        'Senna Leaves': '/images/herbs/senna_leaves.jpg',
        'Kesar (Saffron Threads)': '/images/herbs/kesar.jpg'
    }

    with app.app_context():
        updated = 0
        for name, img in updates.items():
            h = Herb.query.filter_by(name=name).first()
            if h:
                h.image_url = img
                updated += 1
        
        db.session.commit()
        print(f"Successfully updated image URLs for {updated} products.")

if __name__ == '__main__':
    update_images()
