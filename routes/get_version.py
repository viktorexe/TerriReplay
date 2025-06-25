from flask import request, jsonify
import os

# Always use latest_version.html if it exists
LATEST_VERSION = "latest_version.html"
FALLBACK_VERSION = "version3N.html"

def get_version():
    """Always return the latest version for replay playback"""
    print("GET_VERSION called from route file")
    try:
        latest_path = os.path.join('emulated_versions', LATEST_VERSION)
        fallback_path = os.path.join('emulated_versions', FALLBACK_VERSION)
        
        print(f"Checking for latest version at: {latest_path}")
        print(f"Latest version exists: {os.path.exists(latest_path)}")
        print(f"Checking for fallback version at: {fallback_path}")
        print(f"Fallback version exists: {os.path.exists(fallback_path)}")
        
        if os.path.exists(latest_path):
            print(f"Returning {LATEST_VERSION}")
            return jsonify({'version': LATEST_VERSION})
        else:
            print(f"Returning fallback {FALLBACK_VERSION}")
            return jsonify({'version': FALLBACK_VERSION})
    except Exception as e:
        print(f"Get version error: {str(e)}")
        return jsonify({'version': FALLBACK_VERSION})