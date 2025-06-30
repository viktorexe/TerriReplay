from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from pymongo import MongoClient
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
DISCORD_WEBHOOK = os.getenv('DISCORD_WEBHOOK')

mongo_client = None

def get_db():
    global mongo_client
    try:
        if mongo_client is None:
            mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        return mongo_client.terrireplay
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}")
        return None

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

@app.route('/')
def index():
    return render_template('index.html')

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

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt')

@app.route('/google9f5a8a1f7c3e8e09.html')
def google_verification():
    return send_from_directory('static', 'google9f5a8a1f7c3e8e09.html')

@app.route('/tos')
def terms_of_service():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Terms of Service - TerriReplay</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
            h1 { color: #4a6bff; }
            h2 { color: #333; margin-top: 30px; }
        </style>
    </head>
    <body>
        <h1>Terms of Service</h1>
        <p><strong>Last updated:</strong> June 2025</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By using TerriReplay, you agree to these Terms of Service.</p>
        
        <h2>2. Service Description</h2>
        <p>TerriReplay is a replay emulator for Territorial.io game replays.</p>
        
        <h2>3. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account.</p>
        
        <h2>4. Prohibited Uses</h2>
        <p>You may not use the service for any illegal or unauthorized purpose.</p>
        
        <h2>5. Limitation of Liability</h2>
        <p>TerriReplay is provided "as is" without warranties of any kind.</p>
        
        <h2>6. Contact</h2>
        <p>For questions about these Terms, contact us through our Discord server.</p>
        
        <p><em>Made by Viktor • © June 2025</em></p>
    </body>
    </html>
    '''

@app.route('/privacy')
def privacy_policy():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - TerriReplay</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
            h1 { color: #4a6bff; }
            h2 { color: #333; margin-top: 30px; }
        </style>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p><strong>Last updated:</strong> June 2025</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect usernames, passwords, and replay data you choose to save.</p>
        
        <h2>2. How We Use Information</h2>
        <p>Your information is used to provide the replay emulation service and save your replays.</p>
        
        <h2>3. Data Storage</h2>
        <p>Your data is stored securely in our MongoDB database.</p>
        
        <h2>4. Data Sharing</h2>
        <p>We do not share your personal information with third parties.</p>
        
        <h2>5. Cookies</h2>
        <p>We use local storage to remember your login status and saved replays.</p>
        
        <h2>6. Contact</h2>
        <p>For privacy questions, contact us through our Discord server.</p>
        
        <p><em>Made by Viktor • © June 2025</em></p>
    </body>
    </html>
    '''

@app.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        print(f"[ACCOUNT CREATION] Attempting to create account for: {username}")
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'})
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
        
        db = get_db()
        if db is None:
            print(f"[ACCOUNT CREATION] Database connection failed for {username}")
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        # Check if collection (username) already exists
        existing_collections = db.list_collection_names()
        print(f"[ACCOUNT CREATION] Existing collections: {existing_collections}")
        
        if username in existing_collections:
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        # Force create collection by inserting user data
        user_collection = db[username]
        user_data = {
            '_id': 'user_info',
            'type': 'user_info',
            'username': username,
            'password': password,
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'total_replays': 0,
            'total_folders': 0
        }
        
        # Force insert and verify
        insert_result = user_collection.insert_one(user_data)
        print(f"[ACCOUNT CREATION] User data inserted with ID: {insert_result.inserted_id}")
        
        # Verify collection was created
        updated_collections = db.list_collection_names()
        if username in updated_collections:
            print(f"[ACCOUNT CREATION] Collection '{username}' successfully created")
        else:
            print(f"[ACCOUNT CREATION] WARNING: Collection '{username}' not found after creation")
        
        # Create indexes for better performance
        user_collection.create_index([('type', 1)])
        user_collection.create_index([('id', 1)])
        print(f"[ACCOUNT CREATION] Indexes created for collection '{username}'")
        
        # Send Discord webhook
        send_discord_webhook(username)
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully',
            'username': username,
            'collection_created': username in updated_collections
        })
        
    except Exception as e:
        print(f"[ACCOUNT CREATION] Error for {username}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Account creation failed'})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        # Check if user collection exists
        if username not in db.list_collection_names():
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        user_collection = db[username]
        user_data = user_collection.find_one({'type': 'user_info', 'username': username})
        
        if not user_data or user_data.get('password') != password:
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        # Update last login
        user_collection.update_one(
            {'type': 'user_info', 'username': username},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        print(f"User {username} logged in successfully")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'username': username
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'})

def send_discord_webhook(username):
    try:
        if DISCORD_WEBHOOK:
            data = {
                'content': f'🎉 New user registered: **{username}**'
            }
            requests.post(DISCORD_WEBHOOK, json=data)
    except Exception as e:
        print(f"Discord webhook error: {str(e)}")

def send_backup_webhook(username, replays, folders):
    try:
        webhook_url = "https://discord.com/api/webhooks/1389178350165299312/bEOZ2HVpxbHps8toAndETgXqiybBW2wrQQEB4dd58OxmQZ7rL3m2bIfaQ3JjGyRsRfop"
        
        print(f"[WEBHOOK] Sending backup notification for {username}")
        
        replay_details = []
        for i, replay in enumerate(replays):
            if replay.get('link'):
                folder_name = "Root" if not replay.get('folder') else next((f['name'] for f in folders if f['id'] == replay['folder']), "Unknown")
                replay_details.append(f"• **{replay.get('name', f'Replay {i+1}')}** (Folder: {folder_name})")
        
        folder_details = [f"• **{folder.get('name', f'Folder {i+1}')}**" for i, folder in enumerate(folders)]
        
        # Get database verification
        db = get_db()
        db_stats = "N/A"
        if db is not None and username in db.list_collection_names():
            user_collection = db[username]
            db_replays = user_collection.count_documents({'type': 'replay'})
            db_folders = user_collection.count_documents({'type': 'folder'})
            db_stats = f"{db_replays} replays, {db_folders} folders in DB"
        
        embed = {
            "title": "🔄 AGGRESSIVE BACKUP COMPLETED",
            "color": 0x00ff00,
            "fields": [
                {
                    "name": "👤 User Collection",
                    "value": f"**{username}**",
                    "inline": True
                },
                {
                    "name": "📊 Sync Statistics",
                    "value": f"**{len(replays)}** replays synced\n**{len(folders)}** folders synced",
                    "inline": True
                },
                {
                    "name": "💾 Database Status",
                    "value": db_stats,
                    "inline": True
                },
                {
                    "name": "⏰ Backup Time",
                    "value": f"<t:{int(datetime.utcnow().timestamp())}:F>",
                    "inline": False
                }
            ],
            "footer": {
                "text": "TerriReplay AGGRESSIVE Backup System v2.0"
            }
        }
        
        if replay_details:
            embed["fields"].append({
                "name": "🎮 Successfully Backed Up Replays",
                "value": "\n".join(replay_details[:15]) + ("\n...and more" if len(replay_details) > 15 else ""),
                "inline": False
            })
        
        if folder_details:
            embed["fields"].append({
                "name": "📁 Successfully Backed Up Folders",
                "value": "\n".join(folder_details),
                "inline": False
            })
        
        data = {"embeds": [embed]}
        response = requests.post(webhook_url, json=data)
        print(f"[WEBHOOK] Backup webhook sent, status: {response.status_code}")
        
    except Exception as e:
        print(f"[WEBHOOK] Backup webhook error: {str(e)}")
        import traceback
        traceback.print_exc()

def send_replay_view_webhook(username, replay_name, replay_link):
    try:
        webhook_url = "https://discord.com/api/webhooks/1389201297961386045/NY8QdsqpNA0bR1hzyJXuZiFI7j9jVpVIIXcR8W-FvE0Xp3D1yNaKk4QSg_Ss6uJNawE1"
        
        embed = {
            "title": "🎮 Replay Viewed",
            "color": 0xff6b4a,
            "fields": [
                {
                    "name": "👤 User",
                    "value": f"**{username or 'Guest'}**",
                    "inline": True
                },
                {
                    "name": "🎮 Replay Name",
                    "value": f"**{replay_name}**",
                    "inline": True
                },
                {
                    "name": "⏰ Viewed At",
                    "value": f"<t:{int(datetime.utcnow().timestamp())}:F>",
                    "inline": True
                },
                {
                    "name": "🔗 Replay Link",
                    "value": f"```{replay_link[:100]}{'...' if len(replay_link) > 100 else ''}```",
                    "inline": False
                }
            ],
            "footer": {
                "text": "TerriReplay Activity Monitor"
            }
        }
        
        data = {"embeds": [embed]}
        requests.post(webhook_url, json=data)
    except Exception as e:
        print(f"Replay view webhook error: {str(e)}")

@app.route('/api/replay_viewed', methods=['POST'])
def replay_viewed():
    try:
        data = request.get_json()
        username = data.get('username')
        replay_name = data.get('replay_name', 'Territorial.io Replay')
        replay_link = data.get('replay_link', '')
        
        print(f"[REPLAY VIEW] User: {username or 'Guest'}, Replay: {replay_name}")
        
        # Send Discord webhook for replay view
        send_replay_view_webhook(username, replay_name, replay_link)
        
        # Aggressive auto-save replay if user is logged in
        if username and replay_link:
            db = get_db()
            if db is not None:
                collections = db.list_collection_names()
                print(f"[REPLAY VIEW] Available collections: {collections}")
                
                if username in collections:
                    user_collection = db[username]
                    
                    # Check if replay already exists
                    existing = user_collection.find_one({
                        'type': 'replay',
                        'link': replay_link
                    })
                    
                    if not existing:
                        replay_doc = {
                            'type': 'replay',
                            'id': f"auto_{int(datetime.utcnow().timestamp() * 1000)}",
                            'name': replay_name,
                            'link': replay_link,
                            'folder': '',
                            'created_at': datetime.utcnow().isoformat(),
                            'updated_at': datetime.utcnow(),
                            'auto_saved': True,
                            'view_timestamp': datetime.utcnow()
                        }
                        
                        try:
                            insert_result = user_collection.insert_one(replay_doc)
                            print(f"[REPLAY VIEW] Auto-saved replay for {username} with ID: {insert_result.inserted_id}")
                            
                            # Verify it was saved
                            verification = user_collection.find_one({'_id': insert_result.inserted_id})
                            if verification:
                                print(f"[REPLAY VIEW] Verification successful: Replay saved in database")
                            else:
                                print(f"[REPLAY VIEW] WARNING: Replay not found after insertion")
                                
                        except Exception as save_error:
                            print(f"[REPLAY VIEW] ERROR saving replay: {str(save_error)}")
                    else:
                        print(f"[REPLAY VIEW] Replay already exists for user {username}")
                else:
                    print(f"[REPLAY VIEW] Collection '{username}' not found")
            else:
                print(f"[REPLAY VIEW] Database connection failed")
        
        return jsonify({'success': True})
    except Exception as e:
        print(f"[REPLAY VIEW] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/sync_data', methods=['POST'])
def sync_data():
    try:
        data = request.get_json()
        username = data.get('username')
        replays = data.get('replays', [])
        folders = data.get('folders', [])
        
        print(f"[SYNC] Starting sync for user: {username}")
        print(f"[SYNC] Input data - Replays: {len(replays)}, Folders: {len(folders)}")
        
        if not username:
            print(f"[SYNC] ERROR: No username provided")
            return jsonify({'success': False, 'message': 'Username required'})
        
        db = get_db()
        if db is None:
            print(f"[SYNC] ERROR: Database connection failed")
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        # Verify collection exists
        collections = db.list_collection_names()
        print(f"[SYNC] Available collections: {collections}")
        
        if username not in collections:
            print(f"[SYNC] ERROR: Collection '{username}' not found")
            return jsonify({'success': False, 'message': f'User collection {username} not found'})
        
        user_collection = db[username]
        
        # Aggressive data clearing and insertion
        try:
            # Clear existing replay and folder data
            deleted_result = user_collection.delete_many({'type': {'$in': ['replay', 'folder']}})
            print(f"[SYNC] Deleted {deleted_result.deleted_count} existing items")
            
            # Force insert replays with validation
            replay_count = 0
            replay_insert_errors = []
            
            for i, replay in enumerate(replays):
                if not replay.get('link'):
                    print(f"[SYNC] Skipping replay {i}: No link provided")
                    continue
                    
                replay_doc = {
                    'type': 'replay',
                    'id': str(replay.get('id', f"replay_{int(datetime.utcnow().timestamp() * 1000)}_{i}")),
                    'name': str(replay.get('name', f'Replay {i+1}')),
                    'link': str(replay.get('link')),
                    'folder': str(replay.get('folder', '')),
                    'created_at': replay.get('created_at', datetime.utcnow().isoformat()),
                    'updated_at': datetime.utcnow(),
                    'sync_timestamp': datetime.utcnow()
                }
                
                try:
                    insert_result = user_collection.insert_one(replay_doc)
                    print(f"[SYNC] Inserted replay {i}: {replay_doc['name']} with ID {insert_result.inserted_id}")
                    replay_count += 1
                except Exception as replay_error:
                    error_msg = f"Failed to insert replay {i}: {str(replay_error)}"
                    print(f"[SYNC] ERROR: {error_msg}")
                    replay_insert_errors.append(error_msg)
            
            # Force insert folders with validation
            folder_count = 0
            folder_insert_errors = []
            
            for i, folder in enumerate(folders):
                if not folder.get('name'):
                    print(f"[SYNC] Skipping folder {i}: No name provided")
                    continue
                    
                folder_doc = {
                    'type': 'folder',
                    'id': str(folder.get('id', f"folder_{int(datetime.utcnow().timestamp() * 1000)}_{i}")),
                    'name': str(folder.get('name')),
                    'created_at': folder.get('created_at', datetime.utcnow().isoformat()),
                    'updated_at': datetime.utcnow(),
                    'sync_timestamp': datetime.utcnow()
                }
                
                try:
                    insert_result = user_collection.insert_one(folder_doc)
                    print(f"[SYNC] Inserted folder {i}: {folder_doc['name']} with ID {insert_result.inserted_id}")
                    folder_count += 1
                except Exception as folder_error:
                    error_msg = f"Failed to insert folder {i}: {str(folder_error)}"
                    print(f"[SYNC] ERROR: {error_msg}")
                    folder_insert_errors.append(error_msg)
            
            # Update user stats
            user_collection.update_one(
                {'_id': 'user_info'},
                {'$set': {
                    'total_replays': replay_count,
                    'total_folders': folder_count,
                    'last_sync': datetime.utcnow()
                }}
            )
            
            print(f"[SYNC] COMPLETED: {replay_count} replays, {folder_count} folders synced")
            
            # Verify data was actually saved
            verification_replays = user_collection.count_documents({'type': 'replay'})
            verification_folders = user_collection.count_documents({'type': 'folder'})
            print(f"[SYNC] VERIFICATION: {verification_replays} replays, {verification_folders} folders in database")
            
            # Send webhook with actual saved data
            if replay_count > 0 or folder_count > 0:
                send_backup_webhook(username, replays[:replay_count], folders[:folder_count])
                print(f"[SYNC] Webhook sent for {username}")
            
            return jsonify({
                'success': True, 
                'synced_replays': replay_count, 
                'synced_folders': folder_count,
                'verified_replays': verification_replays,
                'verified_folders': verification_folders,
                'replay_errors': replay_insert_errors,
                'folder_errors': folder_insert_errors
            })
            
        except Exception as sync_error:
            print(f"[SYNC] CRITICAL ERROR during sync: {str(sync_error)}")
            import traceback
            traceback.print_exc()
            return jsonify({'success': False, 'message': f'Sync failed: {str(sync_error)}'})
        
    except Exception as e:
        print(f"[SYNC] FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Fatal sync error: {str(e)}'})

@app.route('/api/debug_user', methods=['POST'])
def debug_user():
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        collections = db.list_collection_names()
        user_exists = username in collections
        
        debug_info = {
            'username': username,
            'collection_exists': user_exists,
            'all_collections': collections,
            'database_connected': True
        }
        
        if user_exists:
            user_collection = db[username]
            total_docs = user_collection.count_documents({})
            replays_count = user_collection.count_documents({'type': 'replay'})
            folders_count = user_collection.count_documents({'type': 'folder'})
            user_info = user_collection.find_one({'type': 'user_info'})
            
            # Get sample documents
            sample_replays = list(user_collection.find({'type': 'replay'}).limit(3))
            sample_folders = list(user_collection.find({'type': 'folder'}).limit(3))
            
            debug_info.update({
                'total_documents': total_docs,
                'replays_in_db': replays_count,
                'folders_in_db': folders_count,
                'user_info': user_info,
                'sample_replays': sample_replays,
                'sample_folders': sample_folders
            })
        
        print(f"[DEBUG] User debug info: {debug_info}")
        return jsonify({'success': True, 'debug_info': debug_info})
        
    except Exception as e:
        print(f"[DEBUG] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/force_sync', methods=['POST'])
def force_sync():
    try:
        data = request.get_json()
        username = data.get('username')
        test_replay = data.get('test_replay', {
            'id': f"test_{int(datetime.utcnow().timestamp() * 1000)}",
            'name': 'Test Replay - Force Sync',
            'link': 'https://territorial.io/?replay=test_data_12345',
            'folder': '',
            'created_at': datetime.utcnow().isoformat()
        })
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        if username not in db.list_collection_names():
            return jsonify({'success': False, 'message': f'Collection {username} does not exist'})
        
        user_collection = db[username]
        
        # Force insert test replay
        test_doc = {
            'type': 'replay',
            'id': test_replay['id'],
            'name': test_replay['name'],
            'link': test_replay['link'],
            'folder': test_replay.get('folder', ''),
            'created_at': test_replay['created_at'],
            'updated_at': datetime.utcnow(),
            'force_sync': True,
            'test_data': True
        }
        
        insert_result = user_collection.insert_one(test_doc)
        print(f"[FORCE SYNC] Inserted test replay with ID: {insert_result.inserted_id}")
        
        # Verify insertion
        verification = user_collection.find_one({'_id': insert_result.inserted_id})
        
        # Send webhook
        send_backup_webhook(username, [test_replay], [])
        
        return jsonify({
            'success': True,
            'inserted_id': str(insert_result.inserted_id),
            'verification': verification is not None,
            'test_replay': test_doc
        })
        
    except Exception as e:
        print(f"[FORCE SYNC] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/get_data', methods=['POST'])
def get_data():
    try:
        data = request.get_json()
        username = data.get('username')
        
        print(f"Getting data for user: {username}")
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        db = get_db()
        if db is None or username not in db.list_collection_names():
            print(f"No collection found for user: {username}")
            return jsonify({'success': True, 'replays': [], 'folders': []})
        
        user_collection = db[username]
        replays = list(user_collection.find({'type': 'replay'}, {'_id': 0}))
        folders = list(user_collection.find({'type': 'folder'}, {'_id': 0}))
        
        print(f"Found {len(replays)} replays and {len(folders)} folders in database")
        
        # Clean up the data
        clean_replays = []
        for replay in replays:
            if replay.get('link'):  # Only return replays with links
                clean_replays.append({
                    'id': replay.get('id'),
                    'name': replay.get('name'),
                    'link': replay.get('link'),
                    'folder': replay.get('folder', ''),
                    'created_at': replay.get('created_at')
                })
        
        clean_folders = []
        for folder in folders:
            clean_folders.append({
                'id': folder.get('id'),
                'name': folder.get('name'),
                'created_at': folder.get('created_at')
            })
        
        print(f"Returning {len(clean_replays)} replays and {len(clean_folders)} folders")
        
        return jsonify({
            'success': True,
            'replays': clean_replays,
            'folders': clean_folders
        })
    except Exception as e:
        print(f"Get data error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})

# Add CORS headers for better debugging
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)