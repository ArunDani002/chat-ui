import React from "react";

function Message({ msg }) {
  return (
    <div
      style={{
        textAlign: msg.sender === "me" ? "right" : "left",
        margin: "5px 0",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "10px",
          borderRadius: "10px",
          background: msg.sender === "me" ? "#DCF8C6" : "#eee",
        }}
      >
        {msg.text}
      </span>
    </div>
  );
}

export default Message;