import "./AllData.css";
import toast from "react-hot-toast";
import { useState } from "react";

import logoWithNameBlack from './../Assets/WebsitLogo/logoWithNameBlack.png'
import logoWithNameBlue from './../Assets/WebsitLogo/logoWithNameBlue.png'
import logoBlack from './../Assets/WebsitLogo/logoBlack.png'
import logoBlue from './../Assets/WebsitLogo/logoBlue.png'
import { useEffect } from "react";

export const localstorage_key_for_jwt_user_side_key =
  "Jwt_user_localstorage_key_on_photography_website";
export const localstorage_key_for_admin_login =
  "localstorage_key_for_admin_login";

// localhost  ---------------------------------------------------
export const Server_url = "http://localhost:4000";
export const Socket_url = 'ws://localhost:4000';

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
    setFormData(updated);
  };

  const handleSave = (index) => {
    const item = formData[index];
    const payload = {
      id: item.id,
      location: item.location,
      location_link: item.location_link
    };
    console.log("payload", payload)

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
        console.log('Server response:', data);
        // Reset modified flag after successful save
        const updated = [...formData];
        updated[index].original_location = item.location;
        updated[index].original_location_link = item.location_link;
        updated[index].isModified = false;
        setFormData(updated);
      })
      .catch(err => {
        console.error('Error saving data:', err);
        alert('Failed to save changes. Please try again.');
      });
  };

  const handleEditService_close = () => {
    set_boolean_edit_service(false);
  }
  return (
    <div className="wrapper_editable_service" onClick={handleEditService_close} >
      <button className="editable_service_close" onClick={handleEditService_close}>x</button>
      <div className="inner_editable_service" onClick={(e) => e.stopPropagation()}>
        {formData.map((item, index) => (
          <div key={item.id} className="service-box">
            <h3>{item.service_name}</h3>
            <p><strong>Owner Email:</strong> {item.receiver_email}</p>

            <label>
              Location:
              <input
                type="text"
                value={item.location}
                onChange={(e) => handleChange(index, 'location', e.target.value)}
              />
            </label>

            <label>
              Location Link:
              <input
                type="text"
                value={item.location_link}
                onChange={(e) => handleChange(index, 'location_link', e.target.value)}
              />
            </label>

            <button
              disabled={!item.isModified}
              onClick={() => handleSave(index)}
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { logoBlack, logoBlue, logoWithNameBlack, logoWithNameBlue }