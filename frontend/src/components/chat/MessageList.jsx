import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import './MessageList.css';

const MessageList = ({ chat }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (chat) {
            fetchMessages();
            joinChat();
        }

        return () => {
            if (chat && socket) {
                socket.emit('leaveChat', chat._id);
            }
        };
    }, [chat]);

    useEffect(() => {
        if (!socket) return;

        // Listen for new messages
        socket.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        // Listen for message seen updates
        socket.on('messageSeen', ({ messageId, userId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, seenBy: [...(msg.seenBy || []), userId] }
                        : msg
                )
            );
        });

        return () => {
            socket.off('newMessage');
            socket.off('messageSeen');
        };
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const joinChat = () => {
        if (socket && chat?._id) {
            socket.emit('joinChat', chat._id);
        }
    };

    const fetchMessages = async () => {
        if (!chat?._id) return;

        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/chat/${chat._id}?page=1&limit=50`,
                { withCredentials: true }
            );
            setMessages(response.data.messages || []);

            // Mark messages as seen
            markMessagesAsSeen(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsSeen = (msgs) => {
        if (!msgs || !user) return;

        msgs.forEach((msg) => {
            if (msg.sender?._id !== user._id && !msg.seenBy?.includes(user._id)) {
                axios.put(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/seen/${msg._id}`,
                    {},
                    { withCredentials: true }
                ).catch(err => console.error('Error marking message as seen:', err));
            }
        });
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    if (loading) {
        return (
            <div className="messages-wrapper">
                <div className="loading-messages">Loading messages...</div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="messages-wrapper">
                <motion.div
                    className="empty-messages"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="empty-icon">💬</div>
                    <p>No messages yet. Start the conversation!</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="messages-wrapper">
            <AnimatePresence>
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                        index={index}
                    />
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
