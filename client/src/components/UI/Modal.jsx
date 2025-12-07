import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, message, type = 'info', actions }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 style={{
                    color: type === 'error' ? 'var(--danger)' : 'var(--primary)',
                    marginBottom: '10px',
                    fontSize: '1.5rem'
                }}>
                    {title}
                </h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '20px', lineHeight: '1.5' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {actions ? actions : (
                        <button className="btn-primary" onClick={onClose}>Okay</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
