import "./AllData.css";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import logoWithNameBlack from './../Assets/WebsitLogo/logoWithNameBlack.png'
import logoWithNameBlue from './../Assets/WebsitLogo/logoWithNameBlue.png'
import logoBlack from './../Assets/WebsitLogo/logoBlack.png'
import logoBlue from './../Assets/WebsitLogo/logoBlue.png'

export const localstorage_key_for_jwt_user_side_key =
  "Jwt_user_localstorage_key_on_photography_website";
export const localstorage_key_for_admin_login =
  "localstorage_key_for_admin_login";

// localhost  ---------------------------------------------------
export const Server_url = "http://localhost:4000";
export const Socket_url = 'ws://localhost:4000';
export const APP_URL = "http://localhost:3000";

// praharsh  ---------------------------------------------------
// export const Server_url = 'http://192.168.29.34:4000';
// export const Socket_url = 'ws://192.168.29.34:4000';

// Shrey11_ ---------------------------------------------------
// export const Server_url = 'http://192.168.29.193:4000';
// export const Socket_url = 'ws://192.168.29.193:4000';


// Server at a build time   ---------------------------------------------------
// export const Server_url = 'https://srv749838.hstgr.cloud:4000';
// export const Socket_url = 'wss://srv749838.hstgr.cloud:4000';

//set - "1GB", "1TB", "unlimited"
export const FULL_DRIVE_LIMIT = "1GB";
export const IS_UNLIMITED = FULL_DRIVE_LIMIT === "unlimited";

export const localstorage_key_for_client = "localstorage_key_for_client";
export const localstorage_key_for_admin_settings =
  "localstorage_key_for_admin_settings";

export const ConfirmMessage = ({
  message_title,
  message,
  onCancel,
  onConfirm,
  button_text,
}) => {
  return (
    <div className="confirm-popup-overlay" onClick={onCancel}>
      <div className="confirm-popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>{message_title}</h3>
        <p>{message}</p>
        <div className="confirm-popup-buttons">
          <button onClick={onCancel}>Cancel</button>
          <button className="delete-confirm-btn" onClick={onConfirm}>
            {button_text || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};



export const showNeutralToast = (message) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#607d8b",
      color: "#fff",
      fontWeight: "bold",
    },
  });
};
export const showAcceptToast = ({ message }) => {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#4caf50",
      color: "#fff",
      fontWeight: "bold",
    },
  });
};

export const showRejectToast = ({ message }) => {
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#f44336",
      color: "#fff",
      fontWeight: "bold",
    },
  });
};

export const showWarningToast = ({ message }) => {
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#ff9800",
      color: "#fff",
      fontWeight: "bold",
    },
  });
};

