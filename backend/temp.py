# routes.py
# ... (imports remain the same) ...
# Make sure 'app' is defined if used for logging/abort
from flask import current_app as app # Use current_app for logger within routes



# --- TagGroup Routes ---

@app.route('/api/tag-groups', methods=['POST'])
def create_tag_group():
    # ... (existing code) ...
    try:
        # ... (existing code) ...
        db.session.commit()
        # Decide what to include - group only is fine here usually
        return jsonify(new_group.to_json(include_tags=False)), 201 # Don't include tags by default
    # ... (existing except blocks) ...

@app.route('/api/tag-groups', methods=['GET'])
def get_tag_groups():
    try: # Add try/except for safety
        groups = TagGroup.query.all()
        # Include tags when listing groups
        return jsonify([group.to_json(include_tags=True) for group in groups])
    except Exception as e:
        app.logger.error(f"Error getting tag groups: {e}")
        abort(500, description="An error occurred while retrieving tag groups.")


@app.route('/api/tag-groups/<int:group_id>', methods=['GET'])
def get_tag_group(group_id):
    # get_or_404 already handles try/except for not found
    group = TagGroup.query.get_or_404(group_id, description=f"TagGroup with id {group_id} not found.")
    # Include tags when viewing a single group
    return jsonify(group.to_json(include_tags=True))

# ... (delete tag group route likely doesn't need to_json change) ...

















# --- Tag Routes ---






# ... (delete tag route likely doesn't need to_json change) ...




# --- Transaction Tagging Routes ---
# These routes also need to use the updated to_json or to_dict methods


