import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced Background Component for Chat Area
const DynamicBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
    <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-yellow-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
  </div>
);

// Enhanced ChatBubble with typing animation
const ChatBubble = ({ message, isUser }) => {
  const [typedText, setTypedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isUser) {
      let i = 0;
      const typing = setInterval(() => {
        if (i < message.length) {
          setTypedText(message.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typing);
          setIsDone(true);
        }
      }, 10);
      return () => clearInterval(typing);
    } else {
      setTypedText(message);
      setIsDone(true);
    }
  }, [message, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        bounce: 0.3,
      }}
      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md relative ${
        isUser
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white ml-auto mr-0"
          : "bg-white text-gray-800 border border-gray-100"
      }`}
    >
      {isUser ? message : typedText}
      {!isUser && !isDone && (
        <motion.span
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="ml-1"
        >
          ▎
        </motion.span>
      )}
      <motion.div
        className={`absolute ${
          isUser ? "-left-1" : "-right-1"
        } top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${
          isUser ? "bg-blue-500" : "bg-white border border-gray-100"
        }`}
      />
    </motion.div>
  );
};

const PrimaryButton = ({
  text,
  onClick,
  icon,
  className = "",
  isActive = false,
}) => (
  <motion.button
    whileHover={{
      scale: 1.05,
      backgroundColor: isActive ? "" : "#f0f4ff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all text-sm font-medium ${className} ${
      isActive
        ? "bg-blue-100 text-blue-600 border border-blue-200 shadow-inner"
        : "hover:bg-gray-50"
    }`}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.4,
      type: "spring",
      stiffness: 200,
      damping: 20,
    }}
  >
    {icon && (
      <motion.span
        className="text-lg"
        whileHover={{ rotate: [-5, 5, 0], transition: { duration: 0.5 } }}
      >
        {icon}
      </motion.span>
    )}
    {text}
  </motion.button>
);

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-center py-4"
  >
    <motion.div
      animate={{
        rotate: 360,
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        },
      }}
      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
    ></motion.div>
  </motion.div>
);

// Confetti animation for rewards
const Confetti = ({ visible }) => {
  const confettiRef = useRef();

  if (!visible) return null;

  const confettiPieces = Array(50)
    .fill()
    .map((_, i) => {
      const randomX = Math.random() * 2000 - 1000;
      const randomY = Math.random() * -1000;
      const randomRotate = Math.random() * 360;
      const randomColor = [
        "#FF5252",
        "#4CAF50",
        "#2196F3",
        "#FFEB3B",
        "#9C27B0",
      ][Math.floor(Math.random() * 5)];

      return (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={{
            x: randomX,
            y: randomY,
            rotate: randomRotate,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: randomColor,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
            zIndex: 100,
          }}
        />
      );
    });

  return (
    <div
      ref={confettiRef}
      className="fixed top-1/2 left-1/2 pointer-events-none"
    >
      {confettiPieces}
    </div>
  );
};

