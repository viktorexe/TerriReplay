from flask import request, jsonify
from datetime import datetime
import traceback

def get_user_data(get_user_collection):
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        client_version = data.get('version', 0)
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        user_collection = get_user_collection(username)
        if user_collection is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        user_data = user_collection.find_one({'username': username})
        
        if user_data is None:
            return jsonify({'success': False, 'message': 'User data not found'})
        
        server_version = user_data.get('version', 1)
        
        # Update last access time
        user_collection.update_one(
            {'username': username},
            {'$set': {'last_access': datetime.utcnow()}}
        )
        
        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'settings': user_data.get('settings', {}),
                'version': server_version
            },
            'has_updates': server_version > client_version
        })
    except Exception as e:
        print(f"Get user data error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})