export const FileLoaderToast = ({ uploadProgress }) => {
  return (
    <div className="upload-overlay">
      <div className="upload-loader-container">
        <div className="upload-loader-content">
          <div className="upload-spinner">
            <svg viewBox="25 25 50 50">
              <circle r="20" cy="50" cx="50"></circle>
            </svg>
          </div>
          <h3>Uploading Files</h3>
          <div className="upload-progress-container">
            <div
              className="upload-progress-bar"
              style={{
                width: `${uploadProgress.total ? (uploadProgress.completed / uploadProgress.total) * 100 : 0}%`
              }}
            ></div>
          </div>
          <p className="upload-progress-text">
            {uploadProgress.completed} of {uploadProgress.total} files complete
          </p>
          <p className="upload-hint">Please don't close this window</p>
        </div>
      </div>
    </div>
  );
};
export const EditableService = ({ editableData, set_boolean_edit_service }) => {
  const [formData, setFormData] = useState([]);
  const [successStates, setSuccessStates] = useState({});
  const [isLoading, setIsLoading] = useState({});

  // Initialize local form state
  useEffect(() => {
    if (editableData && Array.isArray(editableData)) {
      // Clone input data into local state
      const cloned = editableData.map(item => ({
        ...item,
        original_location: item.location,
        original_location_link: item.location_link,
        isModified: false,
      }));
      setFormData(cloned);
    }
  }, [editableData]);

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;

    // Check if modified compared to original values
    const isModified =
      updated[index].location !== updated[index].original_location ||
      updated[index].location_link !== updated[index].original_location_link;

    updated[index].isModified = isModified;
    
    // Reset success state when field is modified again
    if (isModified && successStates[updated[index].id]) {
      setSuccessStates(prev => ({
        ...prev,
        [updated[index].id]: false
      }));
    }
    
    setFormData(updated);
  };

  const handleSave = (index) => {
    const item = formData[index];
    const payload = {
      id: item.id,
      location: item.location,
      location_link: item.location_link
    };
    
    // Set loading state for this item
    setIsLoading(prev => ({
      ...prev,
      [item.id]: true
    }));

    fetch(`${Server_url}/update_location_service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update');
        return res.json();
      })
      .then(data => {
        // Reset modified flag after successful save
        const updated = [...formData];
        updated[index].original_location = item.location;
        updated[index].original_location_link = item.location_link;
        updated[index].isModified = false;
        setFormData(updated);
        
        // Set success state for this item
        setSuccessStates(prev => ({
          ...prev,
          [item.id]: true
        }));
        
        // Clear loading state
        setIsLoading(prev => ({
          ...prev,
          [item.id]: false
        }));
        
        // Clear success state after 3 seconds
        setTimeout(() => {
          setSuccessStates(prev => ({
            ...prev,
            [item.id]: false
          }));
        }, 3000);
      })
      .catch(err => {
        console.error('Error saving data:', err);
        
        // Clear loading state
        setIsLoading(prev => ({
          ...prev,
          [item.id]: false
        }));
      });
  };

  const handleEditService_close = () => {
    set_boolean_edit_service(false);
  };

  return (
    <div className="editable-service-overlay" onClick={handleEditService_close}>
      <div className="editable-service-container" onClick={(e) => e.stopPropagation()}>
        <div className="editable-service-header">
          <h2>Edit Service Locations</h2>
          <button className="editable-service-close-btn" onClick={handleEditService_close}>
            <IoCloseOutline size={24} />
          </button>
        </div>
        
        <div className="editable-service-content">
          {formData.length === 0 ? (
            <div className="editable-service-empty">
              <p>No services available to edit</p>
            </div>
          ) : (
            <div className="editable-service-grid">
              {formData.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`editable-service-card ${item.isModified ? 'modified' : ''} ${successStates[item.id] ? 'success' : ''}`}
                >
                  <div className="editable-service-card-header">
                    <h3>{item.service_name || 'Service'}</h3>
                    {successStates[item.id] && (
                      <span className="save-success-indicator">Updated successfully</span>
                    )}
                  </div>
                  
                  <div className="editable-service-details">
                    <p className="service-owner">
                      <strong>Owner:</strong> {item.receiver_email}
                    </p>
                    
                    <div className="form-group">
                      <label htmlFor={`location-${item.id}`}>
                        Location:
                      </label>
                      <input
                        id={`location-${item.id}`}
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => handleChange(index, 'location', e.target.value)}
                        placeholder="Enter location"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`location-link-${item.id}`}>
                        Location Link:
                      </label>
                      <input
                        id={`location-link-${item.id}`}
                        type="url"
                        value={item.location_link || ''}
                        onChange={(e) => handleChange(index, 'location_link', e.target.value)}
                        placeholder="Enter location URL"
                      />
                    </div>
                  </div>
                  
                  <div className="editable-service-actions">
                    <button
                      className={`save-button ${!item.isModified ? 'disabled' : ''} ${isLoading[item.id] ? 'loading' : ''}`}
                      disabled={!item.isModified || isLoading[item.id]}
                      onClick={() => handleSave(index)}
                    >
                      {isLoading[item.id] ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export { logoBlack, logoBlue, logoWithNameBlack, logoWithNameBlue }