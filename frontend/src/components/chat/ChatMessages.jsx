import React from "react";
import MessageBubble from "./MessageBubble";

export default function ChatMessages({ messages = [] }) {
  return (
    <div className="messages-wrapper">
      {messages.map(m => (
        <MessageBubble key={m._id} message={m} />
      ))}
    </div>
  );
}
