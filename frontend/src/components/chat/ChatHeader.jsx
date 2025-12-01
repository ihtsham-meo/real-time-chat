import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './ChatHeader.css';

const ChatHeader = ({ chat }) => {
    const { user } = useAuth();

    if (!chat) return null;

    const getChatInfo = () => {
        if (chat.isGroupChat) {
            return {
                name: chat.groupName,
                avatar: chat.groupProfilePic,
                subtitle: `${chat.users?.length || 0} members`,
            };
        } else {
            const otherUser = chat.users?.find((u) => u._id !== user?._id);
            return {
                name: otherUser?.name || 'Unknown',
                avatar: otherUser?.profilePic,
                subtitle: otherUser?.status === 'online' ? 'Online' : 'Offline',
                isOnline: otherUser?.status === 'online',
            };
        }
    };

    const chatInfo = getChatInfo();

    return (
        <motion.div
            className="chat-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="chat-header-content">
                <div className="chat-header-avatar">
                    {chatInfo.avatar ? (
                        <img src={chatInfo.avatar} alt={chatInfo.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            {chatInfo.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {!chat.isGroupChat && chatInfo.isOnline && (
                        <div className="online-dot"></div>
                    )}
                </div>

                <div className="chat-header-info">
                    <h3>{chatInfo.name}</h3>
                    <p className={chatInfo.isOnline ? 'online-status' : ''}>
                        {chatInfo.subtitle}
                    </p>
                </div>
            </div>

            <div className="chat-header-actions">
                <motion.button
                    className="header-action-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Search messages"
                >
                    🔍
                </motion.button>
                <motion.button
                    className="header-action-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Chat info"
                >
                    ℹ️
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ChatHeader;
