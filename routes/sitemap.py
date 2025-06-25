from flask import send_from_directory

def sitemap():
    return send_from_directory('static', 'sitemap.xml')