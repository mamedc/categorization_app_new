from app import db


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text, nullable=False)
    children_flag = db.Column(db.Boolean, nullable=False, default=False)
    doc_flag = db.Column(db.Boolean, nullable=False, default=False)
    
    # Function to convert the object to a JSON (for convenience)
    def to_json(self):
        return {
            'id': self.id,
            'value': self.value,
            'date': self.date,
            'description': self.description,
            'childrenFlag': self.children_flag,
            'docFlag': self.doc_flag,
        }
        
    def __repr__(self):
        return f'<Transaction {self.id}>'