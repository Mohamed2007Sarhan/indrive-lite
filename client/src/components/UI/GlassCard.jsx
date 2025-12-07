import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            className={`glass-card ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
