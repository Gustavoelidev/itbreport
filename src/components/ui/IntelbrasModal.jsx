import React from 'react';
import { X } from 'lucide-react';

const IntelbrasModal = ({ isOpen, onClose, title, message, confirmText = "Confirmar", cancelText = "Cancelar", onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="intelbras-modal-overlay">
      <div className="intelbras-modal" data-modal-id="modal">
        <button onClick={onClose} className="intelbras-modal-close">
          <X size={18} />
        </button>
        
        <h3>{title}</h3>
        <h4>{message}</h4>

        <div className="intelbras-modal-actions">
          {onCancel && (
            <button 
              onClick={onCancel} 
              className="intelbras-modal-cancel"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm || onClose} 
            className="intelbras-modal-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelbrasModal;
