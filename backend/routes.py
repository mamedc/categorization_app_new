from app import app, db
from flask import request, jsonify
from models import Transaction
from datetime import datetime


# Get all transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([transaction.to_json() for transaction in transactions])


# Create a new transaction
@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        
        # Validations
        required_fields = ['value', 'date', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing {field} field'}), 400
        
        # Correct data formats
        if ',' in data['value']:
            data['value'] = data['value'].replace(',', '.')
        data['value'] = float(data['value'])
        
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d')
        
        # Create new transaction
        new_transaction = Transaction(
            value=data['value'],
            date=data['date'],
            description=data['description'],
        )
        
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify(new_transaction.to_json()), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400 # 400 means bad request


# Delete a transaction
@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id) # Get the transaction by id
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404 # 404 means not found
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200 # 200 means ok
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request


# Update a transaction
@app.route('/api/transactions/<int:transaction_id>', methods=['PATCH']) # PATCH is used for partial updates
def update_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id) # Get the transaction by id
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404 # 404 means not found
        
        data = request.get_json()
        
        # Correct data formats
        if ',' in data['value']:
            data['value'] = data['value'].replace(',', '.')
        data['value'] = float(data['value'])
        
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d')

        # Update transaction
        transaction.value = data.get('value', transaction.value) # Get the value from the request or use the current value
        transaction.date = data.get('date', transaction.date)
        transaction.description = data.get('description', transaction.description)
        db.session.commit()

        return jsonify(transaction.to_json()), 200 # 200 means ok
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request