from flask import send_from_directory

def google_verification():
    return send_from_directory('static', 'google9f5a8a1f7c3e8e09.html')