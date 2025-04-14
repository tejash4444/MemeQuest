import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PrimaryButton = ({ text, onClick, icon, className = "", isActive = false }) => (
  <motion.button
    whileHover={{ scale: 1.03, backgroundColor: isActive ? "" : "#f0f4ff" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all text-sm font-medium ${className} ${
      isActive ? "bg-blue-100 text-blue-600 border border-blue-200" : "hover:bg-gray-50"
    }`}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    {icon && <span className="text-lg">{icon}</span>}
    {text}
  </motion.button>
);

const ChatBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
      isUser
        ? "bg-blue-600 text-white ml-auto mr-0"
        : "bg-white text-gray-800 border border-gray-100"
    }`}
  >
    {message}
  </motion.div>
);

const LoadingSpinner = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-center py-4"
  >
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </motion.div>
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
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800"}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-4 h-screen sticky top-0 ${darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-100 shadow-sm"}`}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`text-2xl font-bold mb-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
        >
          MoodBot
        </motion.h2>

        <div className="space-y-6">
          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Activities
            </motion.h3>
            <div className="space-y-1.5">
              <PrimaryButton 
                text="Chat Games" 
                onClick={() => handleSelection("Chat Games")} 
                icon="💬" 
                isActive={selectedActivity === "Chat Games"}
                className={`${darkMode ? "hover:bg-gray-700" : ""}`} 
              />
              <PrimaryButton 
                text="Meme Chat" 
                onClick={() => setIsMemeChat(true)} 
                icon="😂" 
                isActive={isMemeChat}
                className={`${darkMode ? "hover:bg-gray-700" : ""}`} 
              />
            </div>
          </div>

          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Games
            </motion.h3>
            <div className="space-y-1.5">
              {[
                { text: "Hunting", icon: "🏹" },
                { text: "Fishing", icon: "🎣" },
                { text: "Coin Flip", icon: "🪙" },
                { text: "Dice Roll", icon: "🎲" },
                { text: "Blackjack", icon: "🃏" },
              ].map(({ text, icon }) => (
                <PrimaryButton 
                  key={text} 
                  text={text} 
                  icon={icon} 
                  onClick={() => handleSelection(text)} 
                  isActive={selectedActivity === text}
                  className={`${darkMode ? "hover:bg-gray-700" : ""}`} 
                />
              ))}
              <PrimaryButton 
                text="Daily Bonus" 
                onClick={() => { setInput("!daily"); sendMessage(); }} 
                icon="🎁" 
                className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-green-50"}`} 
              />
            </div>
          </div>

          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Others
            </motion.h3>
            <div className="space-y-1.5">
              <PrimaryButton 
                text="Items" 
                onClick={() => handleSelection("Items")} 
                icon="🎒" 
                isActive={selectedActivity === "Items"}
                className={`${darkMode ? "hover:bg-gray-700" : ""}`} 
              />
              <PrimaryButton 
                text="Shop" 
                onClick={() => handleSelection("Shop")} 
                icon="🛒" 
                isActive={selectedActivity === "Shop"}
                className={`${darkMode ? "hover:bg-gray-700" : ""}`} 
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-24 p-6 overflow-hidden relative ml-64">
        {/* Fixed Header */}
        <div className={`fixed top-0 left-64 right-0 px-6 py-4 z-40 flex justify-between items-center shadow-sm ${darkMode ? "bg-gray-900" : "bg-white border-b border-gray-100"}`}>
          <motion.h1 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            {selectedActivity}
          </motion.h1>

          <div className="flex gap-4 items-center relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm text-sm font-medium ${darkMode ? "bg-gray-800 border border-yellow-500 text-yellow-400" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}
            >
              💸 {memeCash}
            </motion.div>

            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
              >
                👤 Profile
              </motion.button>
              {showProfileDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 mt-2 w-60 rounded-lg shadow-lg p-4 z-50 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Chat Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300"
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
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden mt-24 pb-20">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 mt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <AnimatePresence>
              {chatLog.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.2 }} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <ChatBubble message={msg.text} isUser={msg.sender === "user"} />
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && <LoadingSpinner />}
            <div ref={endOfMessagesRef} />
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
              className={`p-3 rounded-lg text-center mb-4 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200 shadow-sm"}`}
            >
              <strong>{result}</strong>
            </motion.div>
          )}
        </div>

        {/* Chat Input Area as Footer */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`fixed bottom-0 left-64 right-0 p-4 ${darkMode ? "bg-gray-900" : "bg-white"} border-t ${darkMode ? "border-gray-700" : "border-gray-100 shadow-md"}`}
        >
          <div className="max-w-4xl mx-auto flex">
            <motion.input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className={`flex-1 px-4 py-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                darkMode ? "bg-gray-700 placeholder-gray-400" : "bg-gray-50 placeholder-gray-500 border border-gray-200"
              }`}
              whileFocus={{ 
                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                backgroundColor: darkMode ? "#374151" : "#ffffff"
              }}
            />
            <motion.button
              whileHover={{ backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.98 }}
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-l-none rounded-r-xl px-6 font-medium shadow-md"
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 500 }}
            className={`fixed top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full z-50 flex items-center gap-2 text-sm font-medium shadow-lg ${
              darkMode ? "bg-green-900 text-green-200 border border-green-700" : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {popup}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;