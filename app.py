from flask import Flask
import os
import re
from pymongo import MongoClient
from datetime import datetime
import traceback

# Import all route functions
from routes.index import index
from routes.tos import tos
from routes.privacy import privacy
from routes.serve_game_version import serve_game_version
from routes.test_replay import test_replay
from routes.test_account_creation import test_account_creation
from routes.debug_mongodb import debug_mongodb
from routes.get_version import get_version
from routes.play_replay import play_replay
from routes.get_ads import get_ads
from routes.sitemap import sitemap
from routes.robots import robots
from routes.google_verification import google_verification
from routes.manage_folders import manage_folders
from routes.create_account import create_account
from routes.login import login
from routes.sync_data import sync_data
from routes.get_user_data import get_user_data
from routes.check_updates import check_updates
from routes.track_play import track_play
from routes.delete_test_user import delete_test_user

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



# Register all routes
@app.route('/')
def route_index():
    return index()

@app.route('/tos')
def route_tos():
    return tos()

@app.route('/privacy')
def route_privacy():
    return privacy()

@app.route('/emulated_versions/<path:filename>')
def route_serve_game_version(filename):
    return serve_game_version(filename)

@app.route('/test_replay')
def route_test_replay():
    return test_replay()

@app.route('/test_account_creation')
def route_test_account_creation():
    return test_account_creation(get_db, get_user_collection)

@app.route('/debug_mongodb')
def route_debug_mongodb():
    return debug_mongodb(get_db)

@app.route('/get_version', methods=['POST'])
def route_get_version():
    return get_version()

@app.route('/api/play_replay', methods=['POST'])
def route_play_replay():
    return play_replay()

@app.route('/api/ads', methods=['GET'])
def route_get_ads():
    return get_ads()

@app.route('/sitemap.xml')
def route_sitemap():
    return sitemap()

@app.route('/robots.txt')
def route_robots():
    return robots()

@app.route('/google9f5a8a1f7c3e8e09.html')
def route_google_verification():
    return google_verification()

@app.route('/api/folders', methods=['GET', 'POST', 'PUT', 'DELETE'])
def route_manage_folders():
    return manage_folders()

@app.route('/api/create_account', methods=['POST'])
def route_create_account():
    return create_account(get_db, get_user_collection)

@app.route('/api/login', methods=['POST'])
def route_login():
    return login(get_user_collection)

@app.route('/api/sync_data', methods=['POST'])
def route_sync_data():
    return sync_data(get_user_collection)

@app.route('/api/get_user_data', methods=['POST'])
def route_get_user_data():
    return get_user_data(get_user_collection)

@app.route('/api/check_updates', methods=['POST'])
def route_check_updates():
    return check_updates(get_user_collection)

@app.route('/api/track_play', methods=['POST'])
def route_track_play():
    return track_play(get_user_collection)

@app.route('/delete_test_user')
def route_delete_test_user():
    return delete_test_user(get_user_collection)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)