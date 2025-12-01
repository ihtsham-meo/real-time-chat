import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const { user } = useAuth();
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (searchQuery.trim()) {
            searchUsers();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const searchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/search?query=${searchQuery}`,
                { withCredentials: true }
            );
            // Filter out current user and already selected users
            const filtered = response.data.users.filter(
                (u) => u._id !== user._id && !selectedUsers.find((s) => s._id === u._id)
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (selectedUser) => {
        setSelectedUsers([...selectedUsers, selectedUser]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) {
            alert('Please enter a group name and select at least 2 members');
            return;
        }

        try {
            setCreating(true);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chats/group`,
                {
                    groupName: groupName.trim(),
                    users: selectedUsers.map((u) => u._id),
                },
                { withCredentials: true }
            );

            onGroupCreated(response.data.chat);
            handleClose();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        setGroupName('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>Create Group Chat</h2>
                        <button className="close-btn" onClick={handleClose}>
                            ✕
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-group">
                            <label>Group Name</label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                className="group-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Add Members</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="group-input"
                            />
                        </div>

                        {loading && <div className="search-loading">Searching...</div>}

                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((result) => (
                                    <motion.div
                                        key={result._id}
                                        className="search-result-item"
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSelectUser(result)}
                                    >
                                        <div className="result-avatar">
                                            {result.profilePic ? (
                                                <img src={result.profilePic} alt={result.name} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {result.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <div className="result-name">{result.name}</div>
                                            <div className="result-username">@{result.username}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {selectedUsers.length > 0 && (
                            <div className="selected-users">
                                <label>Selected Members ({selectedUsers.length})</label>
                                <div className="selected-list">
                                    {selectedUsers.map((user) => (
                                        <motion.div
                                            key={user._id}
                                            className="selected-user-chip"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <span>{user.name}</span>
                                            <button
                                                onClick={() => handleRemoveUser(user._id)}
                                                className="remove-chip"
                                            >
                                                ✕
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="cancel-btn" onClick={handleClose}>
                            Cancel
                        </button>
                        <motion.button
                            className="create-btn"
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {creating ? 'Creating...' : 'Create Group'}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateGroupModal;
