import React, { useState } from "react";

function InputBox({ sendMessage, selectedUser, socket }) {
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (msg.trim()) {
      sendMessage(msg);
      setMsg("");
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit("typing", { to: selectedUser });
    }
  };

  return (
    <div style={{ marginTop: "10px", display: "flex" }}>
      <input
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          handleTyping();
        }}
        style={{ flex: 1, padding: "10px" }}
        placeholder="Type message..."
      />

      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default InputBox;