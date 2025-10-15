import React from 'react';
import './ErrorModal.css';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isOpen, 
  title = "Erro", 
  message, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <h3>{title}</h3>
          <button className="error-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="error-modal-body">
          <div className="error-icon">⚠️</div>
          <p>{message}</p>
        </div>
        <div className="error-modal-footer">
          <button className="error-modal-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
