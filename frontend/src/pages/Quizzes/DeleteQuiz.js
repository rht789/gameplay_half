import React from 'react';
import './DeleteQuiz.css';

const DeleteQuizModal = ({ isOpen, onClose, onConfirm, quizTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Are you sure you want to delete this quiz?</h2>
          <p className="modal-description">
            You are about to delete the quiz: <strong>{quizTitle}</strong>
            <br />
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-btn cancel-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="modal-btn delete-btn" 
            onClick={onConfirm}
          >
            Delete Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteQuizModal;