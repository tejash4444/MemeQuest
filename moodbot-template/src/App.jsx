import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PrimaryButton = ({ text, onClick, icon, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${className}`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    {text}
  </motion.button>
);

const ChatBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
      isUser
        ? "bg-blue-600 text-white ml-auto"
        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
    }`}
  >
    {message}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const [selectedActivity, setSelectedActivity] = useState("Welcome to MoodBot!");
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [mode, setMode] = useState("normal");
  const [memeCash, setMemeCash] = useState(100);
  const [popup, setPopup] = useState("");
  const [dailyRewardCollected, setDailyRewardCollected] = useState(false);
  const [wager, setWager] = useState(0);
  const [result, setResult] = useState("");
  const [isMemeChat, setIsMemeChat] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode, coins: memeCash, wager }),
      });

      const data = await res.json();
      const botMessage = {
        sender: "bot",
        text: data.response || "No response",
      };
      setChatLog((prev) => [...prev, botMessage]);

      if (data.new_balance !== undefined) setMemeCash(data.new_balance);
      if (data.result) setResult(`You ${data.result} ${wager} Meme Cash!`);

      if (input === "!daily" && !dailyRewardCollected) {
        localStorage.setItem("lastDailyReward", new Date().toISOString());
        setPopup("🎁 Daily Meme Cash collected!");
        setDailyRewardCollected(true);
        setTimeout(() => setPopup(""), 3000);
      } else if (input === "!daily") {
        setPopup("🎁 You've already collected your daily Meme Cash today.");
        setTimeout(() => setPopup(""), 3000);
      }
    } catch (err) {
      setChatLog((prev) => [...prev, { sender: "bot", text: "Error connecting to server." }]);
    } finally {
      setIsLoading(false);
    }
    setInput("");
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900"}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-4 h-screen sticky top-0 shadow-lg transition-colors duration-300 ${darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white"}`}>
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-2xl font-bold mb-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
          MoodBot
        </motion.h2>

        <div className="space-y-6">
          <div>
            <h3 className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Activities</h3>
            <div className="space-y-2">
              <PrimaryButton text="Chat Games" onClick={() => handleSelection("Chat Games")} icon="💬" className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"}`} />
              <PrimaryButton text="Meme Chat" onClick={() => setIsMemeChat(true)} icon="😂" className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-purple-100 hover:bg-purple-200"}`} />
            </div>
          </div>

          <div>
            <h3 className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Games</h3>
            <div className="space-y-2">
              {[
                { text: "Hunting", icon: "🏹" },
                { text: "Fishing", icon: "🎣" },
                { text: "Coin Flip", icon: "🪙" },
                { text: "Dice Roll", icon: "🎲" },
                { text: "Blackjack", icon: "🃏" },
              ].map(({ text, icon }) => (
                <PrimaryButton key={text} text={text} icon={icon} onClick={() => handleSelection(text)} className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`} />
              ))}
              <PrimaryButton text="Daily Bonus" onClick={() => { setInput("!daily"); sendMessage(); }} icon="🎁" className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-green-100 hover:bg-green-200"}`} />
            </div>
          </div>

          <div>
            <h3 className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Others</h3>
            <div className="space-y-2">
              <PrimaryButton text="Items" onClick={() => handleSelection("Items")} icon="🎒" className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-indigo-100 hover:bg-indigo-200"}`} />
              <PrimaryButton text="Shop" onClick={() => handleSelection("Shop")} icon="🛒" className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-teal-100 hover:bg-teal-200"}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 p-6 overflow-hidden relative">
        {/* Fixed Header */}
        <div className={`absolute top-0 left-0 right-0 px-6 py-4 z-40 flex justify-between items-center shadow-md ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
            {selectedActivity}
          </motion.h1>

          {/* Meme Cash + Profile */}
          <div className="flex gap-4 items-center relative">
            <div className={`px-3 py-1 rounded-full flex items-center gap-1 shadow-sm text-sm ${darkMode ? "bg-gray-800 border border-yellow-500 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
              💸 {memeCash}
            </div>

            <div className="relative">
              <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                👤 Profile
              </button>
              {showProfileDropdown && (
                <div className={`absolute right-0 mt-2 w-60 rounded-lg shadow-lg p-4 z-50 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Chat Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white"
                      }`}
                    >
                      <option value="normal">Normal</option>
                      <option value="flirty">Flirty</option>
                      <option value="therapic">Therapic</option>
                      <option value="motivational">Motivational</option>
                      <option value="existential">Existential</option>
                      <option value="sarcastic">Sarcastic</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        <div className={`block w-10 h-6 rounded-full ${darkMode ? "bg-blue-600" : "bg-gray-400"}`} />
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? "translate-x-4" : ""}`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mb-4">
            <AnimatePresence>
              {chatLog.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <ChatBubble message={msg.text} isUser={msg.sender === "user"} />
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && <LoadingSpinner />}
            <div ref={endOfMessagesRef} />
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-3 rounded-lg text-center mb-4 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-200"}`}>
              <strong>{result}</strong>
            </motion.div>
          )}

          <motion.div layout className={`p-2 rounded-xl shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className={`flex-1 px-4 py-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 placeholder-gray-400" : "bg-gray-50 placeholder-gray-500"}`}
              />
              <PrimaryButton text="Send" onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none rounded-r-xl px-6" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full z-50 flex items-center gap-2 ${darkMode ? "bg-green-900 text-green-200 border border-green-700" : "bg-green-100 text-green-800"}`}>
            {popup}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
