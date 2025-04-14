import React from "react";
import { motion } from "framer-motion";

const Sidebar = ({ handleSelection, setInput, sendMessage, setIsMemeChat }) => (
  <aside className="w-64 bg-white shadow-md p-4">
    <h2 className="text-2xl font-bold mb-6 text-blue-600">MoodBot</h2>
    <div className="space-y-4">
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

      <div>
        <h3 className="text-sm font-semibold text-gray-600">Others</h3>
        {["Items", "Shop"].map((opt, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelection(opt)}
            className={`w-full px-3 py-2 text-left ${
              idx === 0
                ? "bg-indigo-100 hover:bg-indigo-200"
                : "bg-teal-100 hover:bg-teal-200"
            } rounded transition`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  </aside>
);

export default Sidebar;
