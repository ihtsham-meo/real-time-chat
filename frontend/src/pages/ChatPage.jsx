import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { useSocket } from '../context/SocketContext';
import './ChatPage.css';

const ChatPage = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [refreshMessages, setRefreshMessages] = useState(0);
    const [refreshChats, setRefreshChats] = useState(0);
    const [typingUsers, setTypingUsers] = useState({});
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Listen for typing events
        socket.on('userTyping', ({ chatId, userId, userName, isTyping }) => {
            setTypingUsers((prev) => ({
                ...prev,
                [chatId]: isTyping ? { userId, userName } : null,
            }));
        });

        return () => {
            socket.off('userTyping');
        };
    }, [socket]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleMessageSent = () => {
        setRefreshMessages(prev => prev + 1);
    };

    const handleGroupCreated = (newGroup) => {
        setRefreshChats(prev => prev + 1);
    };

    const currentTypingUser = selectedChat?._id ? typingUsers[selectedChat._id] : null;

    return (
        <MainLayout>
            <Sidebar
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChat?._id}
                onGroupCreated={handleGroupCreated}
                key={refreshChats}
            />

            <div className="chat-area">
                {selectedChat ? (
                    <motion.div
                        className="chat-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        key={selectedChat._id}
                    >
                        <ChatHeader chat={selectedChat} />
                        <MessageList chat={selectedChat} key={refreshMessages} />

                        {/* Typing Indicator */}
                        {currentTypingUser && (
                            <motion.div
                                className="typing-indicator"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <span>{currentTypingUser.userName} is typing</span>
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </motion.div>
                        )}

                        <MessageInput chat={selectedChat} onMessageSent={handleMessageSent} />
                    </motion.div>
                ) : (
                    <motion.div
                        className="empty-chat"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="empty-icon">💬</div>
                        <h2>Select a chat to start messaging</h2>
                        <p>Choose a conversation from the sidebar or create a new group</p>
                    </motion.div>
                )}
            </div>
        </MainLayout>
    );
};

export default ChatPage;
