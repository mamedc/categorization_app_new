# File path: backend/routes.py

from app import app, db
from flask import request, jsonify, abort, send_from_directory, current_app, send_file
from models import Transaction, Tag, TagGroup, Setting, Document
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import decimal
from werkzeug.exceptions import HTTPException
import os
import traceback
from werkzeug.utils import secure_filename # For sanitizing filenames
import uuid # For generating unique filenames
import io # For in-memory file handling
import zipfile # For creating ZIP archives
import json # Standard json library, ensure it's imported if not already


ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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

        return jsonify(new_transaction.to_json(include_tags=True, include_documents=True)), 201

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
        return jsonify([transaction.to_json(include_tags=True, include_documents=True) for transaction in transactions])
    except Exception as e:
        app.logger.error(f"Error getting transactions: {e}", exc_info=True)
        abort(500, description="An error occurred while retrieving transactions.")



# Get transaction by ID
@app.route('/api/transactions/view/<int:transaction_id>', methods=['GET'])
def view_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id, description=f"Transaction {transaction_id} not found")
    return jsonify(transaction.to_json(include_tags=True, include_documents=True))



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
        inherited_tags = list(parent_transaction.tags)
        for _ in range(num_children):
            # Create new sub-transaction
            child_transaction = Transaction(
                parent_id=parent_transaction.id,
                date=parent_transaction.date,               # Inherit date
                description='Sub-item: ' + parent_transaction.description, # Inherit description
                note=parent_transaction.note,               # Inherit note
                amount=decimal.Decimal('0.00'),             # Initialize amount to 0
                tags=inherited_tags,                        # Inherit tags by associating same Tag objects
                children_flag=False,                        # Children cannot be parents themselves initially
                doc_flag=False                              # doc_flag not specified to be inherited, defaults to False
            )
            db.session.add(child_transaction)
            new_child_transactions.append(child_transaction)
        
        parent_transaction.tags = [] # Delete tags from the original (parent) transaction
        db.session.commit()

        return jsonify({
            "parent": parent_transaction.to_json(include_tags=True, include_documents=True),
            "children": [child.to_json(include_tags=True, include_documents=True) for child in new_child_transactions]
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
        # Ensure consistent variable name: transaction_to_delete
        transaction_to_delete = db.session.get(Transaction, transaction_id) 
        if not transaction_to_delete:
            abort(404, description=f"Transaction {transaction_id} not found")
        
        # If deleting a parent transaction, its documents (and children's documents via cascade)
        # will be deleted.
        # If deleting a child, only its documents are deleted.
        # The actual file deletion for documents will be handled by Document model's cascade or 
        # manual cleanup if not.
        # For now, assuming SQLAlchemy cascade handles Document records, and we'll add explicit 
        # file deletion later in document delete route.

        # Clean up associated document files if transaction is deleted
        for doc in transaction_to_delete.documents:
            try:
                doc_path = os.path.join(app.config['UPLOAD_FOLDER'], doc.stored_filename)
                if os.path.exists(doc_path):
                    os.remove(doc_path)
            except Exception as file_e:
                app.logger.error(f"Error deleting file {doc.stored_filename} for transaction {transaction_id}: {file_e}")
                # Continue deleting transaction even if a file can't be removed

        # Check if the transaction to delete is a child and if it's the last one
        if transaction_to_delete.parent_id is not None:
            # It's a child, get the parent
            parent = db.session.get(Transaction, transaction_to_delete.parent_id)

            if parent: 
                # Count how many children this parent has currently in the DB.
                num_current_children = db.session.query(Transaction.id)\
                    .filter(Transaction.parent_id == parent.id)\
                    .count()
                
                if num_current_children == 1:
                    parent.children_flag = False
                    db.session.add(parent) 

        db.session.delete(transaction_to_delete)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    
    except HTTPException as e: 
        raise e
    except SQLAlchemyError as e: 
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
        if 'children_flag' in data:
            if isinstance(data['children_flag'], bool):
                transaction.children_flag = data['children_flag']
            else:
                abort(400, description="'children_flag' must be a boolean.")
        
        # doc_flag is managed by document upload/delete routes, but allow override if 
        # explicitly sent
        if 'doc_flag' in data:
            if isinstance(data['doc_flag'], bool):
                transaction.doc_flag = data['doc_flag']
            else:
                abort(400, description="'doc_flag' must be a boolean.")
        
        db.session.commit()

        return jsonify(transaction.to_json(include_tags=True, include_documents=True)), 200
    
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

        if not date_str or amount_str is None:
            results.append(False)
            continue
        
        try:
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




# --- Document Routes ---



@app.route('/api/transactions/<int:transaction_id>/documents', methods=['POST'])
def upload_document(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id, description=f"Transaction {transaction_id} not found")

    if 'file' not in request.files:
        abort(400, description="No file part in the request.")
    
    file = request.files['file']
    if file.filename == '':
        abort(400, description="No selected file.")

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename) # Sanitize original filename for safety
        file_ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        stored_filename = f"{uuid.uuid4()}.{file_ext}"
        
        try:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], stored_filename)
            file.save(filepath)

            new_document = Document(
                original_filename=original_filename,
                stored_filename=stored_filename,
                mimetype=file.mimetype,
                transaction_id=transaction.id
            )
            db.session.add(new_document)
            
            if not transaction.doc_flag:
                transaction.doc_flag = True
            
            db.session.commit()
            return jsonify(new_document.to_json()), 201
        except Exception as e:
            db.session.rollback()
            # Attempt to delete partially saved file if error occurs after save but before commit
            if 'filepath' in locals() and os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as file_del_err:
                    app.logger.error(f"Error cleaning up file {filepath} after upload error: {file_del_err}")
            app.logger.error(f"Error uploading document for transaction {transaction_id}: {e}", exc_info=True)
            abort(500, description="Could not save document.")
    else:
        abort(400, description="File type not allowed.")


