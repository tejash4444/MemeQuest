import datetime
import random
from flask import jsonify
from .users import users

def handle_game_command(data):
    user_id = "user1"
    input_text = data.get("input", "")
    coin_balance = int(data.get("coins", 100))

    if input_text == "!daily":
        today = datetime.datetime.now().date()
        last = users[user_id].get("last_daily_reward")
        if last == today:
            return jsonify({"response": "You already claimed your daily reward.", "new_balance": coin_balance})
        users[user_id]["coins"] += 50
        users[user_id]["last_daily_reward"] = today
        return jsonify({"response": "🎁 50 coins collected!", "new_balance": users[user_id]["coins"]})

    elif input_text == "!hunt":
        if coin_balance < 10:
            return jsonify({"response": "Not enough coins to hunt!", "new_balance": coin_balance})
        result = random.choice(["a deer", "a rabbit", "a wild boar", "nothing at all"])
        reward = 20 if result != "nothing at all" else 0
        new_balance = coin_balance - 10 + reward
        return jsonify({"response": f"You found {result}! You wagered 10 coins.", "new_balance": new_balance})

    # Add more games like !fish, !coin, !blackjack here...

    return jsonify({"response": "Invalid command.", "new_balance": coin_balance})
