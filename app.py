from flask import Flask, render_template, request, jsonify, send_from_directory, redirect
import os
import re
import json
import random
import string
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import traceback

app = Flask(__name__)

# MongoDB connection - optimized for serverless
MONGO_URI = "mongodb+srv://drviktorexe:Vansh240703@ttmod2025.9vmzbje.mongodb.net/?retryWrites=true&w=majority&appName=TTMod2025"

# Global client to reuse connection
mongo_client = None

def get_db():
    """Get database connection - optimized for serverless"""
    global mongo_client
    try:
        if mongo_client is None:
            mongo_client = MongoClient(MONGO_URI, 
                                      serverSelectionTimeoutMS=5000,
                                      connectTimeoutMS=5000,
                                      socketTimeoutMS=5000,
                                      maxPoolSize=1)
        return mongo_client
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}")
        return None

def get_user_collection(username):
    """Get user-specific collection - each user has their own collection"""
    try:
        print(f"Getting user collection for: {username}")
        client = get_db()
        if client is None:
            print("ERROR: MongoDB client is None")
            return None
            
        # Each user gets their own collection in terristats database
        db = client.terristats
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', username.lower())
        
        print(f"Safe collection name: {safe_name}")
        print(f"Database: {db.name}")
        
        # Get collection reference
        collection = db[safe_name]
        print(f"Collection reference obtained: {collection.full_name}")
        
        # Check if collection exists
        existing_collections = db.list_collection_names()
        print(f"Existing collections: {existing_collections}")
        
        if safe_name not in existing_collections:
            print(f"Collection {safe_name} doesn't exist, creating it...")
            try:
                # Insert a dummy document to create the collection
                dummy_doc = {'_temp': True, 'created_at': datetime.utcnow()}
                insert_result = collection.insert_one(dummy_doc)
                print(f"Dummy document inserted: {insert_result.inserted_id}")
                
                # Remove the dummy document
                delete_result = collection.delete_one({'_temp': True})
                print(f"Dummy document deleted: {delete_result.deleted_count}")
                
                print(f"Collection {safe_name} created successfully")
            except Exception as create_error:
                print(f"Error creating collection: {create_error}")
                return None
        else:
            print(f"Collection {safe_name} already exists")
        
        # Verify collection is accessible
        try:
            count = collection.count_documents({})
            print(f"Collection {safe_name} has {count} documents")
        except Exception as count_error:
            print(f"Error counting documents: {count_error}")
        
        return collection
    except Exception as e:
        print(f"Error getting user collection: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return None

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

# Advertisement data
ADS_DATA = [
    {
        "id": 1,
        "name": "KD Clan",
        "image": "/static/img/kd.png",
        "discord": "https://discord.gg/nBx5YS8CEp"
    },
    {
        "id": 2,
        "name": "PL Clan",
        "image": "/static/img/pl.png",
        "discord": "https://discord.gg/Ux57KGHeku"
    },
    {
        "id": 3,
        "name": "OG Clan",
        "image": "/static/img/og.png",
        "discord": "https://discord.gg/dkcf5xNpQR"
    }
]

@app.route('/')
def index():
    return render_template('index.html', ads=ADS_DATA)

@app.route('/tos')
def tos():
    return render_template('tos.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/emulated_versions/<path:filename>')
def serve_game_version(filename):
    """Serve game version files with proper headers"""
    print(f"SERVING GAME FILE: {filename}")
    try:
        file_path = os.path.join('emulated_versions', filename)
        if os.path.exists(file_path):
            print(f"File exists: {file_path}")
            return send_from_directory('emulated_versions', filename)
        else:
            print(f"File NOT found: {file_path}")
            return f"Game file not found: {filename}", 404
    except Exception as e:
        print(f"Error serving game file {filename}: {str(e)}")
        return f"Error loading game file: {filename}", 500

@app.route('/test_replay')
def test_replay():
    """Test endpoint to check if replay system is working"""
    try:
        # Check if emulated_versions directory exists
        emulated_dir = os.path.join(os.getcwd(), 'emulated_versions')
        if not os.path.exists(emulated_dir):
            return f"emulated_versions directory not found at: {emulated_dir}"
        
        # List files in emulated_versions
        files = os.listdir(emulated_dir)
        
        # Check for game files
        latest_exists = os.path.exists(os.path.join(emulated_dir, LATEST_VERSION))
        fallback_exists = os.path.exists(os.path.join(emulated_dir, FALLBACK_VERSION))
        
        return f"""
        Replay System Status:
        - emulated_versions directory: EXISTS
        - Files found: {len(files)}
        - {LATEST_VERSION}: {'EXISTS' if latest_exists else 'NOT FOUND'}
        - {FALLBACK_VERSION}: {'EXISTS' if fallback_exists else 'NOT FOUND'}
        - All files: {files}
        
        Replay backend is {'READY' if (latest_exists or fallback_exists) else 'NOT READY - Missing game files'}
        """
    except Exception as e:
        return f"Error checking replay system: {str(e)}"

@app.route('/test_account_creation')
def test_account_creation():
    """Test endpoint to create a test account"""
    try:
        test_username = "testuser123"
        test_password = "testpass123"
        test_folders = [{"id": "folder1", "name": "Test Folder", "color": "#4a6bff"}]
        test_replays = [{"id": "replay1", "name": "Test Replay", "link": "https://test.com"}]
        
        # Call create_account function directly
        from flask import request
        import json
        
        # Simulate request data
        test_data = {
            'username': test_username,
            'password': test_password,
            'local_folders': test_folders,
            'local_replays': test_replays
        }
        
        print(f"Testing account creation with data: {test_data}")
        
        # Test MongoDB connection first
        client = get_db()
        if client is None:
            return "MongoDB connection failed"
        
        client.admin.command('ping')
        
        # Get collection
        user_collection = get_user_collection(test_username)
        if user_collection is None:
            return "Failed to get user collection"
        
        # Check if user exists
        existing = user_collection.find_one({'username': test_username})
        if existing:
            return f"Test user {test_username} already exists. Delete it first."
        
        # Create test account
        user_account_data = {
            'username': test_username,
            'password': test_password,
            'folders': test_folders,
            'replays': test_replays,
            'settings': {'theme': 'light', 'sortOrder': 'date-desc'},
            'created_at': datetime.utcnow(),
            'last_modified': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'version': 1,
            'total_replays': len(test_replays),
            'total_folders': len(test_folders)
        }
        
        result = user_collection.insert_one(user_account_data)
        
        # Verify
        verify_data = user_collection.find_one({'username': test_username})
        
        return f"""
        Test Account Creation Result:
        - Insert ID: {result.inserted_id}
        - Verification: {'SUCCESS' if verify_data else 'FAILED'}
        - Collection: {user_collection.full_name}
        - Data: {verify_data}
        """
        
    except Exception as e:
        return f"Test account creation failed: {str(e)}\n\nTraceback: {traceback.format_exc()}"

@app.route('/debug_mongodb')
def debug_mongodb():
    """Debug endpoint to check MongoDB connection and data"""
    try:
        client = get_db()
        if client is None:
            return "MongoDB client is None - connection failed"
        
        # Test connection
        client.admin.command('ping')
        
        # Check terristats database
        db = client.terristats
        collections = db.list_collection_names()
        
        result = f"""
        MongoDB Debug Info:
        - Connection: SUCCESS
        - Database: terristats
        - Collections found: {len(collections)}
        - Collection names: {collections}
        
        """
        
        # Show sample data from each collection
        for collection_name in collections[:5]:  # Limit to first 5 collections
            collection = db[collection_name]
            count = collection.count_documents({})
            sample_doc = collection.find_one()
            
            result += f"""
        Collection: {collection_name}
        - Document count: {count}
        - Sample document: {sample_doc}
        
            """
        
        return result
        
    except Exception as e:
        return f"MongoDB Debug Error: {str(e)}\n\nTraceback: {traceback.format_exc()}"

@app.route('/get_version', methods=['POST'])
def get_version():
    """Always return the latest version for replay playback"""
    print("GET_VERSION called")
    try:
        if os.path.exists(os.path.join('emulated_versions', LATEST_VERSION)):
            print(f"Returning {LATEST_VERSION}")
            return jsonify({'version': LATEST_VERSION})
        else:
            print(f"Returning fallback {FALLBACK_VERSION}")
            return jsonify({'version': FALLBACK_VERSION})
    except Exception as e:
        print(f"Get version error: {str(e)}")
        return jsonify({'version': FALLBACK_VERSION})

@app.route('/api/play_replay', methods=['POST'])
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

@app.route('/api/ads', methods=['GET'])
def get_ads():
    return jsonify(ADS_DATA)

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt')

@app.route('/google9f5a8a1f7c3e8e09.html')
def google_verification():
    return send_from_directory('static', 'google9f5a8a1f7c3e8e09.html')

@app.route('/api/folders', methods=['GET'])
def get_folders():
    return jsonify({"success": True, "message": "Folders are managed client-side"})

@app.route('/api/folders', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_folders():
    if request.method == 'GET':
        return jsonify({"success": True, "message": "Folders are managed client-side"})
    elif request.method == 'POST':
        return jsonify({"success": True, "message": "Folder creation is handled client-side"})
    elif request.method == 'PUT':
        return jsonify({"success": True, "message": "Folder rename is handled client-side"})
    elif request.method == 'DELETE':
        return jsonify({"success": True, "message": "Folder deletion is handled client-side"})

# ADVANCED ACCOUNT SYSTEM - NO SEPARATE USER_ACCOUNTS COLLECTION
@app.route('/api/create_account', methods=['POST'])
def create_account():
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

@app.route('/api/login', methods=['POST'])
def login():
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

# REAL-TIME SYNC SYSTEM
@app.route('/api/sync_data', methods=['POST'])
def sync_data():
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

@app.route('/api/get_user_data', methods=['POST'])
def get_user_data():
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

@app.route('/api/check_updates', methods=['POST'])
def check_updates():
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

@app.route('/api/track_play', methods=['POST'])
def track_play():
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

@app.route('/delete_test_user')
def delete_test_user():
    """Delete test user for testing"""
    try:
        test_username = "testuser123"
        user_collection = get_user_collection(test_username)
        if user_collection is None:
            return "Failed to get user collection"
        
        result = user_collection.delete_many({'username': test_username})
        return f"Deleted {result.deleted_count} documents for user {test_username}"
        
    except Exception as e:
        return f"Delete test user failed: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)