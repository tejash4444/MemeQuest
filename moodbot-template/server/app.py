from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import random
import datetime

# Set your OpenRouter API key - Replace with your actual API key
OPENROUTER_API_KEY = "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"

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the Flask app
CORS(app)

# In-memory storage for user data (for demonstration purposes only - will be lost on server restart)
users = {
    "user1": {"coins": 100, "last_daily_reward": None}  # Example user with initial coins and no daily reward collected yet
}

# Dictionary mapping mode names to their corresponding instructions for the chatbot
MODES = {
    "normal": "Respond in a friendly, casual tone as if chatting with a buddy. Keep it light and approachable, like having a good time with a friend.",
    "flirty": "Respond in a charming, witty, and playful tone with a hint of flirtation. Be clever but not over the top — think fun banter.",
    "therapic": "Respond in a calm, empathetic, and emotionally supportive tone, like a compassionate therapist or life coach. Prioritize emotional validation and encouragement.",
    "motivational": "Respond with confidence and energy, like a motivational speaker hyping the user up to take on the world. Inspire and uplift.",
    "existential": "Speak with deep, philosophical thoughts, posing thought-provoking questions in a poetic tone. Perfect for midnight musings.",
    "sarcastic": "Respond with dry, witty sarcasm. Keep it clever, and don't hold back on the playful jabs, but always in a fun way.",
}

# Dictionary mapping response types to their corresponding instructions for the chatbot
TYPES = {
    "roast": "Craft a clever and humorous roast. Be witty and teasing, but never mean-spirited. Think of it like a friendly burn between close friends — light-hearted but funny.",
    "compliment": "Give a heartfelt and genuine compliment that could brighten someone's day. Make it thoughtful and sincere, something that feels special.",
    "joke": "Tell a light-hearted and funny joke that suits the mood. Keep it clever, punny, or quirky. Avoid offensive humor — the goal is to make the user smile.",
}

