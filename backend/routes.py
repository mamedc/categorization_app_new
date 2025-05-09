# File path: backend/routes.py

from app import app, db
from flask import request, jsonify, abort
from models import Transaction, Tag, TagGroup, Setting
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
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
    try:
        data = request.get_json()

        # --- Validation ---
        if not data:
            abort(400, description="Missing request body.")
        if 'date' not in data or not data['date']:
             abort(400, description="Missing 'date' field.")
        if 'amount' not in data:
             abort(400, description="Missing 'amount' field.")
        

        # --- Data Parsing and Preparation ---
        try:
             parsed_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            abort(400, description="Invalid date format. Use YYYY-MM-DD.")

        try:
            amount_str = str(data['amount'])
            if ',' in amount_str:
                amount_str = amount_str.replace(',', '.')
            parsed_amount = decimal.Decimal(amount_str)
        except (decimal.InvalidOperation, TypeError, ValueError):
             abort(400, description="Invalid amount format.")

        description = data.get('description')
        note = data.get('note', '')
        children_flag = data.get('children_flag', False)
        doc_flag = data.get('doc_flag', False)
        # parent_id is not set here, this is for creating new, non-child 
        # transactions initially or for creating children if this endpoint 
        # were to be used for that (but split endpoint is specific)

        new_transaction = Transaction(
            date=parsed_date,
            amount=parsed_amount,
            description=description,
            note=note,
            children_flag=children_flag,
            doc_flag=doc_flag,
        )

        tag_ids = data.get('tag_ids', [])
        if tag_ids:
            try:
                int_tag_ids = [int(tid) for tid in tag_ids if tid is not None]
            except (ValueError, TypeError):
                abort(400, description="Invalid tag_id format in tag_ids list.")

            tags = Tag.query.filter(Tag.id.in_(int_tag_ids)).all()
            if len(tags) != len(int_tag_ids):
                found_ids = {tag.id for tag in tags}
                missing_ids = [tid for tid in int_tag_ids if tid not in found_ids]
                abort(400, description=f"One or more tag IDs not found: {missing_ids}")

            new_transaction.tags.extend(tags)

        db.session.add(new_transaction)
        db.session.commit()

        return jsonify(new_transaction.to_json(include_tags=True)), 201

    except HTTPException as e:
         raise e
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error creating transaction: {e}")
        error_msg = "A database error occurred while creating the transaction."
        if isinstance(e, IntegrityError):
             error_msg = "A database constraint was violated. Check for duplicates or missing required relationships."
        abort(500, description=error_msg)
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating transaction: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while creating the transaction.")



# Get all transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        # The frontend will handle grouping children under parents using parent_id.
        # Default sort order by date desc.
        transactions = Transaction.query.order_by(Transaction.date.desc(), Transaction.id.asc()).all()
        return jsonify([transaction.to_json(include_tags=True) for transaction in transactions])
    except Exception as e:
        app.logger.error(f"Error getting transactions: {e}", exc_info=True)
        abort(500, description="An error occurred while retrieving transactions.")



# Get transaction by ID
@app.route('/api/transactions/view/<int:transaction_id>', methods=['GET'])
def view_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id, description=f"Transaction {transaction_id} not found")
    return jsonify(transaction.to_json(include_tags=True))



