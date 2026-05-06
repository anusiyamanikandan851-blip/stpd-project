import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from models import db
from models.herb import Herb

def update_images():
    updates = {
        'Moringa Powder': '/images/powders/moringa_powder.jpg',
        'Spirulina Powder': '/images/powders/spirulina_powder.jpg',
        'Athimadhuram (Liquorice)': '/images/herbs/athimadhuram.jpg',
        'Kadukkai (Haritaki)': '/images/herbs/kadukkai.jpg',
        'Thandrikkai (Bibhitaki)': '/images/herbs/thandrikkai.jpg',
        'Gotu Kola': '/images/herbs/gotu_kola.jpg',
        'Sirukurinjan (Gymnema)': '/images/herbs/sirukurinjan.jpg',
        'Kappikachu': '/images/powders/kappikachu.jpg'
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
