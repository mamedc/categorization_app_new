# routes.py

from app import app, db
# Add Setting to imports and SQLAlchemyError for exception handling
from flask import request, jsonify, abort
from models import Transaction, Tag, TagGroup, Setting  # <-- Ensure Setting is here
from datetime import datetime
# Make sure IntegrityError is imported if used elsewhere, otherwise add SQLAlchemyError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError # <-- Add SQLAlchemyError
import decimal
from werkzeug.exceptions import HTTPException



@app.errorhandler(HTTPException)
def handle_http_exception(e):
    response = e.get_response()
    response.data = jsonify({
        "error": e.description
    }).data
    response.content_type = "application/json"
    return response


# --- Transaction Routes ---



# Create a new transaction
@app.route('/api/transactions/new', methods=['POST'])
def create_transaction():
    # ... (your existing try/except, validation, data prep) ...
    try:
        data = request.get_json()
        # ... (validation for date, amount, description) ...
        # Correct date format
        try:
             parsed_date = datetime.strptime(data['date'], '%Y-%m-%d').date() # Use .date() if model uses Date
        except ValueError:
            abort(400, description="Invalid date format. Use YYYY-MM-DD.")

        # Correct amount format
        try:
            if isinstance(data['amount'], str) and ',' in data['amount']:
                data['amount'] = data['amount'].replace(',', '.')
            parsed_amount = decimal.Decimal(data['amount'])
            print('****', parsed_amount)
        except (decimal.InvalidOperation, TypeError, ValueError):
             abort(400, description="Invalid amount format.")

        new_transaction = Transaction(
            date=parsed_date,
            amount=parsed_amount,
            description=data['description'],
            note=data['note'],
            # Set other flags if needed from data.get(...)
        )

        # Handle tags if provided (list of tag IDs)
        tag_ids = data.get('tag_ids', [])
        if tag_ids:
            # Ensure tag_ids are integers if they come as strings
            try:
                int_tag_ids = [int(tid) for tid in tag_ids]
            except ValueError:
                abort(400, description="Invalid tag_id format in tag_ids list.")

            tags = Tag.query.filter(Tag.id.in_(int_tag_ids)).all()
            if len(tags) != len(int_tag_ids):
                found_ids = {tag.id for tag in tags}
                missing_ids = [tid for tid in int_tag_ids if tid not in found_ids]
                abort(400, description=f"One or more tag IDs not found: {missing_ids}")
            # *** FIX: Use the correct variable name: new_transaction ***
            new_transaction.tags.extend(tags)

        db.session.add(new_transaction)
        db.session.commit()
        # Decide what to include in the response
        return jsonify(new_transaction.to_json(include_tags=True)), 201

    except Exception as e:
        db.session.rollback() # Rollback on any exception during creation
        app.logger.error(f"Error creating transaction: {e}") # Log the actual error
        # Return a more generic 500 for unexpected errors, use abort for client errors (4xx)
        abort(500, description="An error occurred while creating the transaction.")



# Get all transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        transactions = Transaction.query.order_by(Transaction.date.desc()).all()
        # Decide what to include for the list view
        return jsonify([transaction.to_json(include_tags=True) for transaction in transactions])
    except Exception as e:
        app.logger.error(f"Error getting transactions: {e}")
        abort(500, description="An error occurred while retrieving transactions.")



# Get transaction by ID
@app.route('/api/transactions/view/<int:transaction_id>', methods=['GET'])
def view_transaction(transaction_id):
    # Use get_or_404 for cleaner handling
    transaction = Transaction.query.get_or_404(transaction_id, description=f"Transaction {transaction_id} not found")
    # Decide what to include for a single view
    return jsonify(transaction.to_json(include_tags=True))



# Delete a transaction
@app.route('/api/transactions/delete/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id) # Get the transaction by id
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404 # 404 means not found
        # Association table entries referencing this tx will be cascade deleted (due to FK ondelete)
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200 # 200 means ok
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request



# Update a transaction
@app.route('/api/transactions/update/<int:transaction_id>', methods=['PATCH']) # PATCH is used for partial updates
def update_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id) # Get the transaction by id
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404 # 404 means not found
        
        data = request.get_json()
        
        # Correct date format
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d')

        # Correct amount format
        if ',' in data['amount']:
            data['amount'] = data['amount'].replace(',', '.')
        data['amount'] = decimal.Decimal(data['amount'])

        # Update transaction
        transaction.amount = data.get('amount', transaction.amount) # Get the amount from the request or use the current amount
        transaction.date = data.get('date', transaction.date)
        transaction.description = data.get('description', transaction.description)
        transaction.note = data.get('note', transaction.note)
        db.session.commit()

        return jsonify(transaction.to_json(include_tags=True)), 200 # 200 means ok
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request
    