# Splitting Transaction
@app.route('/api/transactions/<int:transaction_id>/split', methods=['POST'])
def split_transaction(transaction_id):
    try:
        parent_transaction = Transaction.query.get(transaction_id)
        if not parent_transaction:
            abort(404, description=f"Transaction {transaction_id} not found.")

        # Prevent splitting a transaction that is already a child
        if parent_transaction.parent_id is not None:
            abort(400, description="Cannot split a child transaction. Only parent or non-split transactions can be split.")

        data = request.get_json()
        if not data or 'num_children' not in data:
            abort(400, description="Missing 'num_children' in request body.")

        try:
            num_children = int(data['num_children'])
            if num_children <= 0:
                abort(400, description="'num_children' must be a positive integer.")
            if num_children > 20: # Arbitrary limit for sanity
                abort(400, description="'num_children' cannot exceed 20 for a single split operation.")
        except (ValueError, TypeError):
            abort(400, description="'num_children' must be a valid integer.")

        # Mark parent as having children (this is idempotent if already true)
        parent_transaction.children_flag = True
        
        new_child_transactions = []
        for _ in range(num_children):
            # Create new sub-transaction
            child_transaction = Transaction(
                parent_id=parent_transaction.id,
                date=parent_transaction.date,               # Inherit date
                description='Sub-item: ' + parent_transaction.description, # Inherit description
                note=parent_transaction.note,               # Inherit note
                amount=decimal.Decimal('0.00'),             # Initialize amount to 0
                tags=list(parent_transaction.tags),         # Inherit tags by associating same Tag objects
                children_flag=False,                        # Children cannot be parents themselves initially
                doc_flag=False                              # doc_flag not specified to be inherited, defaults to False
            )
            db.session.add(child_transaction)
            new_child_transactions.append(child_transaction)
        
        db.session.commit()

        return jsonify({
            "parent": parent_transaction.to_json(include_tags=True),
            "children": [child.to_json(include_tags=True) for child in new_child_transactions]
        }), 201

    except HTTPException as e:
        db.session.rollback() # Ensure rollback for aborts if they don't automatically
        raise e
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error splitting transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="A database error occurred while splitting the transaction.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error splitting transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while splitting the transaction.")



