from flask import Flask, render_template, request, jsonify, send_from_directory, redirect
import os
import re
import json
import random
import string
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
# hello
app = Flask(__name__)

# MongoDB connection - optimized for serverless
MONGO_URI = "mongodb+srv://drviktorexe:Vansh240703@ttmod2025.9vmzbje.mongodb.net/?retryWrites=true&w=majority&appName=TTMod2025"

def get_db():
    """Get database connection - creates new connection for each request (serverless friendly)"""
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return client

def get_user_collection(username):
    """Get user-specific collection in terristats database"""
    client = get_db()
    db = client.terristats
    return db[f"user_{username.lower()}"]

def get_users_collection():
    """Get main users collection for authentication"""
    client = get_db()
    return client.terrireplay.user_accounts

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"  # Fallback if latest_version.html doesn't exist

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

# Sharing functionality removed

@app.route('/tos')
def tos():
    return render_template('tos.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/emulated_versions/<path:filename>')
def serve_game_version(filename):
    """Serve the game version files from the emulated_versions directory."""
    return send_from_directory('emulated_versions', filename)

@app.route('/get_version', methods=['POST'])
def get_version():
    """Always return the latest version if it exists, otherwise fallback."""
    if os.path.exists(os.path.join('emulated_versions', LATEST_VERSION)):
        return jsonify({'version': LATEST_VERSION})
    else:
        return jsonify({'version': FALLBACK_VERSION})

@app.route('/api/ads', methods=['GET'])
def get_ads():
    """Return advertisement data."""
    return jsonify(ADS_DATA)

@app.route('/sitemap.xml')
def sitemap():
    """Serve the sitemap.xml file for SEO."""
    return send_from_directory('static', 'sitemap.xml')

@app.route('/robots.txt')
def robots():
    """Serve the robots.txt file for search engines."""
    return send_from_directory('static', 'robots.txt')

@app.route('/google9f5a8a1f7c3e8e09.html')
def google_verification():
    """Serve the Google Search Console verification file."""
    return send_from_directory('static', 'google9f5a8a1f7c3e8e09.html')

@app.route('/api/folders', methods=['GET'])
def get_folders():
    """Return a placeholder for folders API - actual implementation is client-side."""
    return jsonify({"success": True, "message": "Folders are managed client-side"})

# API endpoints for folder management
@app.route('/api/folders', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_folders():
    """
    Handle folder operations:
    - GET: Get all folders
    - POST: Create a new folder
    - PUT: Rename a folder
    - DELETE: Delete a folder
    """
    if request.method == 'GET':
        # This is just a placeholder - folders will be managed client-side in localStorage
        return jsonify({"success": True, "message": "Folders are managed client-side"})
    elif request.method == 'POST':
        # For future server-side implementation
        return jsonify({"success": True, "message": "Folder creation is handled client-side"})
    elif request.method == 'PUT':
        # For future server-side implementation
        return jsonify({"success": True, "message": "Folder rename is handled client-side"})
    elif request.method == 'DELETE':
        # For future server-side implementation
        return jsonify({"success": True, "message": "Folder deletion is handled client-side"})

# Account API endpoints
@app.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        users_collection = get_users_collection()
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'})
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
        
        # Check if username exists
        if users_collection.find_one({'username': username}):
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        # Create account in main collection
        user_data = {
            'username': username,
            'password': generate_password_hash(password),
            'created_at': datetime.utcnow(),
            'last_sync': datetime.utcnow()
        }
        
        users_collection.insert_one(user_data)
        
        # Create user's personal collection with initial data
        user_collection = get_user_collection(username)
        initial_data = {
            'type': 'user_data',
            'folders': [],
            'replays': [],
            'last_modified': datetime.utcnow(),
            'version': 1
        }
        user_collection.insert_one(initial_data)
        
        return jsonify({'success': True, 'message': 'Account created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        users_collection = get_users_collection()
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        user = users_collection.find_one({'username': username})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        # Get user data from personal collection
        user_collection = get_user_collection(username)
        user_data = user_collection.find_one({'type': 'user_data'})
        
        if not user_data:
            # Create initial data if doesn't exist
            user_data = {
                'type': 'user_data',
                'folders': [],
                'replays': [],
                'last_modified': datetime.utcnow(),
                'version': 1
            }
            user_collection.insert_one(user_data)
        
        return jsonify({
            'success': True, 
            'message': 'Login successful',
            'user': {
                'username': username,
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'version': user_data.get('version', 1)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

@app.route('/api/sync_data', methods=['POST'])
def sync_data():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        folders = data.get('folders', [])
        replays = data.get('replays', [])
        client_version = data.get('version', 1)
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        user_collection = get_user_collection(username)
        current_data = user_collection.find_one({'type': 'user_data'})
        
        if not current_data:
            return jsonify({'success': False, 'message': 'User data not found'})
        
        server_version = current_data.get('version', 1)
        
        # Check if client data is outdated
        if client_version < server_version:
            return jsonify({
                'success': True,
                'outdated': True,
                'server_data': {
                    'folders': current_data.get('folders', []),
                    'replays': current_data.get('replays', []),
                    'version': server_version
                },
                'message': 'Client data is outdated, server data returned'
            })
        
        # Update with new version
        new_version = server_version + 1
        result = user_collection.update_one(
            {'type': 'user_data'},
            {'$set': {
                'folders': folders,
                'replays': replays,
                'last_modified': datetime.utcnow(),
                'version': new_version,
                'total_replays': len(replays),
                'total_folders': len(folders)
            }}
        )
        
        return jsonify({
            'success': True,
            'version': new_version,
            'message': f'Synced {len(replays)} replays and {len(folders)} folders'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Sync failed'})

@app.route('/api/get_user_data', methods=['POST'])
def get_user_data():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        client_version = data.get('version', 0)
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        user_collection = get_user_collection(username)
        user_data = user_collection.find_one({'type': 'user_data'})
        
        if not user_data:
            return jsonify({'success': False, 'message': 'User data not found'})
        
        server_version = user_data.get('version', 1)
        
        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'version': server_version
            },
            'has_updates': server_version > client_version
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

@app.route('/api/check_updates', methods=['POST'])
def check_updates():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        client_version = data.get('version', 0)
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        user_collection = get_user_collection(username)
        user_data = user_collection.find_one({'type': 'user_data'})
        
        if not user_data:
            return jsonify({'success': False, 'message': 'User data not found'})
        
        server_version = user_data.get('version', 1)
        has_updates = server_version > client_version
        
        response = {'success': True, 'has_updates': has_updates, 'server_version': server_version}
        
        if has_updates:
            response['data'] = {
                'folders': user_data.get('folders', []),
                'replays': user_data.get('replays', []),
                'version': server_version
            }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

def extract_replay_data(replay_link):
    """Extract the replay data from the URL."""
    if not replay_link or '?' not in replay_link:
        return ''
    
    try:
        # Get everything after the question mark
        query_part = replay_link.split('?', 1)[1]
        
        # Remove parameter names if present
        if 'replay=' in query_part:
            query_part = query_part.replace('replay=', '')
        elif 'data=' in query_part:
            query_part = query_part.replace('data=', '')
        
        return query_part
    except Exception:
        # If any error occurs, return empty string
        return ''

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)