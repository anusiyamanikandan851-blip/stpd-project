from . import db

class Herb(db.Model):
    __tablename__ = 'herbs'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    uses = db.Column(db.Text, nullable=False)
    
    # E-commerce extensions
    category = db.Column(db.String(50), default='Herbs') 
    origin = db.Column(db.String(50), default='Ayurveda') 
    benefits = db.Column(db.Text, nullable=True)
    usage_instructions = db.Column(db.Text, nullable=True)
    is_rare = db.Column(db.Boolean, default=False)
    discount = db.Column(db.Float, default=0.0)

    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255), nullable=True, default="/images/default-herb.png")
