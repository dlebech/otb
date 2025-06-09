import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ show, onHide, title, children, size = 'md' }: ModalProps) {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg'
  }[size];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1040,
              backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent
              transition: 'background-color 0.2s' // smooth transition
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onHide}
          ></motion.div>

          {/* Modal */}
          <motion.div
            className="modal"
            style={{ display: 'block', zIndex: 1050, pointerEvents: 'none' }}
            tabIndex={-1}
            role="dialog"
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div
              className={`modal-dialog ${sizeClass}`}
              role="document"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="modal-content">
                {title && (
                  <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={onHide}
                    ></button>
                  </div>
                )}
                <div className="modal-body">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
