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
        client = get_db()
        if client is None:
            return None
            
        # Each user gets their own collection in terristats database
        db = client.terristats
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', username.lower())
        
        return db[safe_name]
    except Exception as e:
        print(f"Error getting user collection: {str(e)}")
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
    return send_from_directory('emulated_versions', filename)

@app.route('/get_version', methods=['POST'])
def get_version():
    if os.path.exists(os.path.join('emulated_versions', LATEST_VERSION)):
        return jsonify({'version': LATEST_VERSION})
    else:
        return jsonify({'version': FALLBACK_VERSION})

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
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        local_folders = data.get('local_folders', [])
        local_replays = data.get('local_replays', [])
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'})
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
        
        # Get user's collection
        user_collection = get_user_collection(username)
        if user_collection is None:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        # Check if username exists by checking if collection has any data
        existing_user = user_collection.find_one({'username': username})
        if existing_user is not None:
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        # Create user account with all local data
        user_account_data = {
            'username': username,
            'password': password,  # Store without hashing for simplicity
            'folders': local_folders,  # Import all local folders
            'replays': local_replays,  # Import all local replays
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
        
        user_collection.insert_one(user_account_data)
        
        return jsonify({
            'success': True, 
            'message': 'Account created successfully',
            'synced_data': {
                'folders': local_folders,
                'replays': local_replays,
                'version': 1
            }
        })
    except Exception as e:
        print(f"Create account error: {str(e)}")
        print(traceback.format_exc())
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
        user_data = user_collection.find_one({'username': username})
        if user_data is None or user_data.get('password') != password:
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)