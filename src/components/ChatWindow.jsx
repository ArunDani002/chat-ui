import React, { useState, useEffect } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatWindow() {
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const [unread, setUnread] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  // ✅ USERS LIST
  useEffect(() => {
    socket.on("users_list", (users) => {
      setUsers(users.filter((u) => u !== username));
    });

    return () => socket.off("users_list");
  }, [username]);

  // ✅ RECEIVE PRIVATE MESSAGE
  useEffect(() => {
    socket.on("receive_private_message", (data) => {
      const user = data.from;

      setMessages((prev) => ({
        ...prev,
        [user]: [
          ...(prev[user] || []),
          {
            text: data.message,
            sender: data.from === username ? "me" : "other",
            user: data.from,
          },
        ],
      }));

      // 🔴 UNREAD COUNT
      if (selectedUser !== user) {
        setUnread((prev) => ({
          ...prev,
          [user]: (prev[user] || 0) + 1,
        }));
      }
    });

    return () => socket.off("receive_private_message");
  }, [username, selectedUser]);

  // ✅ TYPING INDICATOR
  useEffect(() => {
    socket.on("user_typing", ({ from }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [from]: true,
      }));

      setTimeout(() => {
        setTypingUsers((prev) => ({
          ...prev,
          [from]: false,
        }));
      }, 1000);
    });

    return () => socket.off("user_typing");
  }, []);

  // ✅ SEND MESSAGE
  const sendMessage = (msg) => {
    if (!selectedUser) return;

    socket.emit("private_message", {
      to: selectedUser,
      message: msg,
    });

    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [
        ...(prev[selectedUser] || []),
        {
          text: msg,
          sender: "me",
          user: selectedUser,
        },
      ],
    }));
  };

  return (
    <div>
      {!isJoined ? (
        <div className="joinContainer">
          <h2>Join Chat</h2>
          <input
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={() => {
              if (username.trim()) {
                socket.emit("join", username);
                setIsJoined(true);
              }
            }}
          >
            Join
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", height: "100vh" }}>
          
          {/* 🟣 USERS LIST */}
          <div
            style={{
              width: "30%",
              borderRight: "1px solid gray",
              padding: "10px",
            }}
          >
            <h3>Users</h3>

            {users.map((user, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedUser(user);

                  // clear unread
                  setUnread((prev) => ({
                    ...prev,
                    [user]: 0,
                  }));
                }}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  background:
                    selectedUser === user ? "#ddd" : "transparent",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{user}</span>

                {/* 🔴 unread badge */}
                {unread[user] > 0 && (
                  <span style={{ color: "red" }}>
                    {unread[user]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 🟣 CHAT WINDOW */}
          <div style={{ width: "70%", padding: "10px" }}>
            <h3>Chat with: {selectedUser || "Select user"}</h3>

            <div
              style={{
                height: "80%",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              {(messages[selectedUser] || []).map((msg, index) => (
                <Message key={index} msg={msg} />
              ))}

              {/* ✍️ typing indicator */}
              {typingUsers[selectedUser] && (
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  {selectedUser} is typing...
                </p>
              )}
            </div>

            <InputBox
              sendMessage={sendMessage}
              selectedUser={selectedUser}
              socket={socket}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;