# Define the chat endpoint that handles POST requests
@app.route('/chat', methods=['POST'])
def chat():
    # Get the JSON data from the request body
    data = request.json
    # Extract the user's input text, defaulting to an empty string if not provided
    input_text = data.get('input', '')
    # Get the selected mode for the chatbot's response, defaulting to 'normal' if not provided or invalid
    mode = MODES.get(data.get('mode', 'normal'), MODES['normal'])
    # Get the selected type of response, defaulting to 'compliment' if not provided or invalid
    task = TYPES.get(data.get('type', 'compliment'), TYPES['compliment'])
    # Hardcoded user ID for this simple example - in a real application, this would be dynamic
    user_id = "user1"
    # Get the current coin balance from the request, defaulting to 100 if not provided
    coin_balance = int(data.get('coins', 100))

    # ----------------- COIN-ACTIVITY HANDLING -----------------

    # Handle the "!daily" command for collecting daily rewards
    if input_text == "!daily":
        # Get the current date
        current_date = datetime.datetime.now().date()
        # Get the last daily reward collection date for the user
        last_reward_date = users[user_id]["last_daily_reward"]

        # Check if the daily reward has already been collected today
        if last_reward_date == current_date:
            return jsonify({
                "response": "You have already collected your daily reward today.",
                "new_balance": coin_balance
            })

        # Give the daily reward (50 coins in this example)
        users[user_id]["coins"] += 50
        # Update the last daily reward collection date
        users[user_id]["last_daily_reward"] = current_date
        return jsonify({
            "response": "🎁 You have collected your daily reward of 50 coins!",
            "new_balance": users[user_id]["coins"]
        })

    # Handle the "!hunt" command
    elif input_text == "!hunt":
        # Check if the user has enough coins to play (cost is 10 coins)
        if coin_balance < 10:
            return jsonify({"response": "Not enough coins to hunt!", "new_balance": coin_balance})
        # List of possible hunting outcomes
        animals = ["a deer", "a rabbit", "a wild boar", "nothing at all"]
        # Randomly choose an outcome
        result = random.choice(animals)
        # Determine the reward based on the outcome
        reward = 0 if result == "nothing at all" else 20
        # Calculate the new coin balance
        new_balance = coin_balance - 10 + reward
        return jsonify({
            "response": f"You went hunting and found {result}! You wagered 10 coins.",
            "result": "win" if reward > 0 else "lose",
            "new_balance": new_balance
        })

    # Handle the "!fish" command
    elif input_text == "!fish":
        # Check if the user has enough coins to play (cost is 10 coins)
        if coin_balance < 10:
            return jsonify({"response": "Not enough coins to fish!", "new_balance": coin_balance})
        # List of possible fishing outcomes
        fishes = ["a big salmon", "a tiny goldfish", "an old boot", "nothing"]
        # Randomly choose an outcome
        result = random.choice(fishes)
        # Determine the reward based on the outcome
        reward = 0 if result in ["an old boot", "nothing"] else 15
        # Calculate the new coin balance
        new_balance = coin_balance - 10 + reward
        return jsonify({
            "response": f"You went fishing and caught {result}! You wagered 10 coins.",
            "result": "win" if reward > 0 else "lose",
            "new_balance": new_balance
        })

    # Handle the "!coin" command (coin flip game)
    elif input_text == "!coin":
        # Check if the user has enough coins to play (cost is 5 coins)
        if coin_balance < 5:
            return jsonify({"response": "Not enough coins to flip the coin!", "new_balance": coin_balance})
        # Randomly choose heads or tails
        result = random.choice(["Heads", "Tails"])
        # Determine the reward (win 10 coins if heads)
        reward = 10 if result == "Heads" else 0
        # Calculate the new coin balance
        new_balance = coin_balance - 5 + reward
        return jsonify({
            "response": f"The coin landed on **{result}**. You wagered 5 coins.",
            "result": "win" if reward > 0 else "lose",
            "new_balance": new_balance
        })

    # Handle the "!dice" command (dice roll game)
    elif input_text == "!dice":
        # Check if the user has enough coins to play (cost is 5 coins)
        if coin_balance < 5:
            return jsonify({"response": "Not enough coins to roll!", "new_balance": coin_balance})
        # Roll a random number between 1 and 6
        result = random.randint(1, 6)
        # Determine the reward (win 10 coins if the result is 6)
        reward = 10 if result == 6 else 0
        # Calculate the new coin balance
        new_balance = coin_balance - 5 + reward
        return jsonify({
            "response": f"You rolled a {result} 🎲. You wagered 5 coins.",
            "result": "win" if reward > 0 else "lose",
            "new_balance": new_balance
        })

    # Handle the "!blackjack" command
    elif input_text == "!blackjack":
        # Check if the user has enough coins to play (cost is 15 coins)
        if coin_balance < 15:
            return jsonify({"response": "Not enough coins to play Blackjack!", "new_balance": coin_balance})
        # Simulate player and dealer hands (simple random values for demonstration)
        player = random.randint(16, 22)
        dealer = random.randint(16, 22)
        # Determine the outcome and reward
        if player > 21:
            outcome = "You busted! Dealer wins."
            reward = 0
        elif dealer > 21 or player > dealer:
            outcome = "You win!"
            reward = 30
        elif dealer == player:
            outcome = "It's a tie!"
            reward = 15
        else:
            outcome = "Dealer wins!"
            reward = 0
        # Calculate the new coin balance
        new_balance = coin_balance - 15 + reward
        return jsonify({
            "response": f"You got {player}, dealer got {dealer}. {outcome} You wagered 15 coins.",
            "result": "win" if reward > 0 else "lose",
            "new_balance": new_balance
        })

    # ----------------- DEFAULT CHATBOT RESPONSE -----------------

    # Construct the prompt for the OpenAI model using the selected mode, task, and user input
    prompt = f"""
    {mode}

    {task}

    User: {input_text}

    Bot:
    """

    try:
        # Initialize the OpenAI client with the OpenRouter API base URL and API key
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY
        )

        # Create a chat completion using the OpenAI API
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",  # Specify the model to use
            messages=[
                {"role": "system", "content": "You are a chatbot that responds with roasts, compliments, jokes, or other moods based on user settings."},
                {"role": "user", "content": prompt}
            ],
            # Add custom headers for OpenRouter attribution
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",  # Replace with your actual frontend URL
                "X-Title": "MoodBot"  # Replace with the name of your application
            },
            max_tokens=100  # Limit the response length
        )

        # Extract the generated reply from the OpenAI response
        reply = response.choices[0].message.content.strip()
        # Return the reply and the unchanged coin balance as a JSON response
        return jsonify({
            "response": reply,
            "new_balance": coin_balance  # Coin balance remains unchanged for normal chat
        })

    # Handle any exceptions that occur during the API call
    except Exception as e:
        return jsonify({
            "response": f"Error: {str(e)}",
            "new_balance": coin_balance
        })

# Run the Flask development server if the script is executed directly
if __name__ == '__main__':
    app.run(debug=True)