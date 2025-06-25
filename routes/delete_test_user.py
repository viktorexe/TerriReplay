def delete_test_user(get_user_collection):
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