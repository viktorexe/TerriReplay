import os

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

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