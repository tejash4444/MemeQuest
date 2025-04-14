import React from "react";

const ChatWindow = ({
  selectedActivity,
  chatLog,
  mode,
  setMode,
  input,
  setInput,
  sendMessage,
  endOfMessagesRef,
}) => (
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
        {[
          "normal",
          "flirty",
          "therapic",
          "motivational",
          "existential",
          "sarcastic",
        ].map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col flex-1 overflow-hidden bg-transparent">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg shadow-md max-w-lg ${
              msg.sender === "user"
                ? "bg-blue-100 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={endOfMessagesRef}></div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-4 flex"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  </main>
);

export default ChatWindow;
