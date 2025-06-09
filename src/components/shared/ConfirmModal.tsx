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
  confirmButtonClass = 'btn-primary',
  cancelButtonClass = 'btn-secondary',
  size = 'md'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} title={title} size={size}>
      <div className="mb-3">
        {typeof body === 'string' ? <p>{body}</p> : body}
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className={`btn ${cancelButtonClass}`}
          onClick={onHide}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn ${confirmButtonClass}`}
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;