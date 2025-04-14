from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import random
import datetime
import re

# Set your OpenRouter API key - Replace with your actual API key
OPENROUTER_API_KEY = "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"

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the Flask app
CORS(app)

# In-memory storage for user data (for demonstration purposes only - will be lost on server restart)
users = {
    "user1": {"coins": 100, "last_daily_reward": None, "blackjack": None}  # Initialize blackjack state to None
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
    # Get the current coin balance from the 'users' dictionary
    current_coins = users[user_id]["coins"]

    # ----------------- COIN-ACTIVITY HANDLING -----------------

    if input_text == "!daily":
        current_date = datetime.datetime.now().date()
        last_reward_date = users[user_id]["last_daily_reward"]
        if last_reward_date == current_date:
            return jsonify({
                "response": "You have already collected your daily reward today.",
                "new_balance": users[user_id]["coins"]
            })
        users[user_id]["coins"] += 50
        users[user_id]["last_daily_reward"] = current_date
        return jsonify({
            "response": "🎁 You have collected your daily reward of 50 coins!",
            "new_balance": users[user_id]["coins"]
        })

    elif input_text == "!hunt":
        hunt_cost = 15
        if users[user_id]["coins"] < hunt_cost:
            return jsonify({"response": f"You need {hunt_cost} coins to go on a proper hunt!", "new_balance": users[user_id]["coins"]})
        users[user_id]["coins"] -= hunt_cost
        hunting_events = [
            {"description": "You tracked a majestic deer through the forest. After a careful aim, you successfully bagged it!", "reward": 40},
            {"description": "While traversing a dense thicket, a nimble rabbit darted across your path. You managed to catch it!", "reward": 25},
            {"description": "You stumbled upon a family of wild boars! The chase was thrilling, and you managed to corner one.", "reward": 55},
            {"description": "You spent hours in the wilderness, following trails and listening for movement. Finally, you spotted a rare and elusive bird!", "reward": 70},
            {"description": "The forest was quiet today. You found some interesting tracks but the animals remained hidden.", "reward": 5},
            {"description": "You carefully set up a snare near a watering hole. Later, you returned to find a small but useful catch.", "reward": 30},
            {"description": "A mischievous squirrel ran right into your net! It wasn't much, but it's something.", "reward": 15},
            {"description": "The wind carried the scent of prey, leading you to a successful hunt in the open fields.", "reward": 45},
            {"description": "Despite your best efforts, the forest seemed empty. You return with nothing but stories of the chase.", "reward": 0},
            {"description": "You discovered a hidden grove and found a valuable wild herb along with a small animal.", "reward": 35},
        ]
        event = random.choice(hunting_events)
        reward = event["reward"]
        users[user_id]["coins"] += reward
        return jsonify({
            "response": f"You went on a hunt! {event['description']} You gained {reward} coins. (Cost: {hunt_cost} coins)",
            "result": "success" if reward > 0 else "nothing",
            "new_balance": users[user_id]["coins"]
        })

    elif input_text == "!fish":
        fishing_cost = 10
        if users[user_id]["coins"] < fishing_cost:
            return jsonify({"response": f"You need {fishing_cost} coins to cast your line!", "new_balance": users[user_id]["coins"]})
        users[user_id]["coins"] -= fishing_cost
        fishing_loot = [
            {"tier": "S", "name": "Giant Squid", "description": "A colossal creature of the deep!", "reward": 200, "rarity": 0.005},
            {"tier": "S", "name": "Megalodon Tooth", "description": "An ancient relic worth a fortune.", "reward": 150, "rarity": 0.01},
            {"tier": "A", "name": "Golden Dorado", "description": "A shimmering fish of legend.", "reward": 80, "rarity": 0.03},
            {"tier": "A", "name": "Ancient Marlin", "description": "A wise old fish with battle scars.", "reward": 70, "rarity": 0.05},
            {"tier": "B", "name": "Silver Salmon", "description": "A strong and healthy fish.", "reward": 45, "rarity": 0.10},
            {"tier": "B", "name": "Striped Bass", "description": "A popular and tasty catch.", "reward": 40, "rarity": 0.12},
            {"tier": "B", "name": "Mysterious Bottle", "description": "Contains a curious message...", "reward": 30, "rarity": 0.08},
            {"tier": "C", "name": "Common Carp", "description": "A typical river fish.", "reward": 20, "rarity": 0.20},
            {"tier": "C", "name": "Bluegill", "description": "A small but colorful fish.", "reward": 15, "rarity": 0.25},
            {"tier": "C", "name": "Waterlogged Boot", "description": "Smells... interesting.", "reward": 5, "rarity": 0.15},
            {"tier": "D", "name": "Empty Can", "description": "Looks like someone littered.", "reward": 0, "rarity": 0.0},
            {"tier": "D", "name": "Seaweed", "description": "Just some slimy greens.", "reward": 0, "rarity": 0.0},
            {"tier": "D", "name": "Old Tire", "description": "Heavy and useless.", "reward": 0, "rarity": 0.0},
            {"tier": "D", "name": "Nothing", "description": "Better luck next time!", "reward": 0, "rarity": 0.10}
        ]
        probabilities = [item["rarity"] for item in fishing_loot]
        caught_item = random.choices(fishing_loot, weights=probabilities, k=1)[0]
        reward = caught_item["reward"]
        users[user_id]["coins"] += reward
        return jsonify({
            "response": f"You cast your line and caught a **{caught_item['name']}**! {caught_item['description']} You gained {reward} coins. (Cost: {fishing_cost} coins)",
            "result": "success" if reward > 0 else "nothing",
            "tier": caught_item["tier"],
            "item": caught_item["name"],
            "new_balance": users[user_id]["coins"]
        })

    elif input_text.startswith("!coin"):
        parts = input_text.split()
        if len(parts) == 1:
            return jsonify({
                "response": "Ready to flip a coin with a wager? Use `!coin <heads|tails> <wager>` (e.g., `!coin heads 20`).",
                "new_balance": users[user_id]["coins"]
            })
        elif len(parts) == 3:
            prediction = parts[1].lower()
            try:
                wager = int(parts[2])
                if prediction not in ["heads", "tails"]:
                    return jsonify({
                        "response": "Invalid prediction. Choose either 'heads' or 'tails'.",
                        "new_balance": users[user_id]["coins"]
                    })
                if users[user_id]["coins"] < wager or wager <= 0:
                    return jsonify({
                        "response": "Invalid wager or insufficient coins!",
                        "new_balance": users[user_id]["coins"]
                    })

                users[user_id]["coins"] -= wager
                result = random.choice(["heads", "tails"])
                if prediction == result:
                    reward = wager * 2  # Winning doubles the wager
                    users[user_id]["coins"] += reward
                    return jsonify({
                        "response": f"The coin landed on **{result.capitalize()}**! You predicted **{prediction.capitalize()}** and won {reward} coins!",
                        "result": "win",
                        "wager": wager,
                        "prediction": prediction.capitalize(),
                        "landed_on": result.capitalize(),
                        "new_balance": users[user_id]["coins"]
                    })
                else:
                    return jsonify({
                        "response": f"The coin landed on **{result.capitalize()}**. You predicted **{prediction.capitalize()}** and lost {wager} coins.",
                        "result": "lose",
                        "wager": wager,
                        "prediction": prediction.capitalize(),
                        "landed_on": result.capitalize(),
                        "new_balance": users[user_id]["coins"]
                    })
            except ValueError:
                return jsonify({
                    "response": "Invalid wager. Please enter a number for the amount of coins.",
                    "new_balance": users[user_id]["coins"] + (wager if 'wager' in locals() else 0)
                })
        else:
            return jsonify({
                "response": "Invalid coin command. Use `!coin <heads|tails> <wager>` (e.g., `!coin heads 20`).",
                "new_balance": users[user_id]["coins"]
            })

    elif input_text.startswith("!dice"):
        parts = input_text.split()
        if len(parts) == 1:
            return jsonify({
                "response": "Alright, ready to roll the dice with a twist? Here's how the new wagering system works:\n\n"
                            "**Basic Command:** `!dice <prediction> <wager>`\n\n"
                            "**<prediction>**: This is how you tell me what you think the dice will roll. You have a few options:\n\n"
                            "1.  **Specific Number:** Bet on a number (1-6). Example: `!dice 3 100`\n"
                            "2.  **Greater Than:** Number followed immediately by `>`. Example: `!dice 4> 500` (rolls 5 or 6)\n"
                            "3.  **Less Than:** Number followed immediately by `<`. Example: `!dice 2< 250` (rolls 1)\n"
                            "4.  **Equal To:** Number followed immediately by `=`. Example: `!dice 5= 75` (rolls 5)\n"
                            "5.  **Greater Than or Equal To:** Number followed immediately by `>=`. Example: `!dice 3>= 300` (rolls 3, 4, 5, or 6)\n"
                            "6.  **Less Than or Equal To:** Number followed immediately by `<=`. Example: `!dice 4<= 400` (rolls 1, 2, 3, or 4)\n\n"
                            "**<wager>**: The number of coins to bet.\n\n"
                            "**Payouts:**\n"
                            "* Exact Number Match: **5x** wager\n"
                            "* Greater/Less Than (or equal to): **2x** wager\n\n"
                            "**Example:** `!dice 3> 200` (bets 200 coins that the roll will be 4, 5, or 6).\n\n"
                            "Ready to try your luck? Give it a shot!",
                "new_balance": users[user_id]["coins"]
            })
        elif len(parts) == 3:
            try:
                prediction_str = parts[1]
                wager = int(parts[2])
                if users[user_id]["coins"] < wager or wager <= 0:
                    return jsonify({"response": "Invalid wager or insufficient coins!", "new_balance": users[user_id]["coins"]})
                users[user_id]["coins"] -= wager
                roll = random.randint(1, 6)
                reward = 0
                result_text = "lose"
                match = re.match(r"(\d+)([><=]?)", prediction_str)
                if match:
                    target = int(match.group(1))
                    operator = match.group(2) or "="
                    if 1 <= target <= 6:
                        won = False
                        if operator == ">":
                            if roll > target:
                                won = True
                        elif operator == "<":
                            if roll < target:
                                won = True
                        elif operator == "=":
                            if roll == target:
                                won = True
                        elif operator == ">=":
                            if roll >= target:
                                won = True
                        elif operator == "<=":
                            if roll <= target:
                                won = True
                        if won:
                            if operator == "=":
                                reward = wager * 5
                            else:
                                reward = wager * 2
                            users[user_id]["coins"] += reward
                            result_text = "win"
                            return jsonify({
                                "response": f"You rolled a {roll}! Your bet '{prediction_str}' was correct. You won {reward} coins!",
                                "result": result_text,
                                "rolled": roll,
                                "bet": prediction_str,
                                "wager": wager,
                                "new_balance": users[user_id]["coins"]
                            })
                        else:
                            return jsonify({
                                "response": f"You rolled a {roll}. Your bet '{prediction_str}' was incorrect. You lost {wager} coins.",
                                "result": result_text,
                                "rolled": roll,
                                "bet": prediction_str,
                                "wager": wager,
                                "new_balance": users[user_id]["coins"]
                            })
                    else:
                        raise ValueError
                else:
                    raise ValueError
            except ValueError:
                return jsonify({"response": "Invalid dice command format. Use `!dice <number>[><=] <wager>` (no space between number and operator)", "new_balance": users[user_id]["coins"] + (wager if 'wager' in locals() else 0)})
        else:
            return jsonify({"response": "Invalid dice command format. Use `!dice <number>[><=] <wager>` (no space between number and operator)", "new_balance": users[user_id]["coins"]})

    elif input_text.startswith("!blackjack"):
        if users[user_id]["coins"] < 15:
            return jsonify({"response": "Not enough coins to play Blackjack!", "new_balance": users[user_id]["coins"]})
        user_data = users[user_id]
        command = input_text.split()[1] if len(input_text.split()) > 1 else "start"
        if command == "start":
            user_data["blackjack"] = {
                "player_cards": [random.randint(1, 11), random.randint(1, 11)],
                "dealer_cards": [random.randint(1, 11)],
                "coins_wagered": 15,
                "game_over": False
            }
            user_data["coins"] -= 15
            response_msg = (
                f"Blackjack started! You wagered 15 coins.\n"
                f"Your cards: {user_data['blackjack']['player_cards']} (Total: {sum(user_data['blackjack']['player_cards'])})\n"
                f"Dealer's card: {user_data['blackjack']['dealer_cards'][0]}\n"
                f"Type `!blackjack hit` to draw another card or `!blackjack stand` to end yourturn."
            )
            return jsonify({
                "response": response_msg,
                "new_balance": user_data["coins"],
                "game_state": "active"
            })
        elif command in ["hit", "stand"] and "blackjack" in user_data and user_data["blackjack"]:
            game = user_data["blackjack"]
            if game["game_over"]:
                return jsonify({"response": "This game is already over. Start a new one with `!blackjack`.", "new_balance": user_data["coins"]})
            if command == "hit":
                game["player_cards"].append(random.randint(1, 11))
                player_total = sum(game["player_cards"])
                if player_total > 21:
                    game["game_over"] = True
                    response_msg = (
                        f"You busted with {player_total}! Dealer wins.\n"
                        f"Your cards: {game['player_cards']}\n"
                        f"Final balance: {user_data['coins']} coins"
                    )
                    del user_data["blackjack"]
                    return jsonify({
                        "response": response_msg,
                        "new_balance": user_data["coins"],
                        "game_state": "lose"
                    })
                else:
                    response_msg = (
                        f"You drew a card. Your total: {player_total}\n"
                        f"Your cards: {game['player_cards']}\n"
                        f"Dealer's card: {game['dealer_cards'][0]}\n"
                        f"Type `!blackjack hit` or `!blackjack stand`"
                    )
                    return jsonify({
                        "response": response_msg,
                        "new_balance": user_data["coins"],
                        "game_state": "active"
                    })
            elif command == "stand":
                game["game_over"] = True
                while sum(game["dealer_cards"]) < 17:
                    game["dealer_cards"].append(random.randint(1, 11))
                player_total = sum(game["player_cards"])
                dealer_total = sum(game["dealer_cards"])
                if dealer_total > 21 or player_total > dealer_total:
                    reward = game["coins_wagered"] * 2
                    user_data["coins"] += reward
                    result = "win"
                    response_msg = f"You win! {player_total} vs {dealer_total}"
                elif dealer_total == player_total:
                    reward = game["coins_wagered"]
                    user_data["coins"] += reward
                    result = "tie"
                    response_msg = f"It's a tie! {player_total} vs {dealer_total}"
                else:
                    reward = 0
                    result = "lose"
                    response_msg = f"Dealer wins! {player_total} vs {dealer_total}"
                del user_data["blackjack"]
                return jsonify({
                    "response": f"{response_msg}\nYou {'win' if result == 'win' else 'tie' if result == 'tie' else 'lose'}! Final balance: {user_data['coins']} coins",
                    "new_balance": user_data["coins"],
                    "game_state": result
                })
        else:
            return jsonify({"response": "Invalid blackjack command. Use `!blackjack`, `!blackjack hit`, or `!blackjack stand`.", "new_balance": users[user_id]["coins"]})

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
        # Return the reply and the current coin balance from the 'users' dictionary
        return jsonify({
            "response": reply,
            "new_balance": users[user_id]["coins"]  # Always return the current balance
        })

    # Handle any exceptions that occur during the API call
    except Exception as e:
        return jsonify({
            "response": f"Error: {str(e)}",
            "new_balance": users[user_id]["coins"]
        })

# Run the Flask development server if the script is executed directly
if __name__ == '__main__':
    app.run(debug=True)
