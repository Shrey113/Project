import "./AllData.css";
import toast from "react-hot-toast";

import logoWithNameBlack from './../Assets/WebsitLogo/logoWithNameBlack.png'
import logoWithNameBlue from './../Assets/WebsitLogo/logoWithNameBlue.png'
import logoBlack from './../Assets/WebsitLogo/logoBlack.png'
import logoBlue from './../Assets/WebsitLogo/logoBlue.png'


export const localstorage_key_for_jwt_user_side_key =
  "Jwt_user_localstorage_key_on_photography_website";
export const localstorage_key_for_admin_login =
  "localstorage_key_for_admin_login";

// export const Server_url = "http://192.168.29.193:4000";

// export const Server_url = "http://192.168.65.233:4000";
// export const Server_url = 'http://192.168.29.34:4000';
// export const Server_url = 'http://192.168.29.193:4000';
// export const Server_url = 'http://127.0.0.1:3306';

export const Server_url = "http://localhost:4000";
export const Socket_url = 'ws://localhost:4000';


// export const Server_url = 'https://srv749838.hstgr.cloud:4000';
// export const Socket_url = 'wss://srv749838.hstgr.cloud:4000';


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

export { logoBlack, logoBlue, logoWithNameBlack, logoWithNameBlue }