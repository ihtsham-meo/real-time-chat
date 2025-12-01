import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import UserProfile from './UserProfile';
import CreateGroupModal from '../modals/CreateGroupModal';
import './Sidebar.css';

const Sidebar = ({ onChatSelect, selectedChatId, onGroupCreated }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleGroupCreated = (newGroup) => {
    if (onGroupCreated) {
      onGroupCreated(newGroup);
    }
    if (onChatSelect) {
      onChatSelect(newGroup);
    }
  };

  return (
    <>
      <motion.div
        className="sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <UserProfile user={user} />

        <div className="sidebar-search">
          <motion.input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <div className="sidebar-header">
          <h2>Messages</h2>
          <motion.button
            className="new-chat-btn"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateGroup(true)}
            title="Create group chat"
          >
            +
          </motion.button>
        </div>

        <ChatList
          searchQuery={searchQuery}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
      </motion.div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </>
  );
};

export default Sidebar;