@app.route('/api/documents/<int:document_id>/view', methods=['GET'])
def view_document(document_id):
    document = Document.query.get_or_404(document_id, description=f"Document {document_id} not found.")
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], document.stored_filename, as_attachment=False, mimetype=document.mimetype)
    except FileNotFoundError:
        abort(404, description="File not found on server.")
    except Exception as e:
        app.logger.error(f"Error serving document {document_id} for view: {e}", exc_info=True)
        abort(500, description="Could not serve document.")


@app.route('/api/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    document = Document.query.get_or_404(document_id, description=f"Document {document_id} not found.")
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], document.stored_filename, as_attachment=True, download_name=document.original_filename)
    except FileNotFoundError:
        abort(404, description="File not found on server.")
    except Exception as e:
        app.logger.error(f"Error serving document {document_id} for download: {e}", exc_info=True)
        abort(500, description="Could not serve document for download.")


@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    document = Document.query.get_or_404(document_id, description=f"Document {document_id} not found.")
    transaction = document.transaction # Get associated transaction before deleting document

    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], document.stored_filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        
        db.session.delete(document)
        
        # Check if the transaction has any other documents left
        if transaction and not transaction.documents: # This checks after the current document is marked for deletion
            transaction.doc_flag = False
        
        db.session.commit()
        return jsonify({"message": "Document deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting document {document_id}: {e}", exc_info=True)
        abort(500, description="Could not delete document.")




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
        return jsonify(tx.to_json(include_tags=True, include_documents=True)), 200
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
        return jsonify(tx.to_json(include_tags=True, include_documents=True)), 200
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
        if setting_key not in SUPPORTED_DECIMAL_SETTINGS:
            abort(400, description=f"Setting key '{setting_key}' is not currently supported for updates via this endpoint.")
        parsed_value = str(new_value_str)

    setting = Setting.query.filter_by(key=setting_key).first()

    try:
        if setting:
            setting.value = parsed_value
            app.logger.info(f"Updating setting '{setting_key}' to {parsed_value}")
        else:
            if setting_key in SUPPORTED_DECIMAL_SETTINGS:
                setting = Setting(key=setting_key, value=parsed_value)
                db.session.add(setting)
                app.logger.info(f"Creating new setting '{setting_key}' with value {parsed_value}")
            else:
                 abort(400, description=f"Cannot create unsupported setting key '{setting_key}'.")

        db.session.commit()
        if setting:
            return jsonify(setting.to_json()), 200
        else:
            abort(500, description=f"Failed to save setting '{setting_key}' due to an unexpected issue.")

    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f"Database error saving setting '{setting_key}': {e}", exc_info=True)
        abort(500, description=f"Database error saving setting '{setting_key}'.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Unexpected error saving setting '{setting_key}': {e}", exc_info=True)
        abort(500, description=f"Could not save setting '{setting_key}'.")


