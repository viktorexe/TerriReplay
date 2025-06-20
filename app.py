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
        users_collection = get_db()
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
        
        # Create account
        user_data = {
            'username': username,
            'password': generate_password_hash(password),
            'folders': [],
            'replays': [],
            'created_at': datetime.utcnow()
        }
        
        users_collection.insert_one(user_data)
        return jsonify({'success': True, 'message': 'Account created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        users_collection = get_db()
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'})
        
        user = users_collection.find_one({'username': username})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        return jsonify({
            'success': True, 
            'message': 'Login successful',
            'user': {
                'username': user['username'],
                'folders': user.get('folders', []),
                'replays': user.get('replays', [])
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Database error'})

@app.route('/api/sync_data', methods=['POST'])
def sync_data():
    try:
        users_collection = get_db()
        data = request.get_json()
        username = data.get('username', '').strip()
        folders = data.get('folders', [])
        replays = data.get('replays', [])
        
        if not username:
            return jsonify({'success': False, 'message': 'Username required'})
        
        # Ensure all replay data is preserved
        result = users_collection.update_one(
            {'username': username},
            {'$set': {
                'folders': folders, 
                'replays': replays, 
                'last_sync': datetime.utcnow(),
                'total_replays': len(replays),
                'total_folders': len(folders)
            }}
        )
        
        if result.modified_count > 0:
            return jsonify({'success': True, 'message': f'Synced {len(replays)} replays and {len(folders)} folders'})
        else:
            return jsonify({'success': True, 'message': 'No changes to sync'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Sync failed'})

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