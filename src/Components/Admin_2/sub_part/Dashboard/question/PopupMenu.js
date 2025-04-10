import React, { useState } from 'react';
import './PopupMenu.css';
import { showRejectToast } from '../../../../../redux/AllData';
const PopupMenu = ({ email, handleClose, onSuccess, admin_email }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const updateUserStatus = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log(message, admin_email);
      onSuccess?.(message, admin_email);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
        showRejectToast({message: 'Failed to update status: ' + error.message})
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-container_Owner_question" onClick={handleClose}>
      <div className="popup"  onClick={(e) => e.stopPropagation()}>
        <h2>Are you sure you want to reject?</h2>
        <p className="email-display">Email: {email}</p>
        <br />
        <textarea
          placeholder="Add a message for the Owner (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="buttons">
          <button 
            onClick={updateUserStatus} 
            className="confirm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Reject'}
          </button>
          <button 
            onClick={handleClose} 
            className="close"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>
      </div>

    </div>
  );
};

export default PopupMenu;
