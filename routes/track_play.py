from flask import request, jsonify
from datetime import datetime
import traceback

def track_play(get_user_collection):
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        replay_id = data.get('replay_id', '')
        
        if not username or not replay_id:
            return jsonify({'success': False, 'message': 'Username and replay_id required'})
        
        user_collection = get_user_collection(username)
        if user_collection is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        user_data = user_collection.find_one({'username': username})
        
        if user_data is None:
            return jsonify({'success': False, 'message': 'User data not found'})
        
        # Update replay play count and last played time
        replays = user_data.get('replays', [])
        for replay in replays:
            if replay.get('id') == replay_id:
                replay['last_played'] = datetime.utcnow().isoformat()
                replay['play_count'] = replay.get('play_count', 0) + 1
                break
        
        # Update version for sync
        new_version = user_data.get('version', 1) + 1
        
        user_collection.update_one(
            {'username': username},
            {'$set': {
                'replays': replays,
                'version': new_version,
                'last_modified': datetime.utcnow()
            }}
        )
        
        return jsonify({'success': True, 'message': 'Play tracked successfully'})
    except Exception as e:
        print(f"Track play error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': f'Error tracking play: {str(e)}'})