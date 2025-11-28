import React, { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import { getMessages } from "../../api/messageApi";
import { socket } from "../../socket";

export default function ChatArea({ selectedChat }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!selectedChat) return;
    const load = async () => {
      try {
        const res = await getMessages(selectedChat._id);
        setMessages(res.messages || []);
        socket.emit("joinChat", selectedChat._id);
      } catch (err) { console.error(err); }
    };
    load();

    // listen for new messages
    socket.on("newMessage", (msg) => {
      if (msg.chat === selectedChat._id || (msg.chat && msg.chat._id === selectedChat._id)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off("newMessage");
      if (selectedChat) socket.emit("leaveChat", selectedChat._id);
    };
  }, [selectedChat]);

  return (
    <div className="chat-area">
      <ChatMessages messages={messages} />
      <MessageInput chatId={selectedChat?._id} />
    </div>
  );
}