# --- Backup Route ---
@app.route('/api/backup/all', methods=['GET'])
def backup_all_data():
    try:
        # 1. Fetch all transactions
        transactions = Transaction.query.order_by(Transaction.date.asc(), Transaction.id.asc()).all()
        # We need to modify how document filenames are stored in the JSON if we change them in the ZIP
        # For simplicity, let's assume the JSON will still refer to original_filename,
        # and the restore process would need to map backed-up names if they change.
        # Or, we can add a 'backup_filename' field to the document's JSON representation for backup.

        transactions_list_for_json = []
        for tx in transactions:
            tx_json = tx.to_json(include_tags=True, include_documents=False) # Exclude documents initially
            tx_json['documents'] = []
            for doc in tx.documents:
                doc_json = doc.to_json()
                # Create a unique filename for the backup archive
                # This will be the name used *inside* the ZIP's Documents folder
                doc_json['backup_filename'] = f"{doc.id}_{doc.original_filename.replace('/', '_').replace(' ', '_')}"
                tx_json['documents'].append(doc_json)
            transactions_list_for_json.append(tx_json)
        
        transactions_json_string = json.dumps(transactions_list_for_json, indent=4, default=str)

        # 3. Prepare to collect document files (already implicitly done by fetching transactions with documents)
        all_documents = Document.query.all() # Or iterate through transactions.documents

        # 4. Create a ZIP archive in memory
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zip_archive:
            # Add transactions.json
            zip_archive.writestr('transactions.json', transactions_json_string)

            upload_folder = current_app.config['UPLOAD_FOLDER']
            if not os.path.isdir(upload_folder): 
                current_app.logger.error(f"Upload folder {upload_folder} not found or is not a directory during backup.")
            else:
                documents_folder_in_zip = "Documents/" # Root folder for documents in ZIP
                
                # Keep track of filenames to ensure uniqueness within the ZIP's Documents folder.
                # This is an alternative to just using doc.id if we want to preserve original_filename as much as possible.
                # However, simply prefixing with doc.id is more robust and simpler.
                # Let's stick to the doc.id prefix method for guaranteed uniqueness directly.

                for doc in all_documents: # Iterate through all documents directly
                    # Use the unique backup_filename created earlier (or generate it here)
                    unique_backup_filename = f"{doc.id}_{doc.original_filename.replace('/', '_').replace(' ', '_')}"
                    # Sanitize further if needed, but doc.id prefix helps a lot.
                    # Example: remove characters not allowed in filenames on some OS
                    # safe_original_part = secure_filename(doc.original_filename) might be too aggressive
                    # For backup, often better to be more permissive with original name and rely on ID for uniqueness.
                    
                    zip_entry_name = f"{documents_folder_in_zip}{unique_backup_filename}"
                    
                    doc_file_path = os.path.join(upload_folder, doc.stored_filename)
                    
                    if os.path.exists(doc_file_path) and os.path.isfile(doc_file_path):
                        zip_archive.write(doc_file_path, arcname=zip_entry_name)
                    else:
                        current_app.logger.warning(f"Document file not found or is not a file: {doc_file_path} for document ID {doc.id} (original: {doc.original_filename}). Skipping.")
        
        memory_file.seek(0)

        # 5. Send the ZIP file
        backup_filename = f"categorization_backup_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.zip"
        
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=backup_filename
        )

    except Exception as e:
        current_app.logger.error(f"Error during backup: {e}", exc_info=True)
        return jsonify({"error": "Failed to create backup.", "details": str(e)}), 500



    # --- Test Utility Routes ---



@app.route('/api/test/reset-database', methods=['POST'])
def reset_database_for_test():
    """
    Resets the database by dropping all tables and recreating them.
    This endpoint is intended for E2E testing purposes only.
    """
    is_debug_mode = app.debug 
    
    if not is_debug_mode and os.environ.get('FLASK_ENV') == 'production':
        app.logger.warning("Attempt to reset database (drop/create all) in a production-like environment denied.")
        return jsonify({"error": "Resetting database by dropping tables is not allowed in this environment."}), 403

    app.logger.info(f"Database reset request received. App debug mode: {is_debug_mode}")

    try:
        app.logger.info("Attempting to drop all tables...")
        with app.app_context():
            db.drop_all() 
            app.logger.info("All tables dropped successfully.")
            
            app.logger.info("Attempting to create all tables...")
            db.create_all()
            app.logger.info("All tables created successfully.")
        
        app.logger.info("Database schema reset (dropped and recreated) successfully for testing.")
        return jsonify({"message": "Database schema reset successfully for testing."}), 200

    except Exception as e:
        app.logger.error(f"Error during database reset: {str(e)}", exc_info=True)
        
        if app.debug:
            tb_str = traceback.format_exc()
            return jsonify({
                "error": "Failed to reset database schema.", 
                "details": str(e),
                "traceback": tb_str
            }), 500
        else:
            return jsonify({"error": "Failed to reset database schema. Check server logs for details."}), 500