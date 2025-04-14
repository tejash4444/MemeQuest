import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Popup from "./components/Popup";
import useDailyReward from "./hooks/useDailyReward";

const App = () => {
  const [selectedActivity, setSelectedActivity] = useState(
    "Welcome to MoodBot!"
  );
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [mode, setMode] = useState("normal");
  const [memeCurrency, setMemeCurrency] = useState(100);
  const [popup, setPopup] = useState("");
  const [wager, setWager] = useState(0);
  const [result, setResult] = useState("");
  const [isMemeChat, setIsMemeChat] = useState(false);

  const { dailyRewardCollected, checkAndSetDailyReward } = useDailyReward();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

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

      if (input === "!daily") {
        const message = checkAndSetDailyReward();
        setPopup(message);
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 font-sans relative">
      <TopBar memeCurrency={memeCurrency} />
      <Sidebar
        handleSelection={handleSelection}
        setInput={setInput}
        sendMessage={sendMessage}
        setIsMemeChat={setIsMemeChat}
      />
      {popup && <Popup message={popup} />}
      <ChatWindow
        selectedActivity={selectedActivity}
        chatLog={chatLog}
        mode={mode}
        setMode={setMode}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        endOfMessagesRef={endOfMessagesRef}
      />
    </div>
  );
};

export default App;
