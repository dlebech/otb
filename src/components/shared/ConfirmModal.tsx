import React from 'react';
import Modal from './Modal';

export interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  body: React.ReactNode | string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm',
  body,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-blue-600 text-white hover:bg-blue-700',
  cancelButtonClass = 'bg-gray-600 text-white hover:bg-gray-700',
  size = 'md'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} title={title} size={size}>
      <div className="mb-4">
        {typeof body === 'string' ? <p>{body}</p> : body}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded font-medium transition-colors px-4 py-2 ${cancelButtonClass}`}
          onClick={onHide}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded font-medium transition-colors px-4 py-2 ${confirmButtonClass}`}
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;