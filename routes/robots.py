from flask import send_from_directory

def robots():
    return send_from_directory('static', 'robots.txt')