from flask import request, jsonify
import os

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

def extract_replay_data(replay_link):
    """Extract the replay data from the URL"""
    print(f"Extracting data from: {replay_link}")
    if not replay_link or '?' not in replay_link:
        print("No query parameters found")
        return ''
    
    try:
        # Get everything after the question mark
        query_part = replay_link.split('?', 1)[1]
        print(f"Query part: {query_part[:100]}...")
        
        # Remove parameter names if present
        if 'replay=' in query_part:
            query_part = query_part.replace('replay=', '')
            print("Removed 'replay=' prefix")
        elif 'data=' in query_part:
            query_part = query_part.replace('data=', '')
            print("Removed 'data=' prefix")
        
        print(f"Final extracted data length: {len(query_part)}")
        return query_part
    except Exception as e:
        print(f"Error extracting replay data: {str(e)}")
        return ''

def play_replay():
    """Handle replay playback requests"""
    print("PLAY_REPLAY called")
    try:
        data = request.get_json()
        replay_link = data.get('replay_link', '')
        replay_name = data.get('replay_name', 'Replay')
        
        print(f"Replay link: {replay_link}")
        print(f"Replay name: {replay_name}")
        
        if not replay_link:
            return jsonify({'success': False, 'message': 'Replay link required'})
        
        # Extract replay data from link
        replay_data = extract_replay_data(replay_link)
        print(f"Extracted data: {replay_data[:50] if replay_data else 'None'}...")
        
        # Determine which game version to use
        latest_path = os.path.join('emulated_versions', LATEST_VERSION)
        fallback_path = os.path.join('emulated_versions', FALLBACK_VERSION)
        
        if os.path.exists(latest_path):
            game_version = LATEST_VERSION
            print(f"Using latest version: {game_version}")
        elif os.path.exists(fallback_path):
            game_version = FALLBACK_VERSION
            print(f"Using fallback version: {game_version}")
        else:
            print("ERROR: No game files found")
            return jsonify({'success': False, 'message': 'No game files available'})
        
        return jsonify({
            'success': True,
            'game_version': game_version,
            'replay_data': replay_data,
            'replay_name': replay_name
        })
    except Exception as e:
        print(f"Play replay error: {str(e)}")
        return jsonify({'success': False, 'message': f'Error playing replay: {str(e)}'})