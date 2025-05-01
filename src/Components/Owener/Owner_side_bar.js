import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIContext } from "../../redux/UIContext.js";
import { logoWithNameBlue, FULL_DRIVE_LIMIT, IS_UNLIMITED } from "./../../redux/AllData.js";
import "./css/Owner_side_bar.css";

// import app_icon from "./img/app-store.png";

import {
  ConfirmMessage,
  localstorage_key_for_jwt_user_side_key,
  Server_url
} from "./../../redux/AllData.js";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
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
import HomeIcon from '@mui/icons-material/Home';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import StarIcon from '@mui/icons-material/Star';
import StorageIcon from '@mui/icons-material/Storage';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideocamIcon from '@mui/icons-material/Videocam';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useSelector } from "react-redux";





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
    driveProfileSections,
    setIsSidebarOpen,
    setActiveIndex,
    setActiveProfileSection
  } = useUIContext();

  const user = useSelector((state) => state.user);

  const userEmail = user.user_email;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => { },
  });

  const isProfilePage = location.pathname === "/Owner/Profile";
  const isDrive = location.pathname.includes("/Owner/drive");

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

  // Storage stats
  const [totalStorageSize, setTotalStorageSize] = useState(0);
  const [storageStats, setStorageStats] = useState({
    images: { size: 0, percentage: 0 },
    documents: { size: 0, percentage: 0 },
    videos: { size: 0, percentage: 0 },
    others: { size: 0, percentage: 0 }
  });
  const [showStoragePopup, setShowStoragePopup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate storage usage percentage
  const calculateUsagePercentage = () => {
    if (IS_UNLIMITED) return 0; // No percentage for unlimited

    const limitInBytes = parseStorageSize(FULL_DRIVE_LIMIT);
    return Math.min(Math.round((totalStorageSize / limitInBytes) * 100), 100);
  };

  // Parse storage size like "15GB" to bytes
  const parseStorageSize = (sizeString) => {
    if (typeof sizeString !== 'string') return 0;

    const match = sizeString.match(/^(\d+(?:\.\d+)?)([KMGT]B)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers = {
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    return value * multipliers[unit];
  };

  // Format bytes to human-readable size
  const formatStorageSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    if (showStoragePopup) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [showStoragePopup])

  const fetchStorageData = useCallback(async () => {
    if (!userEmail) return;

    try {
      setIsRefreshing(true);

      // Fetch total storage size
      const sizeResponse = await axios.post(`${Server_url}/drive/get_all_file_size`, {
        user_email: userEmail
      });
      setTotalStorageSize(sizeResponse.data);

      // Fetch storage statistics
      const statsResponse = await axios.post(`${Server_url}/drive/get_storage_stats`, {
        user_email: userEmail
      });

      // Parse storage limit from FULL_DRIVE_LIMIT
      let maxStorage = 0;
      if (!IS_UNLIMITED && FULL_DRIVE_LIMIT) {
        if (FULL_DRIVE_LIMIT.endsWith('GB')) {
          maxStorage = parseFloat(FULL_DRIVE_LIMIT) * 1024 * 1024 * 1024;
        } else if (FULL_DRIVE_LIMIT.endsWith('MB')) {
          maxStorage = parseFloat(FULL_DRIVE_LIMIT) * 1024 * 1024;
        } else if (FULL_DRIVE_LIMIT.endsWith('TB')) {
          maxStorage = parseFloat(FULL_DRIVE_LIMIT) * 1024 * 1024 * 1024 * 1024;
        }
      }

      // Get the server response
      const receivedStats = statsResponse.data;
      const usedStorage = receivedStats.usedStorage || 0;

      // IMPORTANT: Always use our frontend storage limit, ignoring the server's value
      // Override server's totalStorage with our frontend setting
      receivedStats.totalStorage = maxStorage;

      // Recalculate percentages based on correct storage limit
      if (usedStorage && maxStorage > 0) {
        receivedStats.percentageUsed = (usedStorage / maxStorage) * 100;
        receivedStats.remainingStorage = maxStorage - usedStorage;
      }

      setStorageStats(receivedStats);

      setTimeout(() => setIsRefreshing(false), 700); // Keep animation visible for a moment
    } catch (error) {
      console.error('Error fetching storage data:', error);
      setIsRefreshing(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchStorageData();
    }
  }, [userEmail, fetchStorageData]);

  // Toggle storage popup
  const toggleStoragePopup = (e) => {
    e.stopPropagation();
    setShowStoragePopup(!showStoragePopup);
  };

  // Handle refresh button click
  const handleRefreshClick = (e) => {
    e.stopPropagation();
    fetchStorageData();
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
      path: "/Owner/Event/equipment",
      subMenu: [
        // {
        //   name: "Packages",
        //   path: "/Owner/Event/packages",
        //   icon: (<LocalOfferIcon className={`menu-icon ${activeIndex === 1.1 ? "active" : ""}`} />
        //   ),
        // },
        { name: "Equipment", path: "/Owner/Event/equipment", icon: (<CameraAltIcon className={`menu-icon ${activeIndex === 1.1 ? "active" : ""}`} />), },

        {
          name: "Services", path: "/Owner/Event/services", icon: (
            <LocalOfferIcon
              className={`menu-icon ${activeIndex === 1.2 ? "active" : ""}`}
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
    // {
    //   name: "Packages",
    //   icon: (<LocalOfferIcon className={`menu-icon ${activeIndex === 4 ? "active" : ""}`} />),
    //   path: "/Owner/Packages",
    // },
    {
      name: "Search",
      icon: (<SearchIcon className={`menu-icon ${activeIndex === 4 ? "active" : ""}`} />),
      path: "/Owner/search_photographer",
    },
    {
      name: "Drive",
      icon: (<AddToDriveIcon className={`menu-icon ${activeIndex === 5 ? "active" : ""}`} />),
      path: "/Owner/drive",
    },
  ], [activeIndex]);

  // Get profile section icon based on section name
  const getProfileSectionIcon = (sectionName) => {
    switch (sectionName) {
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

  // Get drive section icon based on section name
  const getDriveSectionIcon = (sectionName) => {
    switch (sectionName) {
      case 'Drive Home':
        return <HomeIcon className="menu-icon" />;
      case 'Shared Files':
        return <FolderSharedIcon className="menu-icon" />;
      case 'Starred Items':
        return <StarIcon className="menu-icon" />;
      default:
        return <AddToDriveIcon className="menu-icon" />;
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
    if ((isProfilePage || isDrive) && profileSliderRef.current) {
      try {
        const sections = isProfilePage ? profileSections : driveProfileSections;
        const activeProfileSectionIndex = sections.findIndex(
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
  }, [activeProfileSection, isProfilePage, isDrive, profileSections, driveProfileSections]);

  // Handle drive section click
  const handleDriveSectionClick = useCallback((section) => {
    setActiveProfileSection(section);

    // Navigate to the appropriate section
    switch (section) {
      case 'Drive Home':
        navigate('/Owner/drive/home');
        break;
      case 'Shared Files':
        navigate('/Owner/drive/shared');
        break;
      case 'Starred Items':
        navigate('/Owner/drive/starred');
        break;
      default:
        navigate('/Owner/drive');
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [setActiveProfileSection, navigate, isMobile, setIsSidebarOpen]);

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
          {activeIndex <= menuItems.length && !isProfilePage && !isDrive && (
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

          {isDrive ? (
            // Show drive-specific menu
            <div className="drive-menu">
              <div
                className="item profile-back-button"
                onClick={handleBackButtonClick}
              >
                <div className="icon">
                  <ArrowBackIcon className="menu-icon" />
                </div>
                <div className="text">Back to Dashboard</div>
              </div>
              <div className="profile-sections-container">
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

                {driveProfileSections.map((section, index) => (
                  <div
                    key={index}
                    ref={setProfileItemRef(index)}
                    className={`item ${section === activeProfileSection ? "active profile-section-active" : "profile-section"}`}
                    onClick={() => handleDriveSectionClick(section)}
                  >
                    <div className="icon">{getDriveSectionIcon(section)}</div>
                    <div className="text">{section}</div>
                  </div>
                ))}
              </div>

              <div className="drive-storage-info" onClick={toggleStoragePopup}>
                <div className="storage-summary">
                  <div className="storage-icon">
                    <StorageIcon />
                  </div>
                  <div className="storage-details">
                    <div className="storage-title">Storage</div>
                    <div className="storage-text">
                      {formatStorageSize(totalStorageSize || 0)} {!IS_UNLIMITED ? `of ${FULL_DRIVE_LIMIT}` : ''}
                    </div>
                  </div>
                  <button
                    className={`storage-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                    onClick={handleRefreshClick}
                    title="Refresh storage data"
                  >
                    <RefreshIcon />
                  </button>
                </div>

                <div className="storage-progress">
                  <div className="storage-progress-bar">
                    {!IS_UNLIMITED ? (
                      <div
                        className="storage-progress-filled"
                        style={{ width: `${calculateUsagePercentage()}%` }}
                      ></div>
                    ) : (
                      <div className="storage-progress-unlimited"></div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : !isProfilePage ? (
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
                      {index === Math.floor(activeIndex) ? (
                        <KeyboardArrowDownIcon className="arrow-icon" />
                      ) : (
                        <KeyboardArrowRightIcon className="arrow-icon" />
                      )}
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
              <div
                className="item profile-back-button"
                onClick={handleBackButtonClick}
              >
                <div className="icon">
                  <ArrowBackIcon className="menu-icon" />
                </div>
                <div className="text">Back to Dashboard</div>
              </div>

              <div className="profile-sections-container">
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
      {/* Storage Details Popup */}
      {showStoragePopup && (
        <div className="storage-popup-overlay" onClick={toggleStoragePopup}>
          <div className="storage-popup" onClick={(e) => e.stopPropagation()}>
            <div className="storage-popup-header">
              <h3>Storage</h3>
              <div className="popup-header-actions">
                <button
                  className={`storage-refresh-btn-for-storage-popup ${isRefreshing ? 'refreshing' : ''}`}
                  onClick={handleRefreshClick}
                  title="Refresh storage data"
                >
                  <RefreshIcon />
                </button>
                <button className="close-popup-btn" onClick={toggleStoragePopup}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="storage-popup-content">
              <div className="storage-total">
                <div className="storage-total-header">
                  <StorageIcon className="storage-type-icon" />
                  <div className="storage-type-details">
                    <div className="storage-type-name">Total Storage</div>
                    <div className="storage-type-size">
                      {formatStorageSize(totalStorageSize || 0)} {!IS_UNLIMITED ? `of ${FULL_DRIVE_LIMIT}` : ''}
                    </div>
                  </div>
                </div>

                <div className="storage-total-progress">
                  <div className="storage-progress-bar">
                    {!IS_UNLIMITED ? (
                      <>
                        {Object.keys(storageStats || {}).map((type) => (
                          <div
                            key={type}
                            className={`storage-progress-segment storage-type-${type}`}
                            style={{ width: `${storageStats?.[type]?.percentage || 0}%` }}
                            title={`${type}: ${formatStorageSize(storageStats?.[type]?.size || 0)}`}
                          ></div>
                        ))}
                      </>
                    ) : (
                      <div className="storage-progress-unlimited"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="storage-breakdown">
                <div className="storage-type-item images">
                  <div className="storage-type-color images"></div>
                  <ImageIcon className="storage-type-icon" />
                  <div className="storage-type-details">
                    <div className="storage-type-name">Images</div>
                    <div className="storage-type-size">{formatStorageSize(storageStats?.images?.size || 0)}</div>
                  </div>
                  <div className="storage-type-percentage">{storageStats?.images?.percentage || 0}%</div>
                </div>

                <div className="storage-type-item documents">
                  <div className="storage-type-color documents"></div>
                  <PictureAsPdfIcon className="storage-type-icon" />
                  <div className="storage-type-details">
                    <div className="storage-type-name">Documents</div>
                    <div className="storage-type-size">{formatStorageSize(storageStats?.documents?.size || 0)}</div>
                  </div>
                  <div className="storage-type-percentage">{storageStats?.documents?.percentage || 0}%</div>
                </div>

                <div className="storage-type-item videos">
                  <div className="storage-type-color videos"></div>
                  <VideocamIcon className="storage-type-icon" />
                  <div className="storage-type-details">
                    <div className="storage-type-name">Videos</div>
                    <div className="storage-type-size">{formatStorageSize(storageStats?.videos?.size || 0)}</div>
                  </div>
                  <div className="storage-type-percentage">{storageStats?.videos?.percentage || 0}%</div>
                </div>

                <div className="storage-type-item others">
                  <div className="storage-type-color others"></div>
                  <DescriptionIcon className="storage-type-icon" />
                  <div className="storage-type-details">
                    <div className="storage-type-name">Others</div>
                    <div className="storage-type-size">{formatStorageSize(storageStats?.others?.size || 0)}</div>
                  </div>
                  <div className="storage-type-percentage">{storageStats?.others?.percentage || 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(OwnerSideBar);
