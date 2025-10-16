import React from 'react';
import './SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  title = "Sucesso", 
  message, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <h3>{title}</h3>
          <button className="success-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="success-modal-body">
          <p>{message}</p>
        </div>
        <div className="success-modal-footer">
          <button className="success-modal-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
