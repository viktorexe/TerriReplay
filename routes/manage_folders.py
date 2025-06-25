from flask import request, jsonify

def manage_folders():
    if request.method == 'GET':
        return jsonify({"success": True, "message": "Folders are managed client-side"})
    elif request.method == 'POST':
        return jsonify({"success": True, "message": "Folder creation is handled client-side"})
    elif request.method == 'PUT':
        return jsonify({"success": True, "message": "Folder rename is handled client-side"})
    elif request.method == 'DELETE':
        return jsonify({"success": True, "message": "Folder deletion is handled client-side"})