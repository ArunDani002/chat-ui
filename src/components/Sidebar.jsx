import React from "react";

const users = ["Arun", "John", "Priya", "David"];

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      {users.map((user, index) => (
        <div key={index} className="user">
          {user}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;