const App = () => {
  const [selectedActivity, setSelectedActivity] = useState(
    "Welcome to MemeQuest!"
  );
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [rippleEffect, setRippleEffect] = useState({
    active: false,
    x: 0,
    y: 0,
  });

  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

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

  // Add greeting message on initial load
  useEffect(() => {
    if (chatLog.length === 0) {
      setTimeout(() => {
        setChatLog([
          {
            sender: "bot",
            text: "Hey there! I'm MoodBot, your personal chat companion. Try out one of our games or just chat with me! How are you feeling today?",
          },
        ]);
      }, 800);
    }
  }, []);

  const handleSelection = (text) => {
    setSelectedActivity(text);

    // Add ripple effect
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setRippleEffect({ active: true, x: centerX, y: centerY });
    setTimeout(() => setRippleEffect({ active: false, x: 0, y: 0 }), 800);

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

      if (data.new_balance !== undefined) {
        const oldBalance = memeCash;
        setMemeCash(data.new_balance);

        // Show confetti if balance increased
        if (data.new_balance > oldBalance) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }

      if (input === "!daily" && !dailyRewardCollected) {
        localStorage.setItem("lastDailyReward", new Date().toISOString());
        setPopup("🎁 Daily Meme Cash collected!");
        setDailyRewardCollected(true);
        setShowConfetti(true);
        setTimeout(() => {
          setPopup("");
          setShowConfetti(false);
        }, 3000);
      } else if (input === "!daily") {
        setPopup("🎁 You've already collected your daily Meme Cash today.");
        setTimeout(() => setPopup(""), 3000);
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    } finally {
      setIsLoading(false);
    }
    setInput("");

    // Focus back on input after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // Add custom CSS for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 7s infinite alternate;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-3000 {
        animation-delay: 3s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
      .scrollbar-thin::-webkit-scrollbar {
        width: 5px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
      }
      .scale-in-center {
        animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      @keyframes scale-in-center {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.5); opacity: 0.5; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${
        darkMode
          ? "bg-black text-white" // Dark mode with black background and white text
          : "bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800"
      }`}
    >
      {/* Activity Change Ripple Effect */}
      {rippleEffect.active && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed z-50 w-20 h-20 rounded-full bg-blue-500"
          style={{
            left: rippleEffect.x,
            top: rippleEffect.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Confetti Effect */}
      <Confetti visible={showConfetti} />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`w-64 p-4 h-screen sticky top-0 ${
          darkMode
            ? "bg-gray-800 border-r border-gray-700"
            : "bg-white border-r border-gray-100 shadow-md"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              transition: { repeat: Infinity, duration: 2, repeatDelay: 5 },
            }}
            className={`text-3xl ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            🤖
          </motion.div>
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            MoodBot
          </h2>
        </motion.div>

        <div className="space-y-6">
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-xs uppercase tracking-wider mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
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
                onClick={() => {
                  setIsMemeChat(true);
                  handleSelection("Meme Chat");
                }}
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
              className={`text-xs uppercase tracking-wider mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
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
              ].map(({ text, icon }, index) => (
                <PrimaryButton
                  key={text}
                  text={text}
                  icon={icon}
                  onClick={() => handleSelection(text)}
                  isActive={selectedActivity === text}
                  className={`${darkMode ? "hover:bg-gray-700" : ""}`}
                />
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative ${
                  dailyRewardCollected ? "opacity-60" : ""
                }`}
              >
                <PrimaryButton
                  text="Daily Bonus"
                  onClick={() => {
                    setInput("!daily");
                    sendMessage();
                  }}
                  icon="🎁"
                  className={`${darkMode ? "hover:bg-gray-700" : ""} ${
                    dailyRewardCollected ? "overflow-hidden" : ""
                  }`}
                />
                {dailyRewardCollected && (
                  <motion.div className="absolute inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center rounded-xl pointer-events-none">
                    <span className="text-xs font-medium"></span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-xs uppercase tracking-wider mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
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
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-24 p-6 overflow-hidden relative ml-64">
        {/* Fixed Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          className={`fixed top-0 left-64 right-0 px-6 py-4 z-40 flex justify-between items-center shadow-md ${
            darkMode ? "bg-gray-900" : "bg-white border-b border-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                transition: { repeat: Infinity, duration: 2, repeatDelay: 1 },
              }}
              className={`h-10 w-10 flex items-center justify-center rounded-full ${
                darkMode ? "bg-blue-900" : "bg-blue-100"
              }`}
            >
              {selectedActivity === "Welcome to MoodBot!" && "👋"}
              {selectedActivity === "Chat Games" && "💬"}
              {selectedActivity === "Meme Chat" && "😂"}
              {selectedActivity === "Hunting" && "🏹"}
              {selectedActivity === "Fishing" && "🎣"}
              {selectedActivity === "Coin Flip" && "🪙"}
              {selectedActivity === "Dice Roll" && "🎲"}
              {selectedActivity === "Blackjack" && "🃏"}
              {selectedActivity === "Items" && "🎒"}
              {selectedActivity === "Shop" && "🛒"}
            </motion.div>
            <motion.h1
              key={selectedActivity} // For animation reset on change
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl font-bold ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {selectedActivity}
            </motion.h1>
          </div>

          <div className="flex gap-4 items-center relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md text-sm font-medium ${
                darkMode
                  ? "bg-gray-800 border border-yellow-500 text-yellow-400"
                  : "bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              <motion.span
                animate={{
                  rotateY: [0, 180, 0],
                  transition: { repeat: Infinity, duration: 2, repeatDelay: 3 },
                }}
              >
                💸
              </motion.span>
              <motion.span
                key={memeCash}
                initial={{ scale: 1.2, color: "#10B981" }}
                animate={{ scale: 1, color: "inherit" }}
                transition={{ duration: 0.5 }}
              >
                {memeCash}
              </motion.span>
            </motion.div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#2563eb" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
              >
                <motion.span
                  animate={{
                    y: [0, -2, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 1.5,
                      repeatDelay: 2,
                    },
                  }}
                >
                  👤
                </motion.span>
                Profile
              </motion.button>
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`absolute right-0 mt-2 w-60 rounded-lg shadow-lg p-4 z-50 ${
                      darkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Chat Mode
                      </label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-white border-gray-300"
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
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
                      </span>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                          />
                          <div
                            className={`block w-10 h-6 rounded-full ${
                              darkMode ? "bg-blue-600" : "bg-gray-400"
                            }`}
                          />
                          <motion.div
                            layout
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full ${
                              darkMode ? "translate-x-4" : ""
                            }`}
                          />
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Chat Area with Dynamic Background */}
        <div className="flex-1 flex flex-col overflow-hidden mt-24 md:mt-24 pb-20 relative z-10">
          {/* Dynamic background */}
          <DynamicBackground />

          {/* Glass effect container */}
          <div
            className={`flex-1 overflow-hidden rounded-2xl p-4 mb-4 relative ${
              darkMode
                ? "bg-gray-800 bg-opacity-60 backdrop-blur-sm"
                : "bg-white bg-opacity-60 backdrop-blur-sm shadow-lg"
            }`}
          >
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 mt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent h-full">
              <AnimatePresence>
                {chatLog.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.5 }}
                    className="h-full flex flex-col items-center justify-center text-center p-6"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        transition: { repeat: Infinity, duration: 2 },
                      }}
                      className="text-6xl mb-4"
                    >
                      💬
                    </motion.div>
                    <h3
                      className={`text-xl font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Start chatting with MoodBot
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Try a game or just say hello!
                    </p>
                  </motion.div>
                )}

                {chatLog.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <ChatBubble
                      message={msg.text}
                      isUser={msg.sender === "user"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && <LoadingSpinner />}
              <div ref={endOfMessagesRef} />
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
              className={`p-3 rounded-lg text-center mb-4 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
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
          className={`fixed bottom-0 left-64 right-0 p-4 ${
            darkMode ? "bg-gray-900" : "bg-white"
          } border-t ${
            darkMode ? "border-gray-700" : "border-gray-100 shadow-md"
          }`}
        >
          <div className="max-w-4xl mx-auto flex">
            <motion.input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className={`flex-1 px-4 py-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                darkMode
                  ? "bg-gray-700 placeholder-gray-400"
                  : "bg-gray-50 placeholder-gray-500 border border-gray-200"
              }`}
              whileFocus={{
                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                backgroundColor: darkMode ? "#374151" : "#ffffff",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
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
              darkMode
                ? "bg-green-900 text-green-200 border border-green-700"
                : "bg-green-100 text-green-800 border border-green-200"
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
