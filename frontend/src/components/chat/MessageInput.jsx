import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import './MessageInput.css';

const MessageInput = ({ chat, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();

  const handleTyping = () => {
    if (!isTyping && socket && chat?._id) {
      setIsTyping(true);
      socket.emit('typing', { chatId: chat._id, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && chat?._id) {
        socket.emit('typing', { chatId: chat._id, isTyping: false });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || !chat?._id || sending) return;

    try {
      setSending(true);

      // Stop typing indicator
      if (socket && chat?._id) {
        socket.emit('typing', { chatId: chat._id, isTyping: false });
        setIsTyping(false);
      }

      const formData = new FormData();
      formData.append('chatId', chat._id);
      if (message.trim()) {
        formData.append('content', message.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/send`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onMessageSent) {
        onMessageSent(response.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  return (
    <div className="message-input-container">
      {file && (
        <motion.div
          className="file-preview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>📎 {file.name}</span>
          <button type="button" onClick={removeFile} className="remove-file">
            ✕
          </button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <motion.button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Attach file"
        >
          📎
        </motion.button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,.pdf,.doc,.docx"
        />

        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="text-input"
          disabled={sending}
        />

        <motion.button
          type="submit"
          className="send-btn"
          disabled={(!message.trim() && !file) || sending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {sending ? '⏳' : '➤'}
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;
