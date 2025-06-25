from flask import send_from_directory
import os

def serve_game_version(filename):
    """Serve game version files with proper headers"""
    print(f"SERVING GAME FILE: {filename}")
    try:
        file_path = os.path.join('emulated_versions', filename)
        if os.path.exists(file_path):
            print(f"File exists: {file_path}")
            return send_from_directory('emulated_versions', filename)
        else:
            print(f"File NOT found: {file_path}")
            return f"Game file not found: {filename}", 404
    except Exception as e:
        print(f"Error serving game file {filename}: {str(e)}")
        return f"Error loading game file: {filename}", 500