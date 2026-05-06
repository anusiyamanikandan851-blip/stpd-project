import os
from flask import Flask
from models import db
from models.herb import Herb
from models.user import User
from models.symptom_map import SymptomHerbMap
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Ensure it points exactly to PostgreSQL via DATABASE_URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:pass@localhost:5432/herbnest_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def seed_db():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        print("Seeding admin and standard users...")
        users_to_add = [
            User(
                name="System Admin", 
                email="admin@herbnest.com", 
                password=generate_password_hash("admin123"), 
                role="admin"
            ),
            User(
                name="Test User", 
                email="test@example.com", 
                password=generate_password_hash("test1234"), 
                role="user"
            )
        ]
        for u in users_to_add:
            db.session.add(u)
            
        print("Seeding exactly 40 unique herbal products with local images...")
        
        # Format: (name, category, description, uses, price, rare, image_url)
        raw_products = [
            ("Ashwagandha Root", "Rare Herbs", "Powerful adaptogen for stamina.", "Stress relief, sleep, anxiety", 400.0, True, "/images/ashwagandha.png"),
            ("Thulasi (Tulsi)", "Traditional Herbs", "The Holy Basil. Immunity booster.", "Cold, flu, fever, immunity", 50.0, False, "/images/tulsi.png"),
            ("Karpooradi Thailam", "Thailams", "Massage oil for pain relief.", "Muscle cramps, pain, joints", 250.0, False, "/images/oils/karpooradi_thailam.jpg"),
            ("Kumkumadi Thailam", "Thailams", "Saffron based facial oil.", "Skin, acne, complexion", 899.0, True, "/images/oils/kumkumadi_thailam.jpg"),
            ("Shatavari Root", "Rare Herbs", "Female reproductive tonic.", "Hormones, stamina, energy", 450.0, True, "/images/herbs/shatavari_root.jpg"),
            ("Amla Powder", "Traditional Herbs", "Vitamin C powerhouse.", "Hair, immunity, skin", 150.0, False, "/images/amla.png"),
            ("Triphala Powder", "Traditional Herbs", "Ancestral detox matrix.", "Digestion, colon cleanse", 190.0, False, "/images/triphala.png"),
            ("Murivenna Oil", "Thailams", "Renowned oil for quick healing of wounds.", "Wounds, scars, pain", 320.0, False, "/images/oils/murivenna_oil.jpg"),
            ("Dhanwantharam Thailam", "Thailams", "Classic Ayurvedic massage oil.", "Neurological conditions, pain", 450.0, False, "/images/oils/dhanwantharam_thailam.jpg"),
            ("Castor Oil", "Oils", "Cold-pressed organic castor.", "Hair growth, digestion", 180.0, False, "/images/oils/castor_oil.png"),
            ("Mint Leaves", "Common Herbs", "Fresh digestive cooling herb.", "Digestion, cold, breath", 30.0, False, "/images/chamomile.png"),
            ("Ginger Root", "Common Herbs", "Spicy digestive root.", "Digestion, cold, nausea", 60.0, False, "/images/ginger.png"),
            ("Turmeric Powder", "Common Herbs", "Curcumin rich anti-inflammatory.", "Immunity, pain, skin", 100.0, False, "/images/turmeric.png"),
            ("Safed Musli", "Rare Herbs", "Potent aphrodisiac and strength booster.", "Stamina, energy", 1200.0, True, "/images/herbs/safed_musli.jpg"),
            ("Neem Leaves", "Traditional Herbs", "Purifying bitter herb.", "Acne, skin, infections", 80.0, False, "/images/neem.png"),
            ("Brahmi Leaves", "Traditional Herbs", "Memory-enhancing cognitive booster.", "Memory, focus, sleep", 120.0, False, "/images/brahmi.png"),
            ("Vettiver Root", "Traditional Herbs", "Aromatic cooling root.", "Heat reduction, water purify", 110.0, False, "/images/herbs/vettiver_root.jpg"),
            ("Aloe Vera Gel", "Traditional Herbs", "100% natural extracted gel.", "Skin, burns, digestion", 180.0, False, "/images/aloevera.png"),
            ("Nilavembu Kudineer", "Traditional Herbs", "Extreme anti-viral herbal blend.", "Fever, immunity", 250.0, False, "/images/powders/nilavembu_kudineer.jpg"),
            ("Shilajit Resin", "Rare Herbs", "Himalayan mountain resin.", "Stamina, energy, minerals", 1500.0, True, "/images/powders/shilajit_resin.jpg"),
            ("Gokshura Powder", "Traditional Herbs", "Kidney and urinary tonic.", "Muscle building, energy", 240.0, False, "/images/powders/gokshura_powder.jpg"),
            ("Cinnamon Bark", "Common Herbs", "Sweet spice for blood sugar.", "Sugar, digestion", 120.0, False, "/images/fennel.png"),
            ("Cardamom Pods", "Common Herbs", "Aromatic spice.", "Digestion, breath", 350.0, False, "/images/fenugreek.png"),
            ("Gotu Kola", "Rare Herbs", "Brain longevity herb.", "Memory, anxiety, stress", 380.0, True, "/images/herbs/gotu_kola.jpg"),
            ("Moringa Powder", "Traditional Herbs", "The miracle tree leaves.", "Immunity, vitamins, energy", 220.0, False, "/images/powders/moringa_powder.jpg"),
            ("Hibiscus Flowers", "Traditional Herbs", "Blood pressure reducing flower.", "Hair, blood pressure", 150.0, False, "/images/herbs/senna_leaves.jpg"),
            ("Bhringraj Oil", "Thailams", "Supreme hair growth stimulator.", "Hair loss, graying", 350.0, False, "/images/oils/bhringraj_oil.jpg"),
            ("Mahanarayan Oil", "Thailams", "Deep muscle recovery oil.", "Joint pain, arthritis", 420.0, False, "/images/oils/mahanarayan_oil.jpg"),
            ("Arjuna Bark Extract", "Traditional Herbs", "Cardiac wellness protector.", "Heart, blood pressure", 290.0, False, "/images/arjuna.png"),
            ("Pippali (Long Pepper)", "Rare Herbs", "Respiratory rejuvenation.", "Asthma, cold, digestion", 260.0, True, "/images/flaxseeds.png"),
            ("Haritaki Powder", "Traditional Herbs", "The king of medicines.", "Digestion, detox", 180.0, False, "/images/herbs/kadukkai.jpg"),
            ("Manjistha Root", "Traditional Herbs", "Blood purifying red root.", "Skin glow, detox", 210.0, False, "/images/herbs/manjistha.jpg"),
            ("Licorice Root (Mulethi)", "Common Herbs", "Throat soothing sweet root.", "Cough, throat, ulcer", 160.0, False, "/images/licorice.png"),
            ("Ksheerabala Thailam", "Thailams", "Vata pacifying nervous tonic.", "Pain, nerves, sleep", 380.0, False, "/images/oils/ksheerabala_thailam.jpg"),
            ("Anu Thailam", "Thailams", "Nasal drop clarifying oil.", "Sinus, headache, allergies", 190.0, False, "/images/oils/anu_thailam.jpg"),
            ("Guduchi (Giloy)", "Traditional Herbs", "Immune supporting stem.", "Immunity, fever", 200.0, False, "/images/giloy.png"),
            ("Kutki Root", "Rare Herbs", "Intense liver protector.", "Liver, detox", 850.0, True, "/images/kutki.png"),
            ("Punarnava Powder", "Traditional Herbs", "Kidney rejuvenator.", "Kidney, swelling", 230.0, False, "/images/herbs/punarnava.jpg"),
            ("Sahacharadi Thailam", "Thailams", "Lower back and leg oil.", "Back pain, sciatica", 310.0, False, "/images/oils/nalpamaradi_thailam.jpg"),
            ("Black Seed Oil", "Oils", "Nigella sativa healing oil.", "Immunity, inflammation", 490.0, False, "/images/oils/pind_thailam.jpg")
        ]
        
        products = []
        for idx, (name, cat, desc, uses, price, rare, img) in enumerate(raw_products):
            p = Herb(
                name=name,
                category=cat,
                description=desc,
                uses=uses,
                price=price,
                stock=50,
                image_url=img,
                origin="Ayurveda" if idx % 2 == 0 else "Siddha",
                benefits="Tested for pure traditional efficacy.",
                usage_instructions="Follow standard traditional procedures or consult physician.",
                is_rare=rare,
                discount=0.0
            )
            products.append(p)
            db.session.add(p)
            
        db.session.commit()
        
        print("Seeding Symptom Mapping for Chatbot...")
        # Add basic symptoms linking back to the first matching items
        symptoms = [
            ("headache", ["Karpooradi Thailam", "Anu Thailam", "Mint Leaves"]),
            ("stress", ["Ashwagandha Root", "Gotu Kola", "Shatavari Root", "Brahmi Leaves"]),
            ("sleep", ["Brahmi Leaves", "Ksheerabala Thailam", "Ashwagandha Root"]),
            ("pain", ["Karpooradi Thailam", "Mahanarayan Oil", "Sahacharadi Thailam"]),
            ("digestion", ["Triphala Powder", "Mint Leaves", "Ginger Root", "Cardamom Pods", "Haritaki Powder"]),
            ("immunity", ["Thulasi (Tulsi)", "Amla Powder", "Moringa Powder", "Guduchi (Giloy)"]),
            ("skin", ["Kumkumadi Thailam", "Aloe Vera Gel", "Neem Leaves", "Manjistha Root"]),
            ("fever", ["Thulasi (Tulsi)", "Nilavembu Kudineer", "Guduchi (Giloy)"]),
            ("hair", ["Bhringraj Oil", "Amla Powder", "Castor Oil", "Hibiscus Flowers"]),
            ("energy", ["Shilajit Resin", "Safed Musli", "Moringa Powder", "Gokshura Powder"]),
            ("cold", ["Ginger Root", "Thulasi (Tulsi)", "Licorice Root (Mulethi)", "Anu Thailam"]),
            ("anxiety", ["Gotu Kola", "Ashwagandha Root"]),
            ("memory", ["Brahmi Leaves", "Gotu Kola"])
        ]
        
        # Build dictionary map to fetch IDs easily
        herb_id_map = {h.name: h.id for h in Herb.query.all()}
        
        for symptom_name, herb_names in symptoms:
            for h_name in herb_names:
                hid = herb_id_map.get(h_name)
                if hid:
                    db.session.add(SymptomHerbMap(symptom=symptom_name, herb_id=hid))
                    
        db.session.commit()

        print(f"Database successfully seeded with {len(products)} products, {len(users_to_add)} users, and symptom mappings!")

if __name__ == "__main__":
    seed_db()
