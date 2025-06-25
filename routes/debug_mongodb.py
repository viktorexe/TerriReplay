import traceback

def debug_mongodb(get_db):
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