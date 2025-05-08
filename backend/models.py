# File path: backend/models.py

from app import db
from sqlalchemy.sql import func
import decimal



# --- Association Table ---



transaction_tags = db.Table('transaction_tags',
    db.Column('transaction_id', db.Integer, db.ForeignKey('transaction.id', ondelete='CASCADE'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id', ondelete='CASCADE'), primary_key=True)
)



# --- Model Definitions ---



class Transaction(db.Model):
    """Represents a financial transaction."""
    __tablename__ = 'transaction'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, index=True)
    amount = db.Column(db.Numeric(precision=10, scale=2), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    note = db.Column(db.String(200), nullable=True)
    children_flag = db.Column(db.Boolean, nullable=False, default=False) # Indicates if this is a parent transaction
    doc_flag = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # --- New fields for Split Transaction feature ---
    parent_id = db.Column(db.Integer, db.ForeignKey('transaction.id', name='fk_transaction_parent_id'), nullable=True, index=True)
    
    # Relationship to load children for a parent transaction
    # 'parent' backref allows child_transaction.parent to access the parent object
    children = db.relationship(
        'Transaction',
        backref=db.backref('parent', remote_side=[id]), 
        lazy='subquery', # Fetches children using a separate query when parent.children is accessed
        cascade='all, delete-orphan' # If parent is deleted, its children are also deleted
    )
    # --- End of New fields ---

    tags = db.relationship(
        'Tag',
        secondary=transaction_tags,
        lazy='subquery', # Similar to above, fetches tags when parent.tags is accessed
        back_populates='transactions'
    )

    def to_json(self, include_tags=True):
        data = {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'amount': str(self.amount) if isinstance(self.amount, decimal.Decimal) else self.amount,
            'description': self.description,
            'note': self.note,
            'children_flag': self.children_flag,
            'doc_flag': self.doc_flag,
            'parent_id': self.parent_id, # Added for Split Transaction feature
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_tags:
            data['tags'] = [tag.to_json(include_group=True, include_transactions=False) for tag in self.tags]
        return data

    def __repr__(self):
        amount_str = f"{self.amount:.2f}" if self.amount is not None else "None"
        date_str = self.date.isoformat() if self.date else "None"
        parent_info = f", parent_id={self.parent_id}" if self.parent_id is not None else ""
        children_flag_info = ", children_flag=True" if self.children_flag else ""
        return f'<Transaction {self.id} | {date_str} | {amount_str}{parent_info}{children_flag_info}>'



class Tag(db.Model):
    """Represents a classification tag."""
    __tablename__ = 'tag'
    __table_args__ = (db.UniqueConstraint('name', 'tag_group_id', name='_tag_name_group_uc'),)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=False, nullable=False, index=True)
    color = db.Column(db.String(7), nullable=True)
    tag_group_id = db.Column(db.Integer, db.ForeignKey('tag_group.id'), nullable=False)
    tag_group = db.relationship('TagGroup', back_populates='tags')
    transactions = db.relationship(
        'Transaction',
        secondary=transaction_tags,
        lazy='dynamic', # Use 'dynamic' if you expect many transactions per tag and want to apply filters
        back_populates='tags'
    )

    def to_json(self, include_group=True, include_transactions=False):
        """Returns a dictionary representation of the tag."""
        data = {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'tag_group_id': self.tag_group_id,
        }
        if include_group and self.tag_group:
            data['tag_group'] = self.tag_group.to_json(include_tags=False)
        if include_transactions:
            data['transactions'] = [tx.to_json(include_tags=False) for tx in self.transactions.all()]
        return data

    def __repr__(self):
        return f'<Tag {self.id} {self.name}>'


class TagGroup(db.Model):
    """Represents a group of related tags."""
    __tablename__ = 'tag_group'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    tags = db.relationship(
        'Tag',
        back_populates='tag_group',
        cascade="all, delete-orphan", # If group is deleted, its tags are deleted
        lazy=True # Default lazy loading
    )

    def to_json(self, include_tags=True):
        """Returns a dictionary representation of the tag group."""
        data = {
            'id': self.id,
            'name': self.name,
        }
        if include_tags:
            data['tags'] = [tag.to_json(include_group=False, include_transactions=False) for tag in self.tags]
        return data

    def __repr__(self):
        return f'<TagGroup {self.id} ({self.name})>'


# --- New Settings Model ---
class Setting(db.Model):
    """Represents an application setting."""
    __tablename__ = 'setting'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False, index=True)
    value = db.Column(db.Numeric(precision=10, scale=2), nullable=True)

    def to_json(self):
        """Returns a dictionary representation of the setting."""
        value_output = None
        if self.value is not None:
            value_output = str(self.value)
        elif self.key == 'initial_balance':
            value_output = '0.00'

        return {
            'id': self.id,
            'key': self.key,
            'value': value_output
        }

    def __repr__(self):
        value_str = f"{self.value:.2f}" if self.value is not None else "None"
        return f'<Setting {self.key} = {value_str}>'