@app.route('/api/transactions/check-duplicates-bulk', methods=['POST'])
def check_transactions_duplicates_bulk():
    incoming_transactions = request.get_json()
    if not isinstance(incoming_transactions, list):
        abort(400, description="Expected a list of transactions.")

    results = []
    for tx_data in incoming_transactions:
        date_str = tx_data.get('Date')
        amount_str = tx_data.get('Amount')
        description = tx_data.get('Description') # Might be None or empty string

        # Basic validation for essential fields for a duplicate check
        if not date_str or amount_str is None:
            results.append(False) # Cannot be a duplicate if key fields are missing
            continue
        
        try:
            # Assuming frontend sends date as 'YYYY-MM-DD' string
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            results.append(False) 
            continue

        try:
            # Amount parsing: handle comma as decimal separator
            # Ensure amount_str is a string for replacement and Decimal conversion
            current_amount_str = str(amount_str)
            if ',' in current_amount_str:
                current_amount_str = current_amount_str.replace(',', '.')
            
            # Remove any non-numeric characters except for the decimal point and minus sign (optional)
            # This is a basic sanitization. More robust parsing might be needed depending on input variety.
            # current_amount_str = ''.join(filter(lambda x: x.isdigit() or x == '.' or (x == '-' and current_amount_str.startswith('-')), current_amount_str))

            parsed_amount = decimal.Decimal(current_amount_str)
        except (decimal.InvalidOperation, TypeError, ValueError):
            results.append(False)
            continue
        
        # Normalize description for query: treat empty string from input as potentially matching NULL in DB if desired,
        # or ensure consistent storage (e.g., always store empty as "" not NULL).
        # Current Transaction model saves description as String, can be nullable.
        # If description is an empty string "", query for "". If None, query for NULL.
        query_description = description if description is not None else None


        try:
            existing_transaction = db.session.query(Transaction).filter(
                Transaction.date == parsed_date,
                Transaction.amount == parsed_amount,
                Transaction.description == query_description
            ).first()
            results.append(existing_transaction is not None)
        except Exception as e:
            app.logger.error(f"Error during duplicate check query for {tx_data}: {e}")
            results.append(False) # Default to not duplicate on query error
            
    return jsonify(results), 200



# --- TagGroup Routes ---




# Create a new TagGroup
@app.route('/api/tag-groups', methods=['POST'])
def create_tag_group():
    # TODO: deal with duplicated names - handle upper/lowercase
    data = request.get_json()
    if not data or not data.get('name'):
        abort(400, description="Missing 'name' in request body.")
    try:
        new_group = TagGroup(name=data['name'])
        db.session.add(new_group)
        db.session.commit()
        return jsonify(new_group.to_json(include_tags=False)), 201 # Don't include tags by default
    except IntegrityError: # Handles unique constraint violation
        db.session.rollback()
        abort(409, description=f"TagGroup with name '{data['name']}' already exists.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating tag group: {e}")
        abort(500, description="Could not create tag group.")



# Get all TagGroups
@app.route('/api/tag-groups', methods=['GET'])
def get_tag_groups():
    try: # Add try/except for safety
        groups = TagGroup.query.all()
        # Include tags when listing groups
        return jsonify([group.to_json(include_tags=True) for group in groups])
    except Exception as e:
        app.logger.error(f"Error getting tag groups: {e}")
        abort(500, description="An error occurred while retrieving tag groups.")



# Get TagGroup by ID
@app.route('/api/tag-groups/<int:group_id>', methods=['GET'])
def get_tag_group(group_id):
    # get_or_404 already handles try/except for not found
    group = TagGroup.query.get_or_404(group_id, description=f"TagGroup with id {group_id} not found.")
    # Include tags when viewing a single group
    return jsonify(group.to_json(include_tags=True))



