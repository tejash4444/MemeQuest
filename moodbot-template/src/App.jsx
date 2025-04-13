import React, { useState } from "react";
import { motion } from "framer-motion";

const App = () => {
  const [selectedActivity, setSelectedActivity] = useState(
    "Welcome to MoodBot!"
  );
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [mode, setMode] = useState("normal");
  const [type, setType] = useState("compliment");

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
      setInput(command);
      setTimeout(() => {
        sendMessage();
      }, 100); // short delay to allow input update
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
        body: JSON.stringify({ input, mode, type }),
      });

      const data = await res.json();
      const botMessage = {
        sender: "bot",
        text: data.response || "No response",
      };
      setChatLog((prev) => [...prev, botMessage]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">MoodBot</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Games</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelection("Chat Games")}
              className="w-full px-3 py-2 text-left bg-blue-100 hover:bg-blue-200 rounded transition"
            >
              Chat Games
            </motion.button>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Activities</h3>
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
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col flex-1 p-6 overflow-hidden h-screen">
        <div className="text-xl font-semibold mb-4 text-blue-700">
          {selectedActivity}
        </div>
        {/* Dropdowns */}
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

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border rounded bg-white shadow focus:ring-2 focus:ring-blue-400"
          >
            <option value="compliment">Compliment</option>
            <option value="roast">Roast</option>
            <option value="joke">Joke</option>
          </select>
        </div>
        {/* Chat area */}
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
                  className={`inline-block break-words px-4 py-2 rounded-2xl shadow text-sm max-w-[80%] ${
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
          {/* Input */}
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
    </div>
  );
};

export default App;