# Delete a transaction
@app.route('/api/transactions/delete/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            abort(404, description=f"Transaction {transaction_id} not found")
        
        # If parent transaction is deleted, children are deleted due to `cascade='all, 
        # delete-orphan'`
        # If a child transaction is deleted:
        # - Its amount does not get added back to parent's *stored* amount.
        # - Parent's children_flag remains True even if it's the last child.
        
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    
    except HTTPException as e: # To re-raise abort() calls
        raise e
    except SQLAlchemyError as e: # Catch DB errors specifically
        db.session.rollback()
        app.logger.error(f"Database error deleting transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="A database error occurred while deleting the transaction.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error deleting transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while deleting the transaction.")



# Update a transaction
@app.route('/api/transactions/update/<int:transaction_id>', methods=['PATCH'])
def update_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            abort(404, description=f"Transaction {transaction_id} not found")
        
        data = request.get_json()
        if not data:
            abort(400, description="Missing request body.")

        if 'date' in data:
            try:
                transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except (ValueError, TypeError):
                abort(400, description="Invalid date format. Use YYYY-MM-DD.")
        
        if 'amount' in data:
            try:
                amount_str = str(data['amount'])
                if ',' in amount_str:
                    amount_str = amount_str.replace(',', '.')
                transaction.amount = decimal.Decimal(amount_str)
            except (decimal.InvalidOperation, TypeError, ValueError):
                abort(400, description="Invalid amount format.")

        if 'description' in data:
            transaction.description = data.get('description')
        if 'note' in data:
            transaction.note = data.get('note')
        if 'children_flag' in data: # Allow updating children_flag if needed (e.g. un-splitting manually)
            if isinstance(data['children_flag'], bool):
                transaction.children_flag = data['children_flag']
            else:
                abort(400, description="'children_flag' must be a boolean.")
        if 'doc_flag' in data:
            if isinstance(data['doc_flag'], bool):
                transaction.doc_flag = data['doc_flag']
            else:
                abort(400, description="'doc_flag' must be a boolean.")
        # parent_id should generally not be updated via this generic endpoint directly,
        # as it's managed by split/delete logic. Could add validation to prevent changing 
        # parent_id.

        db.session.commit()

        return jsonify(transaction.to_json(include_tags=True)), 200
    
    except HTTPException as e:
         raise e
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error updating transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="A database error occurred while updating the transaction.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error updating transaction {transaction_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while updating the transaction.")



@app.route('/api/transactions/check-duplicates-bulk', methods=['POST'])
def check_transactions_duplicates_bulk():
    incoming_transactions = request.get_json()
    if not isinstance(incoming_transactions, list):
        abort(400, description="Expected a list of transactions.")

    results = []
    for tx_data in incoming_transactions:
        date_str = tx_data.get('Date')
        amount_str = tx_data.get('Amount')
        description = tx_data.get('Description')

        # Basic validation for essential fields for a duplicate check
        if not date_str or amount_str is None:
            results.append(False)
            continue
        
        try:
            # Assuming frontend sends date as 'YYYY-MM-DD' string
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            results.append(False) 
            continue

        try:
            current_amount_str = str(amount_str)
            if ',' in current_amount_str:
                current_amount_str = current_amount_str.replace(',', '.')
            parsed_amount = decimal.Decimal(current_amount_str)
        except (decimal.InvalidOperation, TypeError, ValueError):
            results.append(False)
            continue
        
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
            results.append(False)
            
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
        return jsonify(new_group.to_json(include_tags=False)), 201
    except IntegrityError:
        db.session.rollback()
        abort(409, description=f"TagGroup with name '{data['name']}' already exists.")
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error creating tag group: {e}", exc_info=True)
        abort(500, description="Could not create tag group.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error creating tag group: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while creating the tag group.")



# Get all TagGroups
@app.route('/api/tag-groups', methods=['GET'])
def get_tag_groups():
    try:
        groups = TagGroup.query.order_by(TagGroup.name.asc()).all()
        return jsonify([group.to_json(include_tags=True) for group in groups])
    except SQLAlchemyError as e:
        app.logger.error(f"Database error getting tag groups: {e}", exc_info=True)
        abort(500, description="An error occurred while retrieving tag groups.")
    except Exception as e:
        app.logger.error(f"Unexpected error getting tag groups: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while retrieving tag groups.")



# Get TagGroup by ID
@app.route('/api/tag-groups/<int:group_id>', methods=['GET'])
def get_tag_group(group_id):
    group = TagGroup.query.get_or_404(group_id, description=f"TagGroup with id {group_id} not found.")
    return jsonify(group.to_json(include_tags=True))



# Delete TagGroup by ID
@app.route('/api/tag-groups/<int:group_id>', methods=['DELETE'])
def delete_tag_group(group_id):
    group = TagGroup.query.get_or_404(group_id, description=f"TagGroup with id {group_id} not found.")
    try:
        db.session.delete(group) # Cascade will handle deleting associated Tags
        db.session.commit()
        return jsonify({"message": f"TagGroup '{group.name}' and its tags deleted."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error deleting tag group {group_id}: {e}", exc_info=True)
        abort(500, description="Could not delete tag group.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error deleting tag group {group_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while deleting the tag group.")





# --- Tag Routes ---




# Create a new Tag
@app.route('/api/tags', methods=['POST'])
def create_tag():
    data = request.get_json()
    if not data or not data.get('name') or 'tag_group_id' not in data:
        abort(400, description="Missing 'name' or 'tag_group_id' in request body.")

    group = TagGroup.query.get(data['tag_group_id'])
    if not group:
        abort(404, description=f"TagGroup with id {data['tag_group_id']} not found.")

    try:
        new_tag = Tag(
            name=data['name'],
            color=data.get('color'),
            tag_group_id=data['tag_group_id']
        )
        db.session.add(new_tag)
        db.session.commit()
        return jsonify(new_tag.to_json(include_group=True, include_transactions=False)), 201
    except IntegrityError:
        db.session.rollback()
        abort(409, description=f"Tag with name '{data['name']}' already exists in group '{group.name}'.")
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error creating tag: {e}", exc_info=True)
        abort(500, description="Could not create tag.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error creating tag: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while creating the tag.")



# Get all Tags
@app.route('/api/tags', methods=['GET'])
def get_tags():
    try:
        group_id = request.args.get('group_id', type=int)
        query = Tag.query
        if group_id:
            query = query.filter(Tag.tag_group_id == group_id)
        tags = query.order_by(Tag.name.asc()).all()
        return jsonify([tag.to_json(include_group=True, include_transactions=False) for tag in tags])
    except SQLAlchemyError as e:
        app.logger.error(f"Database error getting tags: {e}", exc_info=True)
        abort(500, description="An error occurred while retrieving tags.")
    except Exception as e:
        app.logger.error(f"Unexpected error getting tags: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while retrieving tags.")



# Get Tag by ID
@app.route('/api/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id, description=f"Tag with id {tag_id} not found.")
    return jsonify(tag.to_json(include_group=True, include_transactions=False))



# Delete Tag by ID
@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id, description=f"Tag with id {tag_id} not found.")
    try:
        db.session.delete(tag)
        db.session.commit()
        return jsonify({"message": f"Tag '{tag.name}' deleted."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error deleting tag {tag_id}: {e}", exc_info=True)
        abort(500, description="Could not delete tag.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error deleting tag {tag_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while deleting the tag.")




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
        return jsonify({"message": f"Tag '{tag.name}' already associated with transaction {tx_id}."}), 200

    try:
        tx.tags.append(tag)
        db.session.commit()
        return jsonify(tx.to_json(include_tags=True)), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error adding tag {tag_id} to transaction {tx_id}: {e}", exc_info=True)
        abort(500, description="Could not add tag to transaction.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error adding tag {tag_id} to transaction {tx_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while adding the tag.")




@app.route('/api/transactions/<int:tx_id>/tags/<int:tag_id>', methods=['DELETE'])
def remove_tag_from_transaction(tx_id, tag_id):
    tx = Transaction.query.get_or_404(tx_id, description=f"Transaction with id {tx_id} not found.")
    tag = Tag.query.get(tag_id)

    if not tag or tag not in tx.tags:
            abort(404, description=f"Tag with id {tag_id} is not associated with transaction {tx_id}.")

    try:
        tx.tags.remove(tag)
        db.session.commit()
        return jsonify(tx.to_json(include_tags=True)), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error removing tag {tag_id} from transaction {tx_id}: {e}", exc_info=True)
        abort(500, description="Could not remove tag from transaction.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error removing tag {tag_id} from transaction {tx_id}: {e}", exc_info=True)
        abort(500, description="An unexpected error occurred while removing the tag.")




# --- Settings Routes ---



SUPPORTED_DECIMAL_SETTINGS = ['initial_balance', 'final_running_balance']

@app.route('/api/settings/<string:setting_key>', methods=['GET'])
def get_setting(setting_key):
    """Retrieves a specific setting value."""
    try:
        setting = Setting.query.filter_by(key=setting_key).first()

        if setting:
            return jsonify(setting.to_json())
        else:
            if setting_key in SUPPORTED_DECIMAL_SETTINGS:
                return jsonify({'key': setting_key, 'value': '0.00'})
            else:
                abort(404, description=f"Setting '{setting_key}' not found.")

    except SQLAlchemyError as e:
        db.session.rollback() # Should not be needed for GET, but good practice if complex logic was here
        app.logger.error(f"Database error retrieving setting '{setting_key}': {e}", exc_info=True)
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

    if setting_key in SUPPORTED_DECIMAL_SETTINGS:
        try:
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
        if setting_key not in SUPPORTED_DECIMAL_SETTINGS: # Be explicit about what can be set
            abort(400, description=f"Setting key '{setting_key}' is not currently supported for updates via this endpoint.")
        parsed_value = str(new_value_str)

    setting = Setting.query.filter_by(key=setting_key).first()

    try:
        if setting:
            setting.value = parsed_value
            app.logger.info(f"Updating setting '{setting_key}' to {parsed_value}")
        else:
            if setting_key in SUPPORTED_DECIMAL_SETTINGS: # Only create supported settings
                setting = Setting(key=setting_key, value=parsed_value)
                db.session.add(setting)
                app.logger.info(f"Creating new setting '{setting_key}' with value {parsed_value}")
            else:
                 abort(400, description=f"Cannot create unsupported setting key '{setting_key}'.")

        db.session.commit()
        if setting: # Should always be true if no abort
            return jsonify(setting.to_json()), 200
        else:
            # This case should ideally not be reached due to the aborts above, but for safety:
            abort(500, description=f"Failed to save setting '{setting_key}' due to an unexpected issue.")

    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error saving setting '{setting_key}': {e}", exc_info=True)
        abort(500, description=f"Database error saving setting '{setting_key}'.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error saving setting '{setting_key}': {e}", exc_info=True)
        abort(500, description=f"Could not save setting '{setting_key}'.")