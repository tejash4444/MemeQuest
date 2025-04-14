import React from "react";

const TopBar = ({ memeCurrency }) => (
  <>
    <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded shadow-md z-30">
      🪙 Meme Currency: {memeCurrency}
    </div>
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md flex items-center space-x-2 z-30">
      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
        U
      </div>
      <div className="text-sm font-semibold text-gray-700">UserName</div>
    </div>
  </>
);

export default TopBar;
