import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from models import db
from models.herb import Herb

def add_products():
    new_products = [
        Herb(name="Moringa Powder", description="Superfood nutrient powerhouse.", uses="Energy, immunity, and joint health.",
             category="Powders", origin="Ayurveda", price=160.0, stock=100, image_url="/images/powders/powder_generic.png",
             benefits="Rich in antioxidants and inflammatory relief.", usage_instructions="Add 1 tsp to smoothies or warm water."),
        Herb(name="Spirulina Powder", description="High-protein algae.", uses="Detox and energy.",
             category="Powders", origin="Ayurveda", price=250.0, stock=80, image_url="/images/powders/powder_generic.png",
             benefits="Boosts stamina and cleanses blood.", usage_instructions="Take 1 tsp morning time."),
        Herb(name="Athimadhuram (Liquorice)", description="Sweet soothing root.", uses="Cough, acidity, throat.",
             category="Herbs", origin="Siddha", price=120.0, stock=50, image_url="/images/herbs/herbs_generic.png",
             benefits="Helps with respiratory and digestive disorders.", usage_instructions="Chew root or chew powder with honey."),
        Herb(name="Kadukkai (Haritaki)", description="King of herbs.", uses="Digestion and detox.",
             category="Herbs", origin="Siddha", price=90.0, stock=120, image_url="/images/herbs/herbs_generic.png",
             benefits="Balances all three doshas.", usage_instructions="1/2 tsp before bed with warm water."),
        Herb(name="Thandrikkai (Bibhitaki)", description="Rejuvenating fruit.", uses="Hair, throat, asthma.",
             category="Herbs", origin="Ayurveda", price=100.0, stock=80, image_url="/images/herbs/herbs_generic.png",
             benefits="Excellent for kapha-related issues.", usage_instructions="Mix with honey for cough."),
        Herb(name="Gotu Kola", description="Brain and memory booster.", uses="Cognition, skin health.",
             category="Herbs", origin="Ayurveda", price=170.0, stock=40, image_url="/images/herbs/herbs_generic.png",
             benefits="Improves circulation to the brain.", usage_instructions="Brew as tea or consume powder.", is_rare=True),
        Herb(name="Sirukurinjan (Gymnema)", description="Sugar destroyer.", uses="Blood sugar regulation.",
             category="Herbs", origin="Siddha", price=140.0, stock=60, image_url="/images/herbs/herbs_generic.png",
             benefits="Helps manage diabetes.", usage_instructions="1 tsp powder before meals."),
        Herb(name="Kappikachu", description="Nervine tonic.", uses="Parkinson's, nerve weakness.",
             category="Powders", origin="Ayurveda", price=280.0, stock=30, image_url="/images/powders/powder_generic.png",
             benefits="Natural source of L-DOPA.", usage_instructions="Take with milk.", is_rare=True),
        Herb(name="Safed Musli", description="Revitalizing root.", uses="Stamina and vigor.",
             category="Herbs", origin="Ayurveda", price=600.0, stock=20, image_url="/images/herbs/herbs_generic.png",
             benefits="Powerful aphrodisiac and strength builder.", usage_instructions="Take with warm milk.", is_rare=True),
        Herb(name="Punarnava", description="Renewer of the body.", uses="Kidney health, edema.",
             category="Herbs", origin="Ayurveda", price=130.0, stock=70, image_url="/images/herbs/herbs_generic.png",
             benefits="Excellent diuretic properties.", usage_instructions="Consume decoction of root."),
        Herb(name="Giloy (Guduchi)", description="Immune protector.", uses="Fever, immunity.",
             category="Herbs", origin="Ayurveda", price=110.0, stock=110, image_url="/images/herbs/herbs_generic.png",
             benefits="Powerful antipyretic.", usage_instructions="Drink stem decoction."),
        Herb(name="Manjistha", description="Blood purifier.", uses="Skin radiance, acne.",
             category="Herbs", origin="Ayurveda", price=190.0, stock=50, image_url="/images/herbs/herbs_generic.png",
             benefits="Clears toxins from blood.", usage_instructions="Take 1/2 tsp twice a day."),
        Herb(name="Kadal Azhinji (Salacia)", description="Traditional sugar controller.", uses="Weight and sugar management.",
             category="Herbs", origin="Siddha", price=250.0, stock=45, image_url="/images/herbs/herbs_generic.png",
             benefits="Prevents sugar absorption.", usage_instructions="Soak root in water overnight and drink."),
        Herb(name="Kalmegh", description="Liver tonic.", uses="Fatty liver, digestion.",
             category="Herbs", origin="Ayurveda", price=140.0, stock=60, image_url="/images/herbs/herbs_generic.png",
             benefits="Protects liver cells.", usage_instructions="Take pill or powder decoction."),
        Herb(name="Senna Leaves", description="Natural laxative.", uses="Constipation relief.",
             category="Herbs", origin="Ayurveda", price=70.0, stock=150, image_url="/images/herbs/herbs_generic.png",
             benefits="Stimulates bowel movements.", usage_instructions="Brew a light tea at night."),
        Herb(name="Kesar (Saffron Threads)", description="Premium spice.", uses="Skin, mood, digestion.",
             category="Herbs", origin="Ayurveda", price=2500.0, stock=10, image_url="/images/herbs/herbs_generic.png",
             benefits="Antioxidant and complexion enhancer.", usage_instructions="Add 2 strands to warm milk.", is_rare=True),
        Herb(name="Mahanarayan Oil", description="Muscle and joint oil.", uses="Arthritis, paralysis.",
             category="Oils", origin="Ayurveda", price=400.0, stock=40, image_url="/images/oils/generic_oil.png",
             benefits="Strengthens nerves and muscles.", usage_instructions="Warm and massage gently."),
        Herb(name="Anu Thailam", description="Nasal drops.", uses="Sinus, allergy, headache.",
             category="Thailam", origin="Ayurveda", price=150.0, stock=90, image_url="/images/oils/premium_thailam.png",
             benefits="Clears nasal passage.", usage_instructions="Put 2 drops in each nostril in morning."),
        Herb(name="Ksheerabala Thailam", description="Rejuvenating oil.", uses="Vata disorders, insomnia.",
             category="Thailam", origin="Ayurveda", price=320.0, stock=35, image_url="/images/oils/premium_thailam.png",
             benefits="Induces sound sleep and relaxes nerves.", usage_instructions="Massage on head and feet."),
        Herb(name="Pind Thailam", description="Cooling body oil.", uses="Gout, burning sensation.",
             category="Thailam", origin="Ayurveda", price=280.0, stock=40, image_url="/images/oils/premium_thailam.png",
             benefits="Reduces intense heat in body.", usage_instructions="Apply over affected joints."),
        Herb(name="Nalpamaradi Thailam", description="Skin illuminating oil.", uses="Tanning, uneven tone.",
             category="Thailam", origin="Ayurveda", price=350.0, stock=50, image_url="/images/oils/premium_thailam.png",
             benefits="Brightens complexion significantly.", usage_instructions="Apply before bath.")
    ]

    with app.app_context():
        # Check if they exist to prevent duplicates
        existing = {h.name for h in Herb.query.all()}
        added = 0
        for prod in new_products:
            if prod.name not in existing:
                db.session.add(prod)
                added += 1
        
        db.session.commit()
        print(f"Successfully added {added} new products. Total products now in DB: {Herb.query.count()}")

if __name__ == '__main__':
    add_products()
