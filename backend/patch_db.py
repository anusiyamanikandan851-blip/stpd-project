import sys
import os

# Ensure the backend directory is in the absolute path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from models import db
from models.herb import Herb

def update_db():
    with app.app_context():
        updates = {
            'Ashwagandha Root': '/images/herbs/ashwagandha_root.jpg',
            'Neem Leaves': '/images/herbs/neem_leaves.jpg',
            'Thulasi (Tulsi)': '/images/herbs/thulasi_tulsi.jpg',
            'Vettiver Root': '/images/herbs/vettiver_root.jpg',
            'Aloe Vera Gel': '/images/herbs/aloe_vera_gel.jpg',
            'Shatavari Root': '/images/herbs/shatavari_root.jpg',
            'Triphala Powder': '/images/powders/triphala_powder.jpg',
            'Nilavembu Kudineer': '/images/powders/nilavembu_kudineer.jpg',
            'Shilajit Resin': '/images/powders/shilajit_resin.jpg',
            'Gokshura Powder': '/images/powders/gokshura_powder.jpg',
            'Bhringraj Oil': '/images/oils/bhringraj_oil.jpg',
            'Dhanwantharam Thailam': '/images/oils/dhanwantharam_thailam.jpg',
            'Murivenna Oil': '/images/oils/murivenna_oil.jpg',
            'Kottamchukkadi Thailam': '/images/oils/kottamchukkadi_thailam.jpg',
            'Kumkumadi Thailam': '/images/oils/kumkumadi_thailam.jpg',
            'Karpooradi Thailam': '/images/oils/karpooradi_thailam.jpg',
            'Coconut Herbal Oil': '/images/oils/coconut_herbal_oil.jpg',
        }
        
        updated_count = 0
        for name, img in updates.items():
            h = Herb.query.filter_by(name=name).first()
            if h:
                h.image_url = img
                updated_count += 1
                
        db.session.commit()
        print(f'Database live-updated with {updated_count} unique image paths!')

if __name__ == '__main__':
    update_db()
