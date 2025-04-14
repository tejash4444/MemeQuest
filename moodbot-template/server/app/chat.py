from openai import OpenAI
from .config import OPENROUTER_API_KEY, MODES, TYPES

def handle_chat(data):
    from flask import jsonify

    input_text = data.get('input', '')
    mode = MODES.get(data.get('mode', 'normal'), MODES['normal'])
    task = TYPES.get(data.get('type', 'compliment'), TYPES['compliment'])
    coin_balance = int(data.get('coins', 100))

    prompt = f"""
    {mode}
    {task}
    User: {input_text}
    Bot:
    """

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY
        )

        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=[
                {"role": "system", "content": "You are a chatbot that responds with roasts, compliments, jokes, or other moods based on user settings."},
                {"role": "user", "content": prompt}
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "MoodBot"
            },
            max_tokens=100
        )

        reply = response.choices[0].message.content.strip()
        return jsonify({"response": reply, "new_balance": coin_balance})

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}", "new_balance": coin_balance})
