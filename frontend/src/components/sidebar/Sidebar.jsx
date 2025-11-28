import React from "react";

export default function Sidebar({ chats = [], onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Chats</div>
      <div className="chat-list">
        {chats.map(c => (
          <div key={c._id} className="chat-item" onClick={() => onSelect(c)}>
            <div className="chat-name">{c.isGroupChat ? c.groupName : c.users.find(u => u._id).name}</div>
            <div className="last-msg">{c.latestMessage?.content || ""}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
