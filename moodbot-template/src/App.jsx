import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const App = () => {
  const [selectedActivity, setSelectedActivity] = useState("Welcome to MoodBot!");
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [mode, setMode] = useState("normal");
  const [memeCurrency, setMemeCurrency] = useState(100);
  const [popup, setPopup] = useState("");
  const [dailyRewardCollected, setDailyRewardCollected] = useState(false);
  const [wager, setWager] = useState(0);
  const [result, setResult] = useState("");
  const [isMemeChat, setIsMemeChat] = useState(false);  // New state for Meme chat

  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const lastCollection = localStorage.getItem("lastDailyReward");
    if (lastCollection) {
      const lastDate = new Date(lastCollection);
      const currentDate = new Date();
      if (
        lastDate.getDate() === currentDate.getDate() &&
        lastDate.getMonth() === currentDate.getMonth() &&
        lastDate.getFullYear() === currentDate.getFullYear()
      ) {
        setDailyRewardCollected(true);
      }
    }
  }, []);

  const handleSelection = (text) => {
    setSelectedActivity(text);
    const commandMap = {
      Hunting: "!hunt",
      Fishing: "!fish",
      "Coin Flip": "!coin",
      "Dice Roll": "!dice",
      Blackjack: "!blackjack",
    };
    const command = commandMap[text];
    if (command) {
      setWager(10);
      setInput(command);
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setChatLog((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode, coins: memeCurrency, wager }),
      });

      const data = await res.json();
      const botMessage = {
        sender: "bot",
        text: data.response || "No response",
      };
      setChatLog((prev) => [...prev, botMessage]);

      if (data.new_balance !== undefined) {
        setMemeCurrency(data.new_balance);
      }

      if (data.result) {
        setResult(`You ${data.result} ${wager} Meme Currency!`);
      }

      if (input === "!daily" && !dailyRewardCollected) {
        localStorage.setItem("lastDailyReward", new Date().toISOString());
        setPopup("🎁 Daily Meme Currency collected!");
        setDailyRewardCollected(true);
        setTimeout(() => setPopup(""), 3000);
      } else if (input === "!daily") {
        setPopup("🎁 You've already collected your daily Meme Currency today.");
        setTimeout(() => setPopup(""), 3000);
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    }

    setInput("");
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 font-sans relative">
      {/* Meme Currency Balance */}
      <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded shadow-md z-30">
        🪙 Meme Currency: {memeCurrency}
      </div>

      {/* Profile Section on Top Right */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md flex items-center space-x-2 z-30">
        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
          U
        </div>
        <div className="text-sm font-semibold text-gray-700">UserName</div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-30">
          {popup}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">MoodBot</h2>
        <div className="space-y-4">
          {/* Activities Section moved to Games */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Activities</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelection("Chat Games")}
              className="w-full px-3 py-2 text-left bg-blue-100 hover:bg-blue-200 rounded transition"
            >
              Chat Games
            </motion.button>
          </div>

          {/* Meme Button added */}
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMemeChat(true)}
              className="w-full px-3 py-2 text-left bg-purple-100 hover:bg-purple-200 rounded transition"
            >
              Meme Chat
            </motion.button>
          </div>

          {/* Games Section moved to Activities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Games</h3>
            {["Hunting", "Fishing", "Coin Flip", "Dice Roll", "Blackjack"].map(
              (act) => (
                <motion.button
                  key={act}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelection(act)}
                  className="w-full px-3 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  {act}
                </motion.button>
              )
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput("!daily");
                sendMessage();
              }}
              className="w-full mt-2 px-3 py-2 text-left bg-green-100 hover:bg-green-200 rounded transition"
            >
              🎁 Daily Bonus
            </motion.button>
          </div>

          {/* Others Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Others</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelection("Items")}
              className="w-full px-3 py-2 text-left bg-indigo-100 hover:bg-indigo-200 rounded transition"
            >
              Items
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelection("Shop")}
              className="w-full px-3 py-2 text-left bg-teal-100 hover:bg-teal-200 rounded transition"
            >
              Shop
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Chat Section */}
      <main className="flex flex-col flex-1 p-6 overflow-hidden h-screen">
        <div className="text-xl font-semibold mb-4 text-blue-700">
          {selectedActivity}
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-3 py-2 border rounded bg-white shadow focus:ring-2 focus:ring-blue-400"
          >
            <option value="normal">Normal</option>
            <option value="flirty">Flirty</option>
            <option value="therapic">Therapic</option>
            <option value="motivational">Motivational</option>
            <option value="existential">Existential</option>
            <option value="sarcastic">Sarcastic</option>
          </select>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden bg-transparent">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`inline-block break-words px-6 py-4 rounded-2xl shadow-lg max-w-[85%] text-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {result && (
            <div className="mt-2 bg-gray-100 text-center p-2 rounded-md">
              <strong>{result}</strong>
            </div>
          )}

          <div className="mt-4 bg-white z-20 flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
            >
              Send
            </motion.button>
          </div>
        </div>
      </main>

      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default App;
