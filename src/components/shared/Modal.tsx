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
        type: "spring" as const,
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
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
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
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ zIndex: 1050, pointerEvents: 'none' }}
            tabIndex={-1}
            role="dialog"
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div
              className={`w-full mx-auto px-4 ${sizeClass}`}
              role="document"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="bg-white rounded-lg shadow-xl w-full">
                {title && (
                  <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h5 className="text-lg font-semibold">{title}</h5>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                      aria-label="Close"
                      onClick={onHide}
                    >&times;</button>
                  </div>
                )}
                <div className="px-6 py-4">
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
