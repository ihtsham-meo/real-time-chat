import { motion } from 'framer-motion';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    return (
        <motion.div
            className="app-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {children}
        </motion.div>
    );
};

export default MainLayout;
