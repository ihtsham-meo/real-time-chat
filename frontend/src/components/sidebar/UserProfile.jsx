import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './UserProfile.css';

const UserProfile = ({ user }) => {
    const { logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="user-profile">
            <motion.div
                className="profile-content"
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowMenu(!showMenu)}
            >
                <div className="profile-avatar">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="status-indicator online"></div>
                </div>
                <div className="profile-info">
                    <h3>{user?.name}</h3>
                    <p>@{user?.username}</p>
                </div>
                <motion.div
                    className="menu-icon"
                    animate={{ rotate: showMenu ? 180 : 0 }}
                >
                    ⚙️
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        className="profile-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button className="menu-item">Edit Profile</button>
                        <button className="menu-item">Settings</button>
                        <button className="menu-item logout" onClick={logout}>
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
