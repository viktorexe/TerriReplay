from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from pymongo import MongoClient
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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


LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game_versions/<path:filename>')
def serve_game_version(filename):
    """Serve game version files with proper headers"""
    print(f"SERVING GAME FILE: {filename}")
    try:
        file_path = os.path.join('game_versions', filename)
        if os.path.exists(file_path):
            print(f"File exists: {file_path}")
            return send_from_directory('game_versions', filename)
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

        emulated_dir = os.path.join(os.getcwd(), 'game_versions')
        if not os.path.exists(emulated_dir):
            return f"game_versions directory not found at: {emulated_dir}"
        

        files = os.listdir(emulated_dir)
        

        latest_exists = os.path.exists(os.path.join(emulated_dir, LATEST_VERSION))
        fallback_exists = os.path.exists(os.path.join(emulated_dir, FALLBACK_VERSION))
        
        return f"""
        Replay System Status:
        - game_versions directory: EXISTS
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
    """Smart version detection - scans all versions to find the best match"""
    print("GET_VERSION called with smart detection")
    try:
        data = request.get_json()
        replay_link = data.get('replay_link', '')
        
        if not replay_link:
            print("No replay link provided, using latest version")
            return jsonify({'version': LATEST_VERSION if os.path.exists(os.path.join('game_versions', LATEST_VERSION)) else FALLBACK_VERSION})
        

        replay_data = extract_replay_data(replay_link)
        print(f"Analyzing replay data: {replay_data[:50]}...")
        

        emulated_dir = os.path.join('game_versions')
        if not os.path.exists(emulated_dir):
            print("Emulated versions directory not found")
            return jsonify({'version': FALLBACK_VERSION})
        
        version_files = [f for f in os.listdir(emulated_dir) if f.endswith('.html')]
        print(f"Found {len(version_files)} version files: {version_files}")
        

        detected_version = detect_version_from_replay_data(replay_data, version_files)
        
        if detected_version and os.path.exists(os.path.join(emulated_dir, detected_version)):
            print(f"Smart detection: Using {detected_version} for this replay")
            return jsonify({'version': detected_version})
        else:
            print(f"Smart detection failed, using latest version")
            return jsonify({'version': LATEST_VERSION if os.path.exists(os.path.join('game_versions', LATEST_VERSION)) else FALLBACK_VERSION})
            
    except Exception as e:
        print(f"Get version error: {str(e)}")
        return jsonify({'version': FALLBACK_VERSION})

def detect_version_from_replay_data(replay_data, available_versions):
    """Detect the best game version based on replay data patterns"""
    if not replay_data:
        return None
    
    print(f"[VERSION DETECT] Analyzing replay data length: {len(replay_data)}")
    print(f"[VERSION DETECT] Sample data: {replay_data[:100]}...")
    

    if len(replay_data) > 800:

        if any(pattern in replay_data for pattern in ['TBcD', 'ZX7', 'BFr', 'GsZ', 'wgi', 'EUw', 'PLc', 'wDC', 'UIU']):
            print(f"[VERSION DETECT] Modern complex replay detected")
            candidates = ['latest_version.html', 'version3N.html', 'version37.html', 'version3F.html']
            for version in candidates:
                if version in available_versions:
                    return version
    
    version_rules = [
        {'pattern': lambda d: len(d) > 1200 and any(c.isupper() for c in d) and any(c.islower() for c in d) and any(c.isdigit() for c in d), 'versions': ['latest_version.html', 'version3N.html', 'version37.html']},
        
        {'pattern': lambda d: len(d) > 800 and d.count('V') > 10, 'versions': ['version3N.html', 'version37.html', 'version3F.html']},
        
        {'pattern': lambda d: 'V' in d and d.count('V') > 8, 'versions': ['latest_version.html', 'version3N.html', 'version-V.html', 'version0V.html', 'version1V.html']},
        {'pattern': lambda d: 'F' in d and d.count('F') > 5, 'versions': ['version3F.html', 'version2F.html', 'version1F.html', 'version0F.html', 'version-F.html']},
        {'pattern': lambda d: 'N' in d and d.count('N') > 5, 'versions': ['version3N.html', 'version2N.html', 'version1N.html', 'version0N.html']},
        
        {'pattern': lambda d: 400 <= len(d) < 800 and any(c in d for c in 'VFNcsk'), 'versions': ['version2N.html', 'version1N.html', 'version-V.html']},
        

        {'pattern': lambda d: 'c' in d and d.count('c') > 2, 'versions': ['version2c.html', 'version1c.html', 'version-c.html']},
        {'pattern': lambda d: 's' in d and d.count('s') > 3, 'versions': ['version2s.html', 'version1s.html', 'version0s.html', 'version-s.html']},
        {'pattern': lambda d: 'k' in d and d.count('k') > 2, 'versions': ['version0k.html', 'version-k.html']},
        

        {'pattern': lambda d: len(d) < 400 and d.count('-') > len(d) * 0.2, 'versions': ['version-7.html', 'version-6.html', 'version-5.html']},
        {'pattern': lambda d: len(d) < 200, 'versions': ['version-4.html', 'version-3.html', 'version-2.html']},
    ]
    

    for rule in version_rules:
        try:
            if rule['pattern'](replay_data):

                for version in rule['versions']:
                    if version in available_versions:
                        print(f"[VERSION DETECT] Pattern matched: {version} (data length: {len(replay_data)})")
                        return version
        except Exception as e:
            print(f"[VERSION DETECT] Error in pattern matching: {str(e)}")
            continue
    
    print(f"[VERSION DETECT] No specific pattern matched, using enhanced heuristic")
    

    data_len = len(replay_data)
    has_upper = any(c.isupper() for c in replay_data)
    has_lower = any(c.islower() for c in replay_data)
    has_digits = any(c.isdigit() for c in replay_data)
    
    if data_len > 1200 and has_upper and has_lower:
        candidates = ['latest_version.html', 'version3N.html', 'version37.html', 'version3F.html']
    elif data_len > 800:
        candidates = ['version3N.html', 'version37.html', 'version2N.html', 'version3-.html']
    elif data_len > 400:
        candidates = ['version2N.html', 'version1N.html', 'version-V.html', 'version2c.html']
    elif data_len > 200:
        candidates = ['version1N.html', 'version-7.html', 'version-6.html', 'version-5.html']
    else:
        candidates = ['version-4.html', 'version-3.html', 'version-2.html', 'version-1.html']
    

    for candidate in candidates:
        if candidate in available_versions:
            print(f"[VERSION DETECT] Enhanced heuristic selected: {candidate}")
            return candidate
    
    return None

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
        

        replay_data = extract_replay_data(replay_link)
        print(f"Extracted data: {replay_data[:50] if replay_data else 'None'}...")
        

        latest_path = os.path.join('game_versions', LATEST_VERSION)
        fallback_path = os.path.join('game_versions', FALLBACK_VERSION)
        
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
    if not replay_link or '?' not in replay_link:
        return ''
    
    try:
        query_part = replay_link.split('?', 1)[1]
        
        if 'replay=' in query_part:
            query_part = query_part.replace('replay=', '')
        elif 'data=' in query_part:
            query_part = query_part.replace('data=', '')
        
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
            h1 { color:
            h2 { color:
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
            h1 { color:
            h2 { color:
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
        

        existing_collections = db.list_collection_names()
        print(f"[ACCOUNT CREATION] Existing collections: {existing_collections}")
        
        if username in existing_collections:
            return jsonify({'success': False, 'message': 'Username already exists'})
        

        user_collection = db[username]
        

        user_data = {
            '_id': 'user_info',
            'type': 'user_info',
            'username': username,
            'password': password,
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'total_replays': 1,
            'total_folders': 1
        }
        

        sample_replay = {
            'type': 'replay',
            'id': f"welcome_{int(datetime.utcnow().timestamp() * 1000)}",
            'name': 'Welcome to TerriReplay!',
            'link': 'https://territorial.io/?replay=-8gi---7UV1-QTsD--0----V2PB6-1--5kN-1-3c-J-0g-53-TF0_-67-7--q-2Z-CK-1V-CV-kV2m-Bc-t-0--5s-RV0j----V--F------R---9B---JN--7iakV077-3-A2--V0HN-3-80--V0T7-3-Al--V077-3-9I--V0HN-3-80--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z4Y3-6s-7V-z-R3-6t--V-z1C3-6sGcV-z5A3-6t--V-r7-3-5s7kV-r133-5sqsV-r2O3-5sYVV-r4-3-5sO7V-r5p3-5sBNV-kJx3-51g7V-kIs3-519-V-kH33-51SkV-kJR3-51O7V-kK-3-51x-V-kLp3-4F8kV-e453-4FSkV-e283-4FCsV-e6c3-4FqcV-e1r3-4FV-V-e1a3-4FVcV-e3J3-4FV-V-e5c3-4FPVV-e4D3-4FNNV-e3R3-4F4kV-e-s3-4FVcV-e3E3-4F2sV-e0Y3-4Fe7V-e6h3-4FvVV-e4D3-4F-cV-e0-3-4FWsV-e2n3-4F6-V-e2a3-4FucV-e6I3-4FkVV-e4F3-4FV7V-e-s3-4F-cV-e4u3-4FS-V-e0-3-4FVsV-e0b3-4FJkV-e343-4F6-V-e0R3-4F4kV-e6O3-4F8NV-e373-4FZcV-e1h3-4F3cV-e593-4FjFV-e6L3-4FusV-e2n3-3at7V-Zos3-3aB-V-Zmr3-3alFV-Zpu3-3aukV-Znn3-3ayNV-Zpv3-3ajNV-Zl73-3a8-V-ZnE3-3ax7V-ZqB3-3alFV-Zlb3-3aX1V-Ol-08bH7-8Cpl-08gD7-8Bnl-08aT7-8C6l-08cz-cg1mFA4-dw19k7U-cw17F7M-Yw18k7O-WB11F78-VJ10F74-VJ10F74-VR1CF7h-WZ13F7I-VR10k74-VJ10F74-Wg1Dk7Q-WJ11k7K-VZ10F72-VZ13F7W-Vo13k7Q-WR10k7E-Vo1DF7G-Vw12F7K-VR13k7A-Vo11k7j-W317k7C-Vo13F78-Vw12k76-WB19k7b-VZ12k76-Vg11k7E-VR13F7K-Y312k78-VR13k7C-WR16F7A-WB16k76-VZ11k78-WZ12F7A-Vg15k76-Vo17F7K-VZ13F76-Vg11k7C-WB11k72-WZ11k7A-WJ12F76-Vg11k76-VR12k74-Vw13F7G-Vo12k7A-XB12k7E-WR12F7A-VR11k7A-VZ11F76-VR10F78-VJ12k7A-VZ11F76-W310F7I-VR11k74-VV',
            'folder': '',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow(),
            'welcome_replay': True
        }
        

        sample_folder = {
            'type': 'folder',
            'id': f"examples_{int(datetime.utcnow().timestamp() * 1000)}",
            'name': 'Example Replays',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow(),
            'welcome_folder': True
        }
        

        user_result = user_collection.insert_one(user_data)
        replay_result = user_collection.insert_one(sample_replay)
        folder_result = user_collection.insert_one(sample_folder)
        
        print(f"[ACCOUNT CREATION] User data inserted with ID: {user_result.inserted_id}")
        print(f"[ACCOUNT CREATION] Sample replay inserted with ID: {replay_result.inserted_id}")
        print(f"[ACCOUNT CREATION] Sample folder inserted with ID: {folder_result.inserted_id}")
        

        updated_collections = db.list_collection_names()
        if username in updated_collections:
            print(f"[ACCOUNT CREATION] Collection '{username}' successfully created")
        else:
            print(f"[ACCOUNT CREATION] WARNING: Collection '{username}' not found after creation")
        

        user_collection.create_index([('type', 1)])
        user_collection.create_index([('id', 1)])
        print(f"[ACCOUNT CREATION] Indexes created for collection '{username}'")
        

        send_discord_webhook(username)
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully with sample data',
            'username': username,
            'collection_created': username in updated_collections,
            'sample_data_added': True
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
        

        if username not in db.list_collection_names():
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        user_collection = db[username]
        user_data = user_collection.find_one({'type': 'user_info', 'username': username})
        
        if not user_data or user_data.get('password') != password:
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        

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

def send_replay_save_webhook(username, replay_name, replay_link):
    try:
        webhook_url = "https://discord.com/api/webhooks/1389201297961386045/NY8QdsqpNA0bR1hzyJXuZiFI7j9jVpVIIXcR8W-FvE0Xp3D1yNaKk4QSg_Ss6uJNawE1"
        
        embed = {
            "title": "💾 Replay Saved",
            "color": 0x4aff6b,
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
                    "name": "⏰ Saved At",
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
                "text": "TerriReplay Auto-Save System"
            }
        }
        
        data = {"embeds": [embed]}
        requests.post(webhook_url, json=data)
    except Exception as e:
        print(f"Replay save webhook error: {str(e)}")

@app.route('/api/action_webhook', methods=['POST'])
def action_webhook():
    """Handle all action webhooks"""
    try:
        data = request.get_json()
        action = data.get('action')
        username = data.get('username', 'Guest')
        
        webhook_url = "https://discord.com/api/webhooks/1389201297961386045/NY8QdsqpNA0bR1hzyJXuZiFI7j9jVpVIIXcR8W-FvE0Xp3D1yNaKk4QSg_Ss6uJNawE1"
        
        if action == 'replay_played':
            replay_name = data.get('replay_name', 'Unknown Replay')
            replay_link = data.get('replay_link', '')
            
            embed = {
                "title": "🎮 Replay Played",
                "color": 0xff6b4a,
                "fields": [
                    {"name": "👤 User", "value": f"**{username}**", "inline": True},
                    {"name": "🎮 Replay", "value": f"**{replay_name}**", "inline": True},
                    {"name": "⏰ Played At", "value": f"<t:{int(datetime.utcnow().timestamp())}:F>", "inline": True},
                    {"name": "🔗 Link", "value": f"```{replay_link[:100]}{'...' if len(replay_link) > 100 else ''}```", "inline": False}
                ],
                "footer": {"text": "TerriReplay Activity Monitor"}
            }
            
        elif action == 'folder_created':
            folder_name = data.get('folder_name', 'Unknown Folder')
            
            embed = {
                "title": "📁 Folder Created",
                "color": 0x4aff6b,
                "fields": [
                    {"name": "👤 User", "value": f"**{username}**", "inline": True},
                    {"name": "📁 Folder", "value": f"**{folder_name}**", "inline": True},
                    {"name": "⏰ Created At", "value": f"<t:{int(datetime.utcnow().timestamp())}:F>", "inline": True}
                ],
                "footer": {"text": "TerriReplay Folder Management"}
            }
            
        elif action == 'folder_renamed':
            old_name = data.get('old_name', 'Unknown')
            new_name = data.get('new_name', 'Unknown')
            
            embed = {
                "title": "✏️ Folder Renamed",
                "color": 0xffa500,
                "fields": [
                    {"name": "👤 User", "value": f"**{username}**", "inline": True},
                    {"name": "📁 Old Name", "value": f"**{old_name}**", "inline": True},
                    {"name": "📁 New Name", "value": f"**{new_name}**", "inline": True},
                    {"name": "⏰ Renamed At", "value": f"<t:{int(datetime.utcnow().timestamp())}:F>", "inline": False}
                ],
                "footer": {"text": "TerriReplay Folder Management"}
            }
            
        elif action == 'replay_renamed':
            old_name = data.get('old_name', 'Unknown')
            new_name = data.get('new_name', 'Unknown')
            
            embed = {
                "title": "✏️ Replay Renamed",
                "color": 0xffa500,
                "fields": [
                    {"name": "👤 User", "value": f"**{username}**", "inline": True},
                    {"name": "🎮 Old Name", "value": f"**{old_name}**", "inline": True},
                    {"name": "🎮 New Name", "value": f"**{new_name}**", "inline": True},
                    {"name": "⏰ Renamed At", "value": f"<t:{int(datetime.utcnow().timestamp())}:F>", "inline": False}
                ],
                "footer": {"text": "TerriReplay Replay Management"}
            }
        else:
            return jsonify({'success': False, 'message': 'Unknown action'})
        
        webhook_data = {"embeds": [embed]}
        requests.post(webhook_url, json=webhook_data)
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Action webhook error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/save_replay', methods=['POST'])
def save_replay():
    """Save replay to user's collection"""
    try:
        data = request.get_json()
        username = data.get('username')
        replay_name = data.get('replay_name', 'Replay')
        replay_link = data.get('replay_link', '')
        
        if not username or not replay_link:
            return jsonify({'success': False, 'message': 'Username and replay link required'})
        
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        if username not in db.list_collection_names():
            return jsonify({'success': False, 'message': 'User collection not found'})
        
        user_collection = db[username]
        
        existing = user_collection.find_one({
            'type': 'replay',
            'link': replay_link
        })
        
        if existing:
            print(f"[MANUAL SAVE] Replay already exists, updating name from '{existing.get('name')}' to '{replay_name}'")
            user_collection.update_one(
                {'_id': existing['_id']},
                {'$set': {
                    'name': replay_name,
                    'updated_at': datetime.utcnow(),
                    'manual_save': True
                }}
            )
            return jsonify({'success': True, 'message': 'Replay updated successfully', 'already_exists': True})
        
        replay_doc = {
            'type': 'replay',
            'id': f"manual_{int(datetime.utcnow().timestamp() * 1000)}",
            'name': replay_name,
            'link': replay_link,
            'folder': '',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow(),
            'manual_save': True
        }
        
        insert_result = user_collection.insert_one(replay_doc)
        print(f"[MANUAL SAVE] ✅ Saved replay for {username} with ID: {insert_result.inserted_id}")
        
        verification = user_collection.find_one({'_id': insert_result.inserted_id})
        if verification:
            print(f"[MANUAL SAVE] ✅ VERIFICATION SUCCESSFUL: Replay confirmed in database")
        else:
            print(f"[MANUAL SAVE] ❌ VERIFICATION FAILED: Replay not found after insertion")
        
        send_replay_save_webhook(username, replay_name, replay_link)
        
        return jsonify({'success': True, 'message': 'Replay saved successfully', 'verified': verification is not None})
        
    except Exception as e:
        print(f"Save replay error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/replay_viewed', methods=['POST'])
def replay_viewed():
    try:
        data = request.get_json()
        username = data.get('username')
        replay_name = data.get('replay_name', 'Territorial.io Replay')
        replay_link = data.get('replay_link', '')
        
        print(f"[REPLAY VIEW] User: {username or 'Guest'}, Replay: {replay_name}")
        
        send_replay_view_webhook(username, replay_name, replay_link)
        
        if username and replay_link:
            db = get_db()
            if db is not None:
                collections = db.list_collection_names()
                print(f"[REPLAY VIEW] Available collections: {collections}")
                
                if username in collections:
                    user_collection = db[username]
                    
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
                            print(f"[REPLAY VIEW] ✅ SUCCESSFULLY auto-saved replay for {username} with ID: {insert_result.inserted_id}")
                            
                            send_replay_save_webhook(username, replay_name, replay_link)
                            
                            verification_success = False
                            for attempt in range(3):
                                verification = user_collection.find_one({'_id': insert_result.inserted_id})
                                if verification:
                                    print(f"[REPLAY VIEW] ✅ VERIFICATION SUCCESS (attempt {attempt + 1}): Replay confirmed in database")
                                    verification_success = True
                                    break
                                else:
                                    print(f"[REPLAY VIEW] ⚠️ VERIFICATION FAILED (attempt {attempt + 1}): Retrying...")
                                    if attempt < 2:
                                        import time
                                        time.sleep(0.1)
                            
                            if not verification_success:
                                print(f"[REPLAY VIEW] ❌ CRITICAL: Replay verification failed after 3 attempts")
                                
                        except Exception as save_error:
                            print(f"[REPLAY VIEW] ❌ CRITICAL ERROR saving replay: {str(save_error)}")
                            import traceback
                            traceback.print_exc()
                    else:
                        print(f"[REPLAY VIEW] Replay already exists for user {username}")
                        try:
                            update_result = user_collection.update_one(
                                {'_id': existing['_id']},
                                {'$set': {
                                    'name': replay_name,
                                    'updated_at': datetime.utcnow(),
                                    'last_viewed': datetime.utcnow()
                                }}
                            )
                            print(f"[REPLAY VIEW] ✅ Updated existing replay: {update_result.modified_count} documents modified")
                        except Exception as update_error:
                            print(f"[REPLAY VIEW] ❌ Error updating existing replay: {str(update_error)}")
                else:
                    print(f"[REPLAY VIEW] ❌ CRITICAL: Collection '{username}' not found in database")
                    print(f"[REPLAY VIEW] Available collections: {collections}")
            else:
                print(f"[REPLAY VIEW] ❌ CRITICAL: Database connection failed")
        
        return jsonify({'success': True, 'message': 'Replay view logged and auto-saved'})
    except Exception as e:
        print(f"[REPLAY VIEW] ❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Fatal error: {str(e)}'})

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
   
        collections = db.list_collection_names()
        print(f"[SYNC] Available collections: {collections}")
        
        if username not in collections:
            print(f"[SYNC] ERROR: Collection '{username}' not found")
            return jsonify({'success': False, 'message': f'User collection {username} not found'})
        
        user_collection = db[username]

        try:

            deleted_result = user_collection.delete_many({'type': {'$in': ['replay', 'folder']}})
            print(f"[SYNC] Deleted {deleted_result.deleted_count} existing items")
 
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

            user_collection.update_one(
                {'_id': 'user_info'},
                {'$set': {
                    'total_replays': replay_count,
                    'total_folders': folder_count,
                    'last_sync': datetime.utcnow()
                }}
            )
            
            print(f"[SYNC] COMPLETED: {replay_count} replays, {folder_count} folders synced")

            verification_replays = user_collection.count_documents({'type': 'replay'})
            verification_folders = user_collection.count_documents({'type': 'folder'})
            print(f"[SYNC] VERIFICATION: {verification_replays} replays, {verification_folders} folders in database")
   
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
        
        verification = user_collection.find_one({'_id': insert_result.inserted_id})
        
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
        
        clean_replays = []
        for replay in replays:
            if replay.get('link'):
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

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)

# project by dr viktor