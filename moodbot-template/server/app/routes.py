from flask import Blueprint
from .chat import handle_chat
from .games import handle_game_command

main = Blueprint('main', __name__)

@main.route('/chat', methods=['POST'])
def chat():
    from flask import request, jsonify
    data = request.json
    input_text = data.get('input', '')
    
    if input_text.startswith("!"):
        return handle_game_command(data)  # handle !daily, !hunt, etc.
    else:
        return handle_chat(data)          # handle chat response
