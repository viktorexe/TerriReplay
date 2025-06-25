from flask import request, jsonify
from datetime import datetime
import traceback

def login(get_user_collection):
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        # Get user's collection
        user_collection = get_user_collection(username)
        if user_collection is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        # Find user data
        print(f"Looking for user data for {username}")
        user_data = user_collection.find_one({'username': username})
        print(f"Found user data: {user_data is not None}")
        
        if user_data is None:
            print(f"User {username} not found")
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        if user_data.get('password') != password:
            print(f"Password mismatch for {username}")
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        print(f"Login successful for {username}")
        
        # Update last login time
        user_collection.update_one(
            {'username': username},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        return jsonify({
            'success': True, 
            'message': 'Login successful',
            'user': {
                'username': username,
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'settings': user_data.get('settings', {}),
                'version': user_data.get('version', 1)
            }
        })
    except Exception as e:
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})