# Delete TagGroup by ID
@app.route('/api/tag-groups/<int:group_id>', methods=['DELETE'])
def delete_tag_group(group_id):
    group = TagGroup.query.get_or_404(group_id, description=f"TagGroup with id {group_id} not found.")
    try:
        db.session.delete(group) # Cascade will handle deleting associated Tags
        db.session.commit()
        return jsonify({"message": f"TagGroup '{group.name}' and its tags deleted."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting tag group {group_id}: {e}")
        abort(500, description="Could not delete tag group.")





# --- Tag Routes ---




# Create a new Tag
@app.route('/api/tags', methods=['POST'])
def create_tag():
    data = request.get_json()
    if not data or not data.get('name') or 'tag_group_id' not in data:
        abort(400, description="Missing 'name' or 'tag_group_id' in request body.")

    # Check if tag group exists
    group = TagGroup.query.get(data['tag_group_id'])
    if not group:
        abort(404, description=f"TagGroup with id {data['tag_group_id']} not found.")

    try:
        new_tag = Tag(
            name=data['name'],
            color=data.get('color'), # Optional color
            tag_group_id=data['tag_group_id']
        )
        db.session.add(new_tag)
        db.session.commit()
        # *** FIX: Call to_json with parameters to prevent recursion ***
        # Include the group info, but not transactions (which will be empty anyway)
        return jsonify(new_tag.to_json(include_group=True, include_transactions=False)), 201

    except IntegrityError: # Handles unique constraint within group
        db.session.rollback()
        abort(409, description=f"Tag with name '{data['name']}' already exists in group '{group.name}'.")

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating tag: {e}")
        abort(500, description="Could not create tag.")



# Get all Tags
@app.route('/api/tags', methods=['GET'])
def get_tags():
    # Optional: Filter by group ?group_id=...
    group_id = request.args.get('group_id', type=int)
    query = Tag.query
    if group_id:
        query = query.filter(Tag.tag_group_id == group_id)
    tags = query.all()
    # Include group info when listing tags
    return jsonify([tag.to_json(include_group=True, include_transactions=False) for tag in tags])



# Get Tag by ID
@app.route('/api/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id, description=f"Tag with id {tag_id} not found.")
    # Include group info, maybe transactions depending on use case (defaulting to False)
    return jsonify(tag.to_json(include_group=True, include_transactions=False))



# Delete Tag by ID
@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id, description=f"Tag with id {tag_id} not found.")
    try:
        # Association table entries referencing this tag will be cascade deleted (due to FK ondelete)
        db.session.delete(tag)
        db.session.commit()
        return jsonify({"message": f"Tag '{tag.name}' deleted."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting tag {tag_id}: {e}")
        abort(500, description="Could not delete tag.")




# --- Transaction Tagging Routes ---




@app.route('/api/transactions/<int:tx_id>/tags', methods=['POST'])
def add_tag_to_transaction(tx_id):
    tx = Transaction.query.get_or_404(tx_id, description=f"Transaction with id {tx_id} not found.")
    data = request.get_json()
    if not data or 'tag_id' not in data:
        abort(400, description="Missing 'tag_id' in request body.")

    tag_id = data['tag_id']
    tag = Tag.query.get(tag_id)
    if not tag:
            abort(404, description=f"Tag with id {tag_id} not found.")

    if tag in tx.tags:
        return jsonify({"message": f"Tag '{tag.name}' already associated with transaction {tx_id}."}), 200 # Or 409 Conflict

    try:
        tx.tags.append(tag)
        db.session.commit()
        # Return the updated transaction with its tags
        return jsonify(tx.to_json(include_tags=True)), 200 # Use the updated to_json
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error adding tag {tag_id} to transaction {tx_id}: {e}")
        abort(500, description="Could not add tag to transaction.")




@app.route('/api/transactions/<int:tx_id>/tags/<int:tag_id>', methods=['DELETE'])
def remove_tag_from_transaction(tx_id, tag_id):
    tx = Transaction.query.get_or_404(tx_id, description=f"Transaction with id {tx_id} not found.")
    tag = Tag.query.get(tag_id) # Don't 404 if tag doesn't exist, just check if it's linked

    if not tag or tag not in tx.tags:
            abort(404, description=f"Tag with id {tag_id} is not associated with transaction {tx_id}.")

    try:
        tx.tags.remove(tag)
        db.session.commit()
        # Return the updated transaction with its tags
        return jsonify(tx.to_json(include_tags=True)), 200 # Use the updated to_json
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error removing tag {tag_id} from transaction {tx_id}: {e}")
        abort(500, description="Could not remove tag from transaction.")



    
    # --- Settings Routes ---



SUPPORTED_DECIMAL_SETTINGS = ['initial_balance', 'final_running_balance'] # List of settings expected to be numeric

@app.route('/api/settings/<string:setting_key>', methods=['GET'])
def get_setting(setting_key):
    """Retrieves a specific setting value."""
    try:
        setting = Setting.query.filter_by(key=setting_key).first()

        if setting:
            return jsonify(setting.to_json())
        else:
            # Default numeric settings to '0.00' if not found
            if setting_key in SUPPORTED_DECIMAL_SETTINGS:
                 # Return the default structure expected by the frontend atom
                return jsonify({'key': setting_key, 'value': '0.00'})
            else:
                # For other settings, a 404 might be more appropriate if they are expected to exist
                # Or return a specific default if applicable
                abort(404, description=f"Setting '{setting_key}' not found.")

    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error retrieving setting '{setting_key}': {e}")
        abort(500, description=f"Database error retrieving setting '{setting_key}'.")
    except Exception as e:
        app.logger.error(f"Unexpected error retrieving setting '{setting_key}': {e}", exc_info=True)
        abort(500, description=f"An unexpected error occurred while retrieving setting '{setting_key}'.")


@app.route('/api/settings/<string:setting_key>', methods=['POST'])
def set_setting(setting_key):
    """Creates or updates a specific setting value."""
    data = request.get_json()
    if not data or 'value' not in data:
        abort(400, description="Missing 'value' in request body.")

    new_value_str = data['value']
    parsed_value = None

    # Check if the setting key is one that should be stored as a Decimal
    if setting_key in SUPPORTED_DECIMAL_SETTINGS:
        try:
            # Ensure string conversion before potential replacements
            current_value_str = str(new_value_str)
            if ',' in current_value_str:
                 current_value_str = current_value_str.replace(',', '.')
            parsed_value = decimal.Decimal(current_value_str)
        except (decimal.InvalidOperation, TypeError, ValueError) as e:
            app.logger.error(f"Invalid value format for {setting_key}: {new_value_str} - {e}")
            abort(400, description=f"Invalid value format for {setting_key}. Expected a number.")
    else:
        # If you intend to support other setting types (e.g., strings) in the future,
        # you would add logic here. For now, we only support the decimal ones explicitly.
        # If the key is not supported, maybe return an error or handle differently.
        # For this task, we assume only decimal settings are being set via this endpoint for now.
        # If other *types* of settings were needed, the model/logic might need adjustment.
         if setting_key not in SUPPORTED_DECIMAL_SETTINGS:
             abort(400, description=f"Setting key '{setting_key}' is not currently supported for updates.")
         # Fallback for safety, although the above check should catch unsupported keys
         parsed_value = str(new_value_str) # Or handle based on expected type


    setting = Setting.query.filter_by(key=setting_key).first()

    try:
        if setting:
            setting.value = parsed_value
            app.logger.info(f"Updating setting '{setting_key}' to {parsed_value}")
        else:
            # Only create settings that are explicitly supported
            if setting_key in SUPPORTED_DECIMAL_SETTINGS:
                setting = Setting(key=setting_key, value=parsed_value)
                db.session.add(setting)
                app.logger.info(f"Creating new setting '{setting_key}' with value {parsed_value}")
            else:
                 # Avoid creating settings with unsupported keys dynamically unless intended
                 abort(400, description=f"Cannot create unsupported setting key '{setting_key}'.")


        db.session.commit()
        # Ensure setting is not None before calling to_json
        if setting:
            return jsonify(setting.to_json()), 200
        else:
             # This case should ideally not be reached due to the aborts above, but for safety:
            abort(500, description=f"Failed to save setting '{setting_key}'.")

    except SQLAlchemyError as e: # Catch potential DB errors during save
        db.session.rollback()
        app.logger.error(f"Database error saving setting '{setting_key}': {e}")
        abort(500, description=f"Database error saving setting '{setting_key}'.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error saving setting '{setting_key}': {e}", exc_info=True) # Log traceback
        abort(500, description=f"Could not save setting '{setting_key}'.")