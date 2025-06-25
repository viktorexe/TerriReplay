from flask import request, jsonify
from datetime import datetime
import traceback

def sync_data(get_user_collection):
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        folders = data.get('folders', [])
        replays = data.get('replays', [])
        client_version = data.get('version', 1)
        settings = data.get('settings', {})
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        user_collection = get_user_collection(username)
        if user_collection is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        current_data = user_collection.find_one({'username': username})
        
        if current_data is None:
            print(f"User {username} not found for sync")
            return jsonify({'success': False, 'message': 'User not found'})
        
        server_version = current_data.get('version', 1)
        
        # Check if client data is outdated
        if client_version < server_version:
            return jsonify({
                'success': True,
                'outdated': True,
                'server_data': {
                    'folders': current_data.get('folders', []),
                    'replays': current_data.get('replays', []),
                    'settings': current_data.get('settings', {}),
                    'version': server_version
                },
                'message': 'Client data is outdated, server data returned'
            })
        
        # Update with new version
        new_version = server_version + 1
        
        # Advanced sync - preserve all data
        detailed_replays = []
        for replay in replays:
            detailed_replay = {
                'id': replay.get('id'),
                'name': replay.get('name', 'Unnamed Replay'),
                'link': replay.get('link', ''),
                'date': replay.get('date', ''),
                'timestamp': replay.get('timestamp', 0),
                'folderId': replay.get('folderId'),
                'last_played': replay.get('last_played'),
                'play_count': replay.get('play_count', 0)
            }
            detailed_replays.append(detailed_replay)
        
        detailed_folders = []
        for folder in folders:
            detailed_folder = {
                'id': folder.get('id'),
                'name': folder.get('name', 'Unnamed Folder'),
                'color': folder.get('color', '#4a6bff'),
                'createdAt': folder.get('createdAt', '')
            }
            detailed_folders.append(detailed_folder)
        
        # Update everything
        print(f"Syncing data for {username}: {len(detailed_replays)} replays, {len(detailed_folders)} folders")
        user_collection.update_one(
            {'username': username},
            {'$set': {
                'folders': detailed_folders,
                'replays': detailed_replays,
                'settings': settings,
                'last_modified': datetime.utcnow(),
                'version': new_version,
                'total_replays': len(detailed_replays),
                'total_folders': len(detailed_folders)
            }}
        )
        
        return jsonify({
            'success': True,
            'version': new_version,
            'message': f'Synced {len(detailed_replays)} replays and {len(detailed_folders)} folders'
        })
    except Exception as e:
        print(f"Sync error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': f'Sync failed: {str(e)}'})