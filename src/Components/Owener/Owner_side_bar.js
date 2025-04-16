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
import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import BusinessIcon from '@mui/icons-material/Business';
import BuildIcon from '@mui/icons-material/Build';
import CollectionsIcon from '@mui/icons-material/Collections';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ShareIcon from '@mui/icons-material/Share';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function OwnerSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the UI context instead of Redux
  const { 
    isMobile, 
    isSidebarOpen, 
    activeIndex, 
    activeProfileSection,
    profileSections,
    setIsSidebarOpen, 
    setActiveIndex,
    setActiveProfileSection
  } = useUIContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => { },
  });

  const isProfilePage = location.pathname === "/Owner/Profile";

  const sliderRef = React.useRef(null);
  const profileSliderRef = React.useRef(null);
  const catRef = React.useRef(null);

  const menuItemsRef = useRef([]);
  const profileItemsRef = useRef([]);
  
  // Add this to handle refs for menu items
  const setMenuItemRef = (index) => (element) => {
    menuItemsRef.current[index] = element;
  };

  // Handle refs for profile section items
  const setProfileItemRef = (index) => (element) => {
    profileItemsRef.current[index] = element;
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

  // Get profile section icon based on section name
  const getProfileSectionIcon = (sectionName) => {
    switch(sectionName) {
      case 'User Profile':
        return <PersonIcon className="menu-icon" />;
      case 'Business Profile':
        return <BusinessIcon className="menu-icon" />;
      case 'Business Services':
        return <MiscellaneousServicesIcon className="menu-icon" />;
      case 'Portfolio':
        return <CollectionsIcon className="menu-icon" />;
      case "Equipment's":
        return <BuildIcon className="menu-icon" />;
      case "Social Media Links":
        return <ShareIcon className="menu-icon" />;
      case "Reviews":
        return <ReviewsIcon className="menu-icon" />;
      default:
        return <PersonIcon className="menu-icon" />;
    }
  };

  // Update slider position for main menu
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

  // Update profile section style handling to be simpler
  const handleProfileSectionClick = useCallback((section) => {
    setActiveProfileSection(section);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [setActiveProfileSection, isMobile, setIsSidebarOpen]);

  // Simplified back button click handler
  const handleBackButtonClick = useCallback(() => {
    navigate("/Owner");
  }, [navigate]);

  // Update slider position for profile sections - simplified
  useEffect(() => {
    if (isProfilePage && profileSliderRef.current) {
      try {
        const activeProfileSectionIndex = profileSections.findIndex(
          section => section === activeProfileSection
        );
        
        if (activeProfileSectionIndex !== -1 && profileItemsRef.current[activeProfileSectionIndex]) {
          const itemElement = profileItemsRef.current[activeProfileSectionIndex];
          const itemTop = itemElement.offsetTop;
          const itemHeight = itemElement.offsetHeight;
          
          profileSliderRef.current.style.top = `${itemTop}px`;
          profileSliderRef.current.style.height = `${itemHeight}px`;
        }
      } catch (error) {
        console.log("Error updating profile slider:", error);
      }
    }
  }, [activeProfileSection, isProfilePage, profileSections]);

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
          {activeIndex <= menuItems.length && !isProfilePage && (
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

          {!isProfilePage ? (
            // Show regular menu items when not on profile page
            menuItems.map((item, index) => (
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
                
                {/* Show sub-menu if item has sub-menu and is active */}
                {item.subMenu && index === Math.floor(activeIndex) && (
                  <div className="submenu">
                    {item.subMenu.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        className={`submenu-item ${location.pathname === subItem.path ? "active" : ""}`}
                        onClick={() => {
                          navigate(subItem.path);
                          // Update activeIndex to identify which sub-menu item is active
                          setActiveIndex(index + (subIndex + 1) / 10);
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
            ))
          ) : (
            // Show profile sections when on profile page
            <>
              {/* Back button for profile page */}
              <div 
                className="item profile-back-button"
                onClick={handleBackButtonClick}
              >
                <div className="icon">
                  <ArrowBackIcon className="menu-icon" />
                </div>
                <div className="text">Back to Dashboard</div>
              </div>
              

              {/* Profile sections container with active slider */}
              <div className="profile-sections-container">
                {/* Profile sections slider */}
                <div
                  className="active_me_slider profile-active-slider"
                  ref={profileSliderRef}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    zIndex: 0
                  }}
                ></div>
                
                {/* Profile sections items */}
                {profileSections.map((section, index) => (
                  <div 
                    key={index}
                    ref={setProfileItemRef(index)}
                    className={`item ${section === activeProfileSection ? "active profile-section-active" : "profile-section"}`}
                    onClick={() => handleProfileSectionClick(section)}
                  >
                    <div className="icon">{getProfileSectionIcon(section)}</div>
                    <div className="text">{section}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="logout_button" onClick={handleLogout}>
            <div className="icon">
              <LogoutIcon className="menu-icon" />
            </div>
            <div className="text">Logout</div>
          </div>

        </div>
      </div>

      {showDeleteConfirm.isVisible && (
        <ConfirmMessage
          title={showDeleteConfirm.message_title}
          message={showDeleteConfirm.message}
          onClose={() => {
            setShowDeleteConfirm((prevState) => ({
              ...prevState,
              isVisible: false,
            }));
          }}
          onConfirm={() => {
            showDeleteConfirm.onConfirm();
            setShowDeleteConfirm((prevState) => ({
              ...prevState,
              isVisible: false,
            }));
          }}
          onCancel={() => {
            setShowDeleteConfirm((prevState) => ({
              ...prevState,
              isVisible: false,
            }));
          }}
        />
      )}
    </>
  );
}

export default memo(OwnerSideBar);
