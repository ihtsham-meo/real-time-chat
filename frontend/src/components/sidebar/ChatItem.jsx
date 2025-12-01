import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './ChatItem.css';

const ChatItem = ({ chat, isSelected, onClick, index }) => {
    const { user } = useAuth();

    // Get chat display info
    const getChatInfo = () => {
        if (chat.isGroupChat) {
            return {
                name: chat.groupName,
                avatar: chat.groupProfilePic,
                isOnline: false,
            };
        } else {
            const otherUser = chat.users?.find((u) => u._id !== user?._id);
            return {
                name: otherUser?.name || 'Unknown',
                avatar: otherUser?.profilePic,
                username: otherUser?.username,
                isOnline: otherUser?.status === 'online',
            };
        }
    };

    const chatInfo = getChatInfo();
    const lastMessage = chat.latestMessage?.content || 'No messages yet';
    const timestamp = chat.latestMessage?.createdAt
        ? new Date(chat.latestMessage.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        })
        : '';

    return (
        <motion.div
            className={`chat-item ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{
                scale: 1.02,
                translateZ: 10,
                boxShadow: '0 8px 16px rgba(212, 175, 55, 0.15)',
            }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="chat-avatar">
                {chatInfo.avatar ? (
                    <img src={chatInfo.avatar} alt={chatInfo.name} />
                ) : (
                    <div className="avatar-placeholder">
                        {chatInfo.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                {!chat.isGroupChat && chatInfo.isOnline && (
                    <div className="online-indicator"></div>
                )}
            </div>

            <div className="chat-info">
                <div className="chat-header">
                    <h4 className="chat-name">{chatInfo.name}</h4>
                    {timestamp && <span className="chat-time">{timestamp}</span>}
                </div>
                <p className="last-msg">{lastMessage}</p>
            </div>

            {/* Unread badge (placeholder for now) */}
            {/* <div className="unread-badge">3</div> */}
        </motion.div>
    );
};

export default ChatItem;
