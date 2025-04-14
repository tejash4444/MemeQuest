import React from "react";

const Popup = ({ message }) => (
  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-30">
    {message}
  </div>
);

export default Popup;
