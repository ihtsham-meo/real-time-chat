import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './MessageBubble.css';

const MessageBubble = ({ message, index }) => {
    const { user } = useAuth();
    const isSent = message.sender?._id === user?._id;

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <motion.div
            className={`message-bubble ${isSent ? 'sent' : 'received'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25,
            }}
            whileHover={{
                scale: 1.02,
                translateZ: 5,
            }}
        >
            {!isSent && (
                <div className="sender-name">{message.sender?.name}</div>
            )}

            <div className="message-content">
                {message.messageType === 'image' && message.fileUrl && (
                    <img
                        src={message.fileUrl}
                        alt="Shared image"
                        className="message-image"
                    />
                )}

                {message.messageType === 'file' && message.fileUrl && (
                    <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="message-file"
                    >
                        📎 {message.fileName || 'File'}
                    </a>
                )}

                {message.content && <p>{message.content}</p>}
            </div>

            <div className="message-meta">
                <span className="message-time">{formatTime(message.createdAt)}</span>
                {isSent && (
                    <span className="message-status">
                        {message.seenBy?.length > 1 ? '✓✓' : '✓'}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default MessageBubble;
