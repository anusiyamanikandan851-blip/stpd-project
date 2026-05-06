from . import db

class SymptomHerbMap(db.Model):
    __tablename__ = 'symptom_herb_map'
    id = db.Column(db.Integer, primary_key=True)
    symptom = db.Column(db.String(100), nullable=False)
    herb_id = db.Column(db.Integer, db.ForeignKey('herbs.id'), nullable=False)
    
    herb = db.relationship('Herb')
