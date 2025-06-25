from datetime import datetime
import traceback

def test_account_creation(get_db, get_user_collection):
    """Test endpoint to create a test account"""
    try:
        test_username = "testuser123"
        test_password = "testpass123"
        test_folders = [{"id": "folder1", "name": "Test Folder", "color": "#4a6bff"}]
        test_replays = [{"id": "replay1", "name": "Test Replay", "link": "https://test.com"}]
        
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