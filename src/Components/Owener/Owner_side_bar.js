import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoWithNameBlue } from "./../../redux/AllData.js";
import { useUIContext } from "../../redux/UIContext.js";

import "./css/Owner_side_bar.css";

// import app_icon from "./img/app-store.png";

import {
  ConfirmMessage,
  localstorage_key_for_jwt_user_side_key,
} from "./../../redux/AllData.js";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
// import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

function OwnerSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the UI context instead of Redux
  const { 
    isMobile, 
    isSidebarOpen, 
    activeIndex, 
    setIsSidebarOpen, 
    setActiveIndex
  } = useUIContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => { },
  });



  const sliderRef = React.useRef(null);
  const catRef = React.useRef(null);

  const menuItemsRef = useRef([]);
  
  // Add this to handle refs for menu items
  const setMenuItemRef = (index) => (element) => {
    menuItemsRef.current[index] = element;
  };

  // Memoize menu items to prevent recreation on each render
  const menuItems = React.useMemo(() => [
    {
      name: "Dashboard",
      icon: (<DashboardIcon className={`menu-icon ${activeIndex === 0 ? "active" : ""}`} />
      ),
      path: "/Owner",
    },
    {
      name: "Event",
      icon: (<EventIcon className={`menu-icon ${activeIndex === 1 ? "active" : ""}`} />
      ),
      path: "/Owner/Event/packages",
      subMenu: [
        {
          name: "Packages",
          path: "/Owner/Event/packages",
          icon: (<LocalOfferIcon className={`menu-icon ${activeIndex === 1.1 ? "active" : ""}`} />
          ),
        },
        { name: "Equipment", path: "/Owner/Event/equipment", icon: (<CameraAltIcon className={`menu-icon ${activeIndex === 1.2 ? "active" : ""}`} />), },

        {
          name: "Services", path: "/Owner/Event/services", icon: (
            <LocalOfferIcon
              className={`menu-icon ${activeIndex === 1.3 ? "active" : ""}`}
            />
          ),
        }
      ],
    },
    {
      name: "Team",
      icon: (<GroupsIcon className={`menu-icon ${activeIndex === 2 ? "active" : ""}`} />),
      path: "/Owner/Team",
    },
    {
      name: "Invoice",
      icon: (<ReceiptIcon className={`menu-icon ${activeIndex === 3 ? "active" : ""}`} />),
      path: "/Owner/Invoice",
    },
    {
      name: "Packages",
      icon: (<LocalOfferIcon className={`menu-icon ${activeIndex === 4 ? "active" : ""}`} />),
      path: "/Owner/Packages",
    },
    {
      name: "Search",
      icon: (<SearchIcon className={`menu-icon ${activeIndex === 5 ? "active" : ""}`} />),
      path: "/Owner/search_photographer",
    },
  ], [activeIndex]);



  useEffect(() => {
    if (activeIndex !== null && sliderRef.current) {
      const activeMenuIndex = Math.floor(activeIndex);
      const activeMenuItemElement = menuItemsRef.current[activeMenuIndex];
      
      if (activeMenuItemElement) {
        const itemTop = activeMenuItemElement.offsetTop;
        const itemHeight = activeMenuItemElement.offsetHeight;
        
        sliderRef.current.style.top = `${itemTop}px`;
        sliderRef.current.style.height = `${itemHeight}px`;
      }
    }
  }, [activeIndex]);

  const handleItemClick = useCallback((index) => {
    const item = menuItems[index];
    
    if (item.name === 'Event') {
      // Toggle the sub-menu visibility for Event
      setActiveIndex(activeIndex === 1 ? null : 1);
      if (activeIndex !== 1) {
        navigate(item.path);
      }
    } else if (item.subMenu) {
      // Toggle active index for items with submenus
      setActiveIndex(activeIndex === index ? null : index);
    } else {
      // For regular items just navigate
      const targetPath = item.path;
      if (location.pathname !== targetPath) {
        setActiveIndex(index);
        navigate(targetPath);
      }
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, activeIndex, setActiveIndex, setIsSidebarOpen, navigate, location.pathname, menuItems]);

  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen, isMobile]);

  const handleLogout = useCallback(() => {
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      onConfirm: () => {
        window.location.href = "/";
        localStorage.removeItem(localstorage_key_for_jwt_user_side_key);
      },
    });
  }, []);

  return (
    <>
      {/* Black overlay for mobile */}
      <div
        className="side_bar_black_bg"
        style={{ display: isMobile && isSidebarOpen ? "block" : "none" }}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      {/* Sidebar - simplified class logic */}
      <div 
        className={`side_bar ${isMobile ? "for_mobile" : ""} ${isMobile && isSidebarOpen ? "open_side_bar" : !isMobile && !isSidebarOpen ? "open_side_bar" : ""}`}
        style={{ transform: isMobile && !isSidebarOpen ? "translateX(-250px)" : !isMobile && isSidebarOpen ? "translateX(0)" : isMobile && isSidebarOpen ? "translateX(0)" : !isMobile && !isSidebarOpen ? "translateX(-250px)" : "" }}
      >
        <div className="side_bar_title">
          {isMobile ? (
            <div className="navbar_open">
              <div className="title_bar_img mobile_view">
                <img src={logoWithNameBlue} alt="" />
              </div>
              <div
                className="close_side_bar_button active"
                onClick={() => setIsSidebarOpen(false)}
              >
                <MenuOpenIcon />
              </div>
            </div>
          ) : (
            <div className="title_bar_img">
              <img src={logoWithNameBlue} alt="" />
            </div>
          )}
        </div>

        <div
          className="side_menu_options_lists"
          style={{
            color: "var(--text_white)",
            position: "relative"
          }}
          ref={catRef}
        >
          {/* Active slider positioned at the beginning */}
          {activeIndex <= menuItems.length && (
            <div
              className={`active_me_slider ${isMobile ? "for_mobile" : ""}`}
              ref={sliderRef}
              style={{
                transition: "all 0.2s ease-in-out",
                position: "absolute",
                left: 0,
                width: "100%",
                zIndex: 0
              }}
            ></div>
          )}

          {menuItems.map((item, index) => (
            <div key={index}>
              <div 
                ref={setMenuItemRef(index)}
                className={`item ${index === Math.floor(activeIndex) ? "active" : ""}`}
                onClick={() => handleItemClick(index)}
              >
                <div className="icon">{item.icon}</div>
                <div className="text">{item.name}</div>
                {item.subMenu && (
                  <div className={`submenu-arrow ${index === Math.floor(activeIndex) ? "open" : ""}`}>
                    {index === Math.floor(activeIndex) ? 
                      <KeyboardArrowDownIcon className="arrow-icon" /> : 
                      <KeyboardArrowRightIcon className="arrow-icon" />
                    }
                  </div>
                )}
              </div>
              
              {/* Render submenu if this item has one and is active */}
              {item.subMenu && index === Math.floor(activeIndex) && (
                <div className="sub-menu">
                  {item.subMenu.map((subItem, subIndex) => (
                    <div
                      key={`${index}-${subIndex}`}
                      className={`sub-item ${location.pathname === subItem.path ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(subItem.path);
                        if (isMobile) {
                          setIsSidebarOpen(false);
                        }
                      }}
                    >
                      <div className="icon">{subItem.icon}</div>
                      <div className="text">{subItem.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="user_profile"
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
        >
          <button className="logout_button">
            <div>
              <LogoutIcon style={{ color: "#f08080" }} />
            </div>
            <span className="logout_text">Logout</span>
          </button>
        </div>


      </div>
      {showDeleteConfirm.isVisible && (
          <ConfirmMessage
            message_title={showDeleteConfirm.message_title}
            message={showDeleteConfirm.message}
            onCancel={() =>
              setShowDeleteConfirm({ ...showDeleteConfirm, isVisible: false })
            }
            onConfirm={showDeleteConfirm.onConfirm}
            button_text="Logout"
          />
        )}
    </>
  );
}

// Wrap the component with React.memo to prevent unnecessary re-renders
export default memo(OwnerSideBar);
