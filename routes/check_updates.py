from flask import request, jsonify
from datetime import datetime
import traceback

def check_updates(get_user_collection):
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
        has_updates = server_version > client_version
        
        response = {
            'success': True, 
            'has_updates': has_updates, 
            'server_version': server_version
        }
        
        if has_updates:
            response['data'] = {
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'settings': user_data.get('settings', {}),
                'version': server_version
            }
            
            # Update last sync time
            user_collection.update_one(
                {'username': username},
                {'$set': {'last_sync': datetime.utcnow()}}
            )
        
        return jsonify(response)
    except Exception as e:
        print(f"Check updates error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})