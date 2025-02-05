import { useState, useEffect } from "react";
import "./AllData.css";
import tick_mark from "./tick-mark.png";
import close from "./close.png";
import warning from "./warning.png";

export const localstorage_key_for_jwt_user_side_key =
  "Jwt_user_localstorage_key_on_photography_website";
export const localstorage_key_for_admin_login =
  "localstorage_key_for_admin_login";

export const Server_url = 'http://localhost:4000';
// export const Server_url = "http://192.168.29.193:4000";
// export const Server_url = 'http://127.0.0.1:3306';
export const localstorage_key_for_client = "localstorage_key_for_client";
export const localstorage_key_for_admin_settings =
  "localstorage_key_for_admin_settings";

export const SuccessMessage = ({ message, setState }) => {
  const [successMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setState();
        }, 600);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, setState]);

  return successMessage ? (
    <div className={`success_message ${isVisible ? "show" : "hide"}`}>
      <img src={tick_mark} alt="" />
      <div className="content_for_success">
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#5a7252" }}>
          SUCCESS!
        </div>
        <div style={{ fontSize: "14px", color: "#94a68d" }}>
          {successMessage}
        </div>
      </div>
    </div>
  ) : null;
};

export const RejectMessage = ({ message, setState }) => {
  const [rejectMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setState();
        }, 600);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, setState]);

  return rejectMessage ? (
    <div className={`reject_message ${isVisible ? "show" : "hide"}`}>
      <img src={close} alt="" />
      <div className="content_for_reject">
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#ba453f" }}>
          REJECT!
        </div>
        <div style={{ fontSize: "14px", color: "#c7605b" }}>
          {rejectMessage}
        </div>
      </div>
    </div>
  ) : null;
};

export const WarningMessage = ({ message, setState }) => {
  const [warningMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setState();
        }, 600);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, setState]);

  return warningMessage ? (
    <div className={`warning_message ${isVisible ? "show" : "hide"}`}>
      <img src={warning} alt="" />
      <div className="content_for_warning">
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#97702e" }}>
          WARNING!
        </div>
        <div style={{ fontSize: "14px", color: "#b79f6d" }}>
          {warningMessage}
        </div>
      </div>
    </div>
  ) : null;
};
