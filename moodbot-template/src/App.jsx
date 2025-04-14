import React, { useState, useEffect, useRef } from "react"; // Importing necessary React hooks and useRef
import { motion } from "framer-motion"; // Importing the motion component from the framer-motion library for animations

const App = () => {
  // State variable to store the currently selected activity or title displayed
  const [selectedActivity, setSelectedActivity] = useState(
    "Welcome to MoodBot!" // Initial value for the selected activity
  );
  // State variable to store the text input by the user in the chat input field
  const [input, setInput] = useState("");
  // State variable to store the array of chat messages, each message will be an object with sender and text
  const [chatLog, setChatLog] = useState([]);
  // State variable to control the mood or mode of the bot's responses (e.g., normal, flirty)
  const [mode, setMode] = useState("normal"); // Default mode is "normal"
  // State variable to control the type of response the bot should give (e.g., compliment, roast, joke)
  const [type, setType] = useState("compliment"); // Default type is "compliment"
  // State variable to store the current coin balance of the user
  const [coinBalance, setCoinBalance] = useState(100); // Initial coin balance is 100
  // State variable to store the message for a temporary popup notification
  const [popup, setPopup] = useState("");
  // State variable to track if the daily reward has been collected today
  const [dailyRewardCollected, setDailyRewardCollected] = useState(false);
  // State variable to store the amount wagered by the user for a game
  const [wager, setWager] = useState(0);
  // State variable to store the result of a game (e.g., "won", "lost")
  const [result, setResult] = useState("");

  // Create a reference for the last chat message element in the chat log
  const endOfMessagesRef = useRef(null);

  // useEffect hook to check if the daily reward was collected today when the component mounts
  useEffect(() => {
    // Retrieve the timestamp of the last daily reward collection from local storage
    const lastCollection = localStorage.getItem("lastDailyReward");
    // If a last collection timestamp exists
    if (lastCollection) {
      // Create Date objects for the last collection date and the current date
      const lastDate = new Date(lastCollection);
      const currentDate = new Date();
      // Check if the last collection date and the current date are the same (day, month, year)
      if (
        lastDate.getDate() === currentDate.getDate() &&
        lastDate.getMonth() === currentDate.getMonth() &&
        lastDate.getFullYear() === currentDate.getFullYear()
      ) {
        setDailyRewardCollected(true); // Set the daily reward as already collected for today
      }
    }
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  // Function to handle the selection of an activity from the sidebar buttons
  const handleSelection = (text) => {
    setSelectedActivity(text); // Update the selected activity state

    // Mapping of activity names to their corresponding chat commands
    const commandMap = {
      Hunting: "!hunt",
      Fishing: "!fish",
      "Coin Flip": "!coin",
      "Dice Roll": "!dice",
      Blackjack: "!blackjack",
    };

    // Get the command based on the selected activity text
    const command = commandMap[text];
    // If a command exists for the selected activity
    if (command) {
      setWager(10); // Assuming a default wager of 10 coins for each activity
      setInput(command); // Set the input field value to the command
      // Use setTimeout to trigger the sendMessage function after a short delay
      // This ensures the input is updated before sending the message
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  };

  // Asynchronous function to send the user's message to the backend and handle the bot's response
  const sendMessage = async () => {
    // If the input field is empty after trimming whitespace, do nothing
    if (!input.trim()) return;

    // Create a user message object with the sender as "user" and the text from the input
    const userMessage = { sender: "user", text: input };
    // Update the chat log state by adding the new user message to the previous messages
    setChatLog((prev) => [...prev, userMessage]);

    try {
      // Send a POST request to the backend chat endpoint
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST", // HTTP method is POST
        headers: { "Content-Type": "application/json" }, // Set the content type of the request body to JSON
        body: JSON.stringify({ input, mode, type, coins: coinBalance, wager }), // Serialize the message data to JSON
      });

      // Parse the JSON response from the backend
      const data = await res.json();
      // Create a bot message object with the sender as "bot" and the response text from the backend
      const botMessage = {
        sender: "bot",
        text: data.response || "No response", // Use the response from the backend or a default message if no response
      };
      // Update the chat log state by adding the new bot message to the previous messages
      setChatLog((prev) => [...prev, botMessage]);

      // Update coin balance if the backend provides a new balance
      if (data.new_balance !== undefined) {
        setCoinBalance(data.new_balance);
      }

      // Show win/loss result if the backend provides a result
      if (data.result) {
        setResult(`You ${data.result} ${wager} coins!`);
      }

      // Handle the "!daily" command and daily reward collection
      if (input === "!daily" && !dailyRewardCollected) {
        localStorage.setItem("lastDailyReward", new Date().toISOString()); // Store the current timestamp in local storage
        setPopup("🎁 Daily reward collected!"); // Set the popup message
        setDailyRewardCollected(true); // Mark the daily reward as collected
        setTimeout(() => setPopup(""), 3000); // Clear the popup message after 3 seconds
      } else if (input === "!daily") {
        setPopup("🎁 You have already collected your daily reward today."); // Set the popup message if already collected
        setTimeout(() => setPopup(""), 3000); // Clear the popup message after 3 seconds
      }
    } catch (err) {
      // If there's an error during the fetch request, add an error message to the chat log
      setChatLog((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    }

    // Clear the input field after sending the message
    setInput("");
  };

  // useEffect hook to scroll to the bottom of the chat log whenever the chatLog state changes
  useEffect(() => {
    // Use the current property of the endOfMessagesRef to access the DOM element
    // The optional chaining (?.) ensures this doesn't error if the ref is not yet attached
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll the last message into view with smooth animation
  }, [chatLog]); // The effect runs whenever the chatLog state is updated

  return (
    // Main container div with flex layout, minimum height of the screen, background gradient, and font
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 font-sans relative">
      {/* Display the current coin balance in the top-left corner */}
      <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded shadow-md z-30">
        🪙 Coins: {coinBalance}
      </div>

      {/* Display the popup message if it exists */}
      {popup && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-30">
          {popup}
        </div>
      )}

      {/* Sidebar for navigation and activities */}
      <aside className="w-64 bg-white shadow-md p-4">
        {/* Title of the MoodBot */}
        <h2 className="text-2xl font-bold mb-6 text-blue-600">MoodBot</h2>
        {/* Container for different sections in the sidebar */}
        <div className="space-y-4">
          {/* Games section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Games</h3>
            {/* Button for "Chat Games" */}
            <motion.button
              whileHover={{ scale: 1.05 }} // Scale up on hover
              whileTap={{ scale: 0.95 }} // Scale down on tap
              onClick={() => handleSelection("Chat Games")} // Handle selection of "Chat Games"
              className="w-full px-3 py-2 text-left bg-blue-100 hover:bg-blue-200 rounded transition"
            >
              Chat Games
            </motion.button>
          </div>
          {/* Activities section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Activities</h3>
            {/* Mapping through an array of activities to create buttons */}
            {["Hunting", "Fishing", "Coin Flip", "Dice Roll", "Blackjack"].map(
              (act) => (
                <motion.button
                  key={act} // Unique key for each button in the map
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelection(act)} // Handle selection of each activity
                  className="w-full px-3 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  {act} {/* Display the activity name */}
                </motion.button>
              )
            )}
            {/* Button for claiming the daily bonus */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput("!daily"); // Set the input to the daily command
                sendMessage(); // Send the daily command
              }}
              className="w-full mt-2 px-3 py-2 text-left bg-green-100 hover:bg-green-200 rounded transition"
            >
              🎁 Daily Bonus
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col flex-1 p-6 overflow-hidden h-screen">
        {/* Display the currently selected activity as the title */}
        <div className="text-xl font-semibold mb-4 text-blue-700">
          {selectedActivity}
        </div>

        {/* Dropdowns for selecting the bot's mode and response type */}
        <div className="flex gap-4 mb-4">
          {/* Dropdown for selecting the bot's mode */}
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

          {/* Dropdown for selecting the bot's response type */}
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

        {/* Chat message display area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-transparent">
          {/* Scrollable container for chat messages */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Mapping through the chatLog array to display each message */}
            {chatLog.map((msg, idx) => (
              // Each message is contained in a div, aligned based on the sender
              <div
                key={idx} // Unique key for each message
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* The message bubble */}
                <div
                  className={`inline-block break-words px-4 py-2 rounded-2xl shadow text-sm max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white" // Style for user messages
                      : "bg-gray-200 text-gray-800" // Style for bot messages
                  }`}
                >
                  {msg.text} {/* Display the message text */}
                </div>
              </div>
            ))}
          </div>

          {/* Display the result of a game if it exists */}
          {result && (
            <div className="mt-2 bg-gray-100 text-center p-2 rounded-md">
              <strong>{result}</strong>
            </div>
          )}

          {/* Input area for typing new messages */}
          <div className="mt-4 bg-white z-20 flex">
            {/* Text input field */}
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)} // Update the input state on change
              onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Send message on Enter key press
            />
            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage} // Call the sendMessage function on click
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
            >
              Send
            </motion.button>
          </div>
        </div>
      </main>
      {/* Invisible div at the bottom of the chat log to help with scrolling */}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default App;
