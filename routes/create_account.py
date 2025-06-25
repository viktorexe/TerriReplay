from flask import request, jsonify
from datetime import datetime
import traceback

def create_account(get_db, get_user_collection):
    try:
        print("=== CREATE ACCOUNT DEBUG START ===")
        data = request.get_json()
        print(f"Received data: {data}")
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        local_folders = data.get('local_folders', [])
        local_replays = data.get('local_replays', [])
        
        print(f"Username: {username}")
        print(f"Password length: {len(password) if password else 0}")
        print(f"Local folders: {len(local_folders)}")
        print(f"Local replays: {len(local_replays)}")
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'})
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
        
        # Test MongoDB connection first
        print("Testing MongoDB connection...")
        client = get_db()
        if client is None:
            print("ERROR: MongoDB client is None")
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        try:
            client.admin.command('ping')
            print("MongoDB connection successful")
        except Exception as ping_error:
            print(f"MongoDB ping failed: {ping_error}")
            return jsonify({'success': False, 'message': f'Database ping failed: {str(ping_error)}'})
        
        # Get user's collection
        print(f"Getting collection for user: {username}")
        user_collection = get_user_collection(username)
        if user_collection is None:
            print("ERROR: User collection is None")
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        print(f"Collection obtained: {user_collection.name}")
        
        # Check if username exists
        print("Checking if user exists...")
        existing_user = user_collection.find_one({'username': username})
        if existing_user is not None:
            print(f"User {username} already exists")
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        print("User does not exist, creating new account...")
        
        # Create user account with all local data
        user_account_data = {
            'username': username,
            'password': password,
            'folders': local_folders,
            'replays': local_replays,
            'settings': {
                'theme': 'light',
                'sortOrder': 'date-desc'
            },
            'created_at': datetime.utcnow(),
            'last_modified': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'version': 1,
            'total_replays': len(local_replays),
            'total_folders': len(local_folders)
        }
        
        print(f"Inserting user data for {username}...")
        print(f"Data to insert: {user_account_data}")
        
        result = user_collection.insert_one(user_account_data)
        print(f"Insert result: {result.inserted_id}")
        
        # Verify the data was inserted
        print("Verifying data insertion...")
        verify_data = user_collection.find_one({'username': username})
        if verify_data:
            print(f"SUCCESS: User data verified for {verify_data['username']}")
            print(f"Folders: {len(verify_data.get('folders', []))}")
            print(f"Replays: {len(verify_data.get('replays', []))}")
        else:
            print("ERROR: User data not found after insertion")
            return jsonify({'success': False, 'message': 'Data verification failed'})
        
        print("=== CREATE ACCOUNT DEBUG END ===")
        
        return jsonify({
            'success': True, 
            'message': 'Account created successfully',
            'debug_info': {
                'collection_name': user_collection.name,
                'inserted_id': str(result.inserted_id),
                'folders_synced': len(local_folders),
                'replays_synced': len(local_replays)
            },
            'synced_data': {
                'folders': local_folders,
                'replays': local_replays,
                'version': 1
            }
        })
    except Exception as e:
        print(f"Create account error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})