from app import app, db
from flask import request, jsonify
from models import Friend


# Get all friends
@app.route('/api/friends', methods=['GET'])
def get_friends():
    friends = Friend.query.all()
    return jsonify([friend.to_json() for friend in friends])



# Create a friend
@app.route('/api/friends', methods=['POST'])
def create_friend():
    try:
        data = request.get_json()
        
        # Validations
        required_fields = ['name', 'role', 'description', 'gender']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing {field} field'}), 400
        
        new_friend = Friend(
            name=data['name'],
            role=data['role'],
            description=data['description'],
            gender=data['gender'],
            img_url=None
        )
        # Fetch avatar image based on gender
        if new_friend.gender == 'male':
            img_url = f'https://avatar.iran.liara.run/public/boy?username={new_friend.name}'
        elif new_friend.gender == 'female':
            img_url = f'https://avatar.iran.liara.run/public/girl?username={new_friend.name}'
        else:
            img_url = None
        new_friend.img_url = img_url
        db.session.add(new_friend)
        db.session.commit()
        return jsonify(new_friend.to_json()), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400 # 400 means bad request



# Delete a friend
@app.route('/api/friends/<int:friend_id>', methods=['DELETE'])
def delete_friend(friend_id):
    try:
        friend = Friend.query.get(friend_id) # Get the friend by id
        if not friend:
            return jsonify({'error': 'Friend not found'}), 404 # 404 means not found
        db.session.delete(friend)
        db.session.commit()
        return jsonify({'message': 'Friend deleted successfully'}), 200 # 200 means ok
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request



# Update a friend
@app.route('/api/friends/<int:friend_id>', methods=['PATCH']) # PATCH is used for partial updates
def update_friend(friend_id):
    
    try:
        friend = Friend.query.get(friend_id) # Get the friend by id
        if not friend:
            return jsonify({'error': 'Friend not found'}), 404 # 404 means not found
        
        data = request.get_json()
        print('----', data)
        
        friend.name = data.get('name', friend.name) # Get the name from the request or use the current name
        friend.role = data.get('role', friend.role)
        friend.description = data.get('description', friend.description)
        friend.gender = data.get('gender', friend.gender)
        db.session.commit()

        print('******', friend.to_json())

        return jsonify(friend.to_json()), 200 # 200 means ok
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 # 400 means bad request