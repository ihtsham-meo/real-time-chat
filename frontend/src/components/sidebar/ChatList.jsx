import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ChatItem from './ChatItem';
import './ChatList.css';

const ChatList = ({ searchQuery, onChatSelect, selectedChatId }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chats/my`,
                { withCredentials: true }
            );
            setChats(response.data.chats || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter((chat) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const chatName = chat.isGroupChat
            ? chat.groupName
            : chat.users?.find((u) => u._id !== chat.currentUserId)?.name || '';

        return chatName.toLowerCase().includes(query);
    });

    if (loading) {
        return (
            <div className="chat-list">
                <div className="loading-state">Loading chats...</div>
            </div>
        );
    }

    if (filteredChats.length === 0) {
        return (
            <div className="chat-list">
                <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {searchQuery ? 'No chats found' : 'No chats yet. Start a conversation!'}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="chat-list">
            {filteredChats.map((chat, index) => (
                <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={chat._id === selectedChatId}
                    onClick={() => onChatSelect(chat)}
                    index={index}
                />
            ))}
        </div>
    );
};

export default ChatList;
