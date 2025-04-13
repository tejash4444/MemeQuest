from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

# Set your OpenRouter API key
OPENROUTER_API_KEY = "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"

app = Flask(__name__)
CORS(app)

# Refined Modes with more engaging descriptions
MODES = {
    "normal": "Respond in a friendly, casual tone as if chatting with a buddy. Keep it light and approachable, like having a good time with a friend.",
    "flirty": "Respond in a charming, witty, and playful tone with a hint of flirtation. Be clever but not over the top — think fun banter.",
    "therapic": "Respond in a calm, empathetic, and emotionally supportive tone, like a compassionate therapist or life coach. Prioritize emotional validation and encouragement.",
    "motivational": "Respond with confidence and energy, like a motivational speaker hyping the user up to take on the world. Inspire and uplift.",
    "existential": "Speak with deep, philosophical thoughts, posing thought-provoking questions in a poetic tone. Perfect for midnight musings.",
    "sarcastic": "Respond with dry, witty sarcasm. Keep it clever, and don't hold back on the playful jabs, but always in a fun way.",
}

# Refined Types with more clarity
# TYPES = {
#     "roast": "Craft a clever and humorous roast. Be witty and teasing, but never mean-spirited. Think of it like a friendly burn between close friends — light-hearted but funny.",
#     "compliment": "Give a heartfelt and genuine compliment that could brighten someone's day. Make it thoughtful and sincere, something that feels special.",
#     "joke": "Tell a light-hearted and funny joke that suits the mood. Keep it clever, punny, or quirky. Avoid offensive humor — the goal is to make the user smile.",
# }

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    input_text = data.get('input', '')
    mode = MODES.get(data.get('mode', 'normal'), MODES['normal'])
    task = TYPES.get(data.get('type', 'compliment'), TYPES['compliment'])

    # Handle activity commands before sending to OpenRouter
    if input_text == "!hunt":
        animals = ["a deer", "a rabbit", "a wild boar", "nothing at all"]
        result = random.choice(animals)
        return jsonify({"response": f"You went hunting and found {result}!"})

    elif input_text == "!fish":
        fishes = ["a big salmon", "a tiny goldfish", "an old boot", "nothing"]
        result = random.choice(fishes)
        return jsonify({"response": f"You went fishing and caught {result}!"})

    elif input_text == "!coin":
        result = random.choice(["Heads", "Tails"])
        return jsonify({"response": f"The coin landed on **{result}**."})

    elif input_text == "!dice":
        result = random.randint(1, 6)
        return jsonify({"response": f"You rolled a {result} 🎲."})

    elif input_text == "!blackjack":
        player = random.randint(16, 22)
        dealer = random.randint(16, 22)
        if player > 21:
            outcome = "You busted! Dealer wins."
        elif dealer > 21 or player > dealer:
            outcome = "You win!"
        elif dealer == player:
            outcome = "It's a tie!"
        else:
            outcome = "Dealer wins!"
        return jsonify({"response": f"You got {player}, dealer got {dealer}. {outcome}"})


    # Compose the prompt by combining the mode and task
    prompt = f"""
    {mode}

    {task}

    User: {input_text}

    Bot:
    """

    try:
        # Initialize OpenRouter API client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY
        )

        # Call the OpenRouter API with the formatted prompt
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",  # You can change this model to other available free ones
            messages=[
                {"role": "system", "content": "You are a chatbot that responds with roasts, compliments, jokes, or other moods based on user settings."},
                {"role": "user", "content": prompt}
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",  # Modify to your actual site URL
                "X-Title": "MoodBot"
            },
            max_tokens=100
        )

        # Extract the bot's reply and return it
        reply = response.choices[0].message.content.strip()
        return jsonify({"response": reply})

    except Exception as e:
        # Return error message if there's an issue with the API call
        return jsonify({"response": f"Error: {str(e)}"})

if __name__ == '__main__':
    app.run(debug=True)
