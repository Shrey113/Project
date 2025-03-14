import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BottomRightMenu.css";
import bottom_right_menu from "./Assets/testing.png";

const BottomRightMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const popupRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "h") {
        toggleVisibility();
      }
    };

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleNavigate = (path) => {
    navigate(path); 
  };

  const handleOpenInNewTab = (path) => {
    window.open(path, "_blank");
  };

  return (
    <div className="bottom-right-menu-container">
      <div className="menu-button" onClick={toggleMenu}>
        <img
          src={bottom_right_menu}
          alt="Menu"
          className="menu-icon"
        />
      </div>

      {isOpen && (
        <div className="menu-popup" ref={popupRef}>
          <p>Testing menu</p>
          <div className="menu-item">
            <button onClick={() => handleNavigate("/")}>Home</button>
            <button onClick={() => handleOpenInNewTab("/")}>Go</button>
          </div>
          <div className="menu-item">
            <button onClick={() => handleNavigate("/Admin2")}>Admin</button>
            <button onClick={() => handleOpenInNewTab("/Admin2")}>Go</button>
          </div>
          <div className="menu-item">
            <button onClick={() => handleNavigate("/Client/HomePage")}>Client Home</button>
            <button onClick={() => handleOpenInNewTab("/Client/HomePage")}>Go</button>
          </div>
          <div className="menu-item">
            <button onClick={() => handleNavigate("/Owner/Dashboard")}>Owner Dashboard</button>
            <button onClick={() => handleOpenInNewTab("/Owner/Dashboard")}>Go</button>
          </div>
          <div className="menu-item">
            <button onClick={() => handleNavigate("BeforeLogin")}>BeforeLogin</button>
            <button onClick={() => handleOpenInNewTab("BeforeLogin")}>Go</button>
          </div>

          <div className="menu-item">
            <button onClick={() => toggleVisibility()}>close</button>
          </div>

          <div className="menu-item">
            <button onClick={() => handleOpenInNewTab("https://drive.google.com/drive/u/2/folders/1-57j0wnCUqytJFiuN9nFGbC0FSxX9NcQ")}>Google Drive</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomRightMenu;
