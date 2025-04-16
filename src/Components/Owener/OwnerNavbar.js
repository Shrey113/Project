import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import "./css/Owner_navbar.css";
import "../Owener/sub_part/Search_photographer/Search_photographer.css"; // Import city selector CSS
import { IoIosNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import burger_menu from "./img/burger-menu.png";
import socket from "./../../redux/socket";
import { Server_url } from "../../redux/AllData";
import { PiUserCheckFill } from "react-icons/pi";
import { GrServices } from "react-icons/gr";
import { BiSearch } from "react-icons/bi";
import no_notification from "./img/no_notification.png"
import { useUIContext } from "../../redux/UIContext.js";
import { IoClose } from "react-icons/io5"; // Import close icon
import { IoArrowBack } from "react-icons/io5"; // Import back icon
// Import icons for city selector
import { TfiLocationPin } from "react-icons/tfi";
import { MdLocationCity, MdRefresh } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";

// Import city images for the selector
import ahd from "../Owener/sub_part/Search_photographer/small_data/ahd.png";
import bang from "../Owener/sub_part/Search_photographer/small_data/bang.png";
import chd from "../Owener/sub_part/Search_photographer/small_data/chd.png";
import chen from "../Owener/sub_part/Search_photographer/small_data/chen.png";
import hyd from "../Owener/sub_part/Search_photographer/small_data/hyd.png";
import koch from "../Owener/sub_part/Search_photographer/small_data/koch.png";
import kolk from "../Owener/sub_part/Search_photographer/small_data/kolk.png";
import mumbai from "../Owener/sub_part/Search_photographer/small_data/mumbai.png";
import ncr from "../Owener/sub_part/Search_photographer/small_data/ncr.png";
import pune_2 from "../Owener/sub_part/Search_photographer/small_data/pune.png";

// Popular cities data
const popularCities = [
  { name: "Mumbai", icon: mumbai },
  { name: "Delhi-NCR", icon: ncr },
  { name: "Bengaluru", icon: bang },
  { name: "Hyderabad", icon: hyd },
  { name: "Ahmedabad", icon: ahd},
  { name: "Chandigarh", icon: chd },
  { name: "Chennai", icon: chen },
  { name: "Pune", icon:pune_2},
  { name: "Kolkata", icon: kolk },
  { name: "Kochi", icon: koch }
];

// Other cities data
const otherCities = [
  "Aalo", "Addanki", "Agar Malwa", "Ahmedgarh", "Akbarpur", "Alakode", "Alibaug",
  "Abohar", "Adilabad", "Agartala", "Ahore", "Akividu", "Alangudi", "Aligarh",
  "Abu Road", "Adimali", "Agiripalli", "Aizawl", "Akluj", "Alangulam", "Alipurduar",
  "Achampet", "Adipur", "Agra", "Ajmer", "Akola", "Alappuzha", "Almora",
  "Acharapakkam", "Adoni", "Ahilyanagar (Ahmednagar)", "Akalatara", "Akot", "Alathur", "Alisar (Rajasthan)"
];

function OwnerNavbar({ searchTerm = "", setSearchTerm = () => { },
 selectedLocation = 'all', setSelectedLocation = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  // Use UI Context instead of Redux for UI-specific state
  const { isMobile, isSidebarOpen, setIsSidebarOpen } = useUIContext();

  const [is_new_notification, set_is_new_notification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef(null);

  const [temp_data, set_temp_data] = useState(null);
  
  // City selector states
  const [showCitySelector, setShowCitySelector] = useState(false);

  const [searchCity, setSearchCity] = useState("");
  const [showAllOtherCities, setShowAllOtherCities] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [detectedCity, setDetectedCity] = useState(null);
  const [detectedState, setDetectedState] = useState(null);
  const [detectedLocations, setDetectedLocations] = useState([]);

  // const [realtime_notification, set_realtime_notification] = useState(false);
  const [is_show_notification_pop, set_is_show_notification_pop] = useState(false);
  const [navbar_open, set_navbar_open] = useState(false);

  const [owner_name, set_owner_name] = useState(null);

  const [all_data, set_all_data] = useState([]);

  const [isChecked, setIsChecked] = useState(() => {
    return localStorage.getItem(`switchState_for_${user.user_email}`) === "true";
  });

  // Toggle city selector popup
  const toggleCitySelector = () => {
    setShowCitySelector(!showCitySelector);
    if (!showCitySelector) {
      setIsLocationLoading(false);
      setLocationError(null);
      setSearchCity("");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchCity("");
    setSelectedLocation("all");
    setShowCitySelector(false);
  };

  // Toggle show/hide all other cities
  const toggleOtherCities = () => {
    setShowAllOtherCities(!showAllOtherCities);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedLocation(city);
    setShowCitySelector(false);
  };

  // Select detected location (city or state)
  const selectDetectedLocation = (location) => {
    setSelectedLocation(location);
    setShowCitySelector(false);
  };

  // Detect current location
  const detectLocation = () => {
    setIsLocationLoading(true);
    setLocationError(null);
    setDetectedCity(null);
    setDetectedState(null);
    setDetectedLocations([]);
    
    if (navigator.geolocation) {
      try {
        const locationTimeout = setTimeout(() => {
          if (isLocationLoading) {
            setIsLocationLoading(false);
            setLocationError("Location request timed out. Please try again.");
          }
        }, 15000); // 15 second backup timeout

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(locationTimeout);
            const { latitude, longitude } = position.coords;
            getCityName(latitude, longitude);
          },
          (error) => {
            clearTimeout(locationTimeout);
            console.error("Error getting location:", error);
            setIsLocationLoading(false);
            
            // Set specific error message based on error code
            switch(error.code) {
              case 1: // PERMISSION_DENIED
                setLocationError("Location permission denied. Please allow location access in your browser settings.");
                break;
              case 2: // POSITION_UNAVAILABLE
                setLocationError("Location information is unavailable. Please check your device settings.");
                break;
              case 3: // TIMEOUT
                setLocationError("Location request timed out. Please try again.");
                break;
              default:
                setLocationError("Unable to detect your location. Please try again or select a city manually.");
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000 // Allow cached position up to 1 minute old
          }
        );
      } catch (e) {
        console.error("Geolocation error:", e);
        setIsLocationLoading(false);
        setLocationError("An unexpected error occurred with geolocation. Please select a city manually.");
      }
    } else {
      setLocationError("Your browser doesn't support geolocation. Please select a city manually.");
      setIsLocationLoading(false);
    }
  };

  const getCityName = async (lat, lon) => {
    try {
      // Add a fallback in case the API call fails
      const apiTimeout = setTimeout(() => {
        if (isLocationLoading) {
          setIsLocationLoading(false);
          setLocationError("Couldn't retrieve your city. Please select manually.");
        }
      }, 10000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
      );
      
      clearTimeout(apiTimeout);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Location data:", data);
      
      // Extract city and state information
      const city = 
        data.address?.city || 
        data.address?.town || 
        data.address?.village || 
        data.address?.hamlet ||
        data.address?.state_district || 
        (data.display_name ? data.display_name.split(',')[0] : null) ||
        "Unknown location";
        
      const state = 
        data.address?.state || 
        data.address?.province || 
        data.address?.region ||
        "Unknown state";

      // Store both city and state
      setDetectedCity(city);
      setDetectedState(state);
      setDetectedLocations([
        { type: 'city', name: city },
        { type: 'state', name: state }
      ]);
      
      // Log for verification
      console.log("City Name from location:", city);
      console.log("State Name from location:", state);
      
    } catch (error) {
      console.error("Error fetching city:", error);
      setLocationError("Unable to determine your city. Please select manually.");
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Close city selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCitySelector && !e.target.closest('.city-selector') && !e.target.closest('.location-toggle-button')) {
        setShowCitySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCitySelector]);

  // Determine if we're in search mode for city selector
  const isSearchActive = searchCity.trim().length > 0;
  
  // Filter other cities based on search
  const filteredOtherCities = otherCities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem(`switchState_for_${user.user_email}`, isChecked);
  }, [isChecked, user.user_email]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest("#notification_popup") &&
        !event.target.closest(".bell_icon")
      ) {
        
        console.log("auto")
        set_navbar_open(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbar_open]);

  useEffect(()=>{
    if(navbar_open){
      document.documentElement.style.overflow = "hidden";
    }else{
      document.documentElement.style.overflow = "auto";
      
    }
  },[navbar_open]);

  // Add useEffect for handling click outside search bar
  useEffect(() => {
    function handleClickOutside(event) {
      const searchBar = document.querySelector('.search_bar');
      if (window.innerWidth <= 650 &&
        searchBar &&
        !searchBar.contains(event.target) &&
        isSearchVisible) {
        setIsSearchVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible]);

  // Toggle sidebar function with explicit state
  const handleBurgerMenuClick = () => {
    console.log("Burger menu clicked, current state:", isSidebarOpen);
    // Force sidebar open on mobile, especially on first click
    if (isMobile) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const getUserNameByEmail = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner/get-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email }),
      });

      const responseData = await response.json();
      set_owner_name(responseData.user_name);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to fetch user name");
      }

      return responseData.user_name;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // Move email check to useEffect
  useEffect(() => {
    const checkAndGetUserName = async () => {
      const { pathname } = location;
      const pathSegments = pathname.split("/").filter(Boolean);
      pathSegments.map((segment) => {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(segment)) {
          getUserNameByEmail(segment);
          return segment;
        }
        return segment;
      });
    };

    checkAndGetUserName();
  }, [location]);


  const getNavbarName = () => {
    const { pathname } = location;
    const isMobile = window.innerWidth < 800; // Check if it's mobile view

    if (pathname === "/" || pathname === "/owner") {
      return "";
    }

    const pathSegments = pathname.split("/").filter(Boolean);
    const pathMap = {
      // Owner: "Dashboard",
      Event: "Event Management",
      Team: "Team Management",
      Invoice: "Invoice Management",
      Packages: "Packages & Pricing",
      search_photographer: "Photographer Search",
      all_photos: "Photographer Portfolio",
      equipment: "Equipment Requests",
      services: "Services Requests",
      equipments: "All Equipment",
      all_services: "All Services",
    };

    let readablePath = pathSegments.map((segment) => pathMap[segment] || segment);
    const packagesIndex = pathSegments.indexOf("packages");

    if (pathSegments.length >= 2 && pathSegments[1] === "Event" && pathSegments[2] === "packages") {
      readablePath[packagesIndex] = "Packages Requests";
    }
    if (pathSegments.length >= 3 && pathSegments[3] === "packages") {
      readablePath[packagesIndex] = "All Packages";
    }

    if (pathSegments.length === 1 && pathSegments[0] === "Owner") {
      return "";
    }

    if (pathSegments[0] === "Owner") {
      readablePath.shift();
    }

    const goBack = () => {
      window.history.back();
    };

    if (isMobile) {
      return (
        <span className="breadcrumb-item" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <IoArrowBack onClick={goBack} className="breadcrumb-item-icon" />
          {readablePath[readablePath.length - 1]}
        </span>
      );
    }

    return readablePath.map((name, index) => {
      return (
        <span
          key={index}
          className="breadcrumb-item"
          style={{
            cursor: index < readablePath.length - 1 ? "pointer" : "default",
            color: index < readablePath.length - 1 ? "#007bff" : "black"
          }}
          onClick={() => {
            if (index < readablePath.length - 1) goBack();
          }}
        >
          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name) && owner_name ? owner_name : name}
          {index < readablePath.length - 1 ? ">" : ""}
        </span>
      );
    });
  };

  // Wrap fetchNotificationData in useCallback to prevent recreating it on every render
  const fetchNotificationData = useCallback(async () => {
    try {
      const response = await fetch(`${Server_url}/get_all_notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.user_email }),
      })
      const data = await response.json();
      set_all_data(data.notifications);
      // Calculate unread count
      const unreadNotifications = data.notifications.filter(notification => !notification.is_seen);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.log("No notification data available:", error);
    }
  }, [user.user_email, set_all_data, setUnreadCount]);

  // Now define handleNotificationClick which uses markAllNotificationsAsSeen
  const handleNotificationClick = useCallback(() => {
    set_is_new_notification(false);
    set_navbar_open(!navbar_open);
    if (!navbar_open) {
      fetchNotificationData();
    }
  }, [set_is_new_notification, set_navbar_open, navbar_open, fetchNotificationData]);

  const renderViewPackageData = (notification) => {
    return (
      <>
        <div>
          <GrServices style={{ filter: 'brightness(0) invert(1)' }} />
          <p>{notification.notification_name || "Package Request"}</p>
        </div>
        <div>
          <PiUserCheckFill style={{ color: 'white' }} />
          <p>{notification.sender_email || "N/A"}</p>
        </div>
      </>
    );
  };

  const renderViewServiceData = (notification) => {
    return (
      <>
        <div>
          <GrServices style={{ filter: 'brightness(0) invert(1)' }} />
          <p>{notification.notification_name || "Service Request"}</p>
        </div>
        <div>
          <PiUserCheckFill style={{ color: 'white' }} />
          <p>{notification.sender_email || "N/A"}</p>
        </div>
      </>
    );
  };

  const renderViewEquipmentData = (notification) => {
    return (
      <>
        <div>
          <GrServices style={{ filter: 'brightness(0) invert(1)' }} />
          <p>{notification.notification_name || "Equipment Request"}</p>
        </div>
        <div>
          <PiUserCheckFill style={{ color: 'white' }} />
          <p>{notification.sender_email || "N/A"}</p>
        </div>
      </>
    );
  };

  // Wrap the function in useCallback to prevent it from being recreated on every render
  const set_temp_notification = useCallback((data, type) => {
    // Set unread count initially if not already set
    if (unreadCount === 0) {
      setUnreadCount(1);
    }

    set_is_show_notification_pop(true);
    set_temp_data(data);

    // Set timeout for auto close
    const timeoutId = setTimeout(() => {
      set_is_show_notification_pop(false);
    }, 5000); // Extended to 5 seconds

    // Store timeout ID to be able to clear it
    return timeoutId;
  }, [unreadCount, set_is_show_notification_pop, set_temp_data]);  // Add all dependencies

  // Handle notification popup click
  const handleNotificationPopupClick = useCallback((type) => {
    if (type === "package") {
      navigate(`/Owner/Event/packages`);
    } else if (type === "service") {
      navigate(`/Owner/Event/services`);
    } else if (type === "equipment") {
      navigate(`/Owner/Event/equipment`);
    }
    set_is_show_notification_pop(false);
  }, [navigate, set_is_show_notification_pop]);

  // Close notification popup manually
  const handleCloseNotificationPopup = useCallback(() => {
    set_is_show_notification_pop(false);
  }, [set_is_show_notification_pop]);

  // Create callbacks for socket notifications with updated dependencies
  const showNotification = useCallback((data, type) => {
    console.log("this is package notification id:", data, type);
    if (!isChecked) {
      console.log("running package notification", isChecked)
      set_temp_notification(data, type);
      console.log("running dot ", isChecked);
      set_is_new_notification(true);
    }
    fetchNotificationData();
    if (navbar_open) {
      set_is_new_notification(false);
    }
  }, [isChecked, navbar_open, set_temp_notification, set_is_new_notification, fetchNotificationData]);

  const showNotificationService = useCallback((data, type) => {
    console.log("this is service notification id:", data, type);
    if (!isChecked) {
      set_temp_notification(data, type);
      set_is_new_notification(true);
    }
    fetchNotificationData();
    if (navbar_open) {
      set_is_new_notification(false);
    }
  }, [isChecked, navbar_open, set_temp_notification, set_is_new_notification, fetchNotificationData]);

  const showNotificationEquipment = useCallback((data, type) => {
    console.log("this is equipment notification id:", data, type);
    if (!isChecked) {
      set_temp_notification(data, type);
      set_is_new_notification(true);
    }
    fetchNotificationData();
    if (navbar_open) {
      set_is_new_notification(false);
    }
  }, [isChecked, navbar_open, set_temp_notification, set_is_new_notification, fetchNotificationData]);

  // First useEffect for package notifications
  useEffect(() => {
    socket.on(`package_notification_${user.user_email}`, (data) =>
      showNotification(data.all_data, data.type)
    );

    return () => {
      socket.off(`package_notification_${user.user_email}`);
    };
  }, [user.user_email, showNotification]);

  // Second useEffect for service notification
  useEffect(() => {
    socket.on(`service_notification_${user.user_email}`, (data) =>
      showNotificationService(data.all_data, data.type)
    );

    return () => {
      socket.off(`service_notification_${user.user_email}`);
    };
  }, [user.user_email, showNotificationService]);

  // Third useEffect for equipment notification
  useEffect(() => {
    socket.on(`equipment_notification_${user.user_email}`, (data) => {
      showNotificationEquipment(data.all_data, data.type);
    });

    return () => {
      socket.off(`equipment_notification_${user.user_email}`);
    };
  }, [user.user_email, showNotificationEquipment]);

  // Add useEffect for initial notification count
  useEffect(() => {
    const getInitialNotifications = async () => {
      try {
        const response = await fetch(`${Server_url}/get_all_notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.user_email
          })
        });
        const data = await response.json();
        if (response.ok) {
          const unreadNotifications = data.notifications.filter(notification => !notification.is_seen);
          setUnreadCount(unreadNotifications.length);

          // If there are unread notifications, set is_new_notification to true
          if (unreadNotifications.length > 0) {
            set_is_new_notification(true);
          }
        }
      } catch (error) {
        console.log("No notifications avaiable:", error);
      }
    };

    if (user.user_email) {
      getInitialNotifications();
    }
  }, [user.user_email]);

  const getTimeDifference = (created_at) => {
    if (!created_at) return "N/A";

    const now = new Date();
    const createdTime = new Date(created_at);
    const diffInSeconds = Math.floor((now - createdTime) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 31536000) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }
  };


  // Global cache for profile images
  const profileImageCache = new Map();

  const RenderNotificationContent = ({ notification }) => {
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
      const loadProfileImage = async () => {
        if (!notification?.sender_email) return;

        // Check cache first
        if (profileImageCache.has(notification.sender_email)) {
          setProfileImage(profileImageCache.get(notification.sender_email));
          return;
        }

        try {
          const response = await fetch(`${Server_url}/owner/get-profile-image/${notification.sender_email}`);
          const data = await response.json();
          profileImageCache.set(notification.sender_email, data.profile_image);
          setProfileImage(data.profile_image);
        } catch (error) {
          console.error("Failed to fetch profile image:", error);
        }
      };

      loadProfileImage();

    }, [notification?.sender_email]);

    const updateNotificationIsSeen = async (notification_type) => {
      try {
        const response = await fetch(`${Server_url}/owner/update-Notification-is-seen/${notification_type}`);
        console.log("notification type ", notification_type)
        const data = await response.json();
        console.log("Notification marked as seen:", data);
      } catch (error) {
        console.error("Failed to update notification:", error);
      }
    };

    if (!notification) return null;

    const { notification_type, notification_name, sender_email, days_required, is_seen, created_at } = notification;

    return (
      <div
        className={`notification-item ${notification_type}-notification ${is_seen ? 'read' : 'unread'}`}
        onClick={() => {
          set_navbar_open(!navbar_open)
          updateNotificationIsSeen(notification.notification_type);
          if (notification_type === "package") {
            navigate(`/Owner/Event/packages`);
          } else if (notification_type === "service") {
            navigate(`/Owner/Event/services`);
          } else if (notification_type === "equipment") {
            navigate(`/Owner/Event/equipment`);
          }
        }}
      >
        {/* Left: Profile/Icon */}
        <div className="notification-left">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="notification-profile-img"
            />
          ) : (
            <div className="first_character">
              <span>{sender_email?.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Middle: Notification Content */}
        <div className="notification-middle">
          <div className="notification-user-line">
            <span className="notification-user-name">{sender_email || "N/A"}</span>
            <span className="notification-action">
              <span className="notification_name">{notification_name || "N/A"}</span>
              <div className="rounded-dot" />
              <span>{notification_type || "N/A"}</span>
            </span>
          </div>
          {/* <div className="notification-content">{location || "N/A"}</div> */}
        </div>

        {/* Right: Time */}
        <div className="notification-right">
          <span className="notification-time">
            <span>Days Required: {days_required || "N/A"}</span>
            <span className="timing">{getTimeDifference(created_at) || "N/A"}</span>
          </span>
        </div>
      </div>
    );
  };





  const handleSearchIconClick = (e) => {
    e.stopPropagation();
    setIsSearchVisible(!isSearchVisible);
  };

  useEffect(() => {
    if (showCitySelector) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [showCitySelector]);


  return (
    <div className={`owner_navbar_main_con ${isMobile ? "for_mobile" : ""}`}>
      <div className="owner_navbar_flex">
        <div
          className="burger_menu"
          onClick={handleBurgerMenuClick}
        >
          <img src={burger_menu} alt="Menu" />
        </div>
        <div className="navbar_section_name">
          {getNavbarName()}
        </div>

        <div className="navbar_profile">
          {location.pathname === "/Owner/search_photographer" && (
            <div className={`search_bar ${isSearchVisible ? "expanded" : ""}`}>
              <BiSearch
                className="search_icon"
                onClick={handleSearchIconClick}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* Location Selector Button */}
              <div className="location-selector-container">
                <button 
                  className="location-toggle-button" 
                  onClick={toggleCitySelector}
                >
                  {selectedLocation === 'all' ? 'Select Location' : selectedLocation}
                </button>
                
                {/* City Selector Popup */}
                {showCitySelector && (
                  <div className="city-selector-overlay">
                    <div className="city-selector">
                      <div className="city-selector-header">
                        <h2>Select City</h2>
                        <div className="header-actions">
                          {selectedLocation !== 'all' && (
                            <button 
                              className="clear-filter-btn" 
                              onClick={clearFilters}
                              title="Clear location filter"
                            >
                              Clear Filter
                            </button>
                          )}
                          <button 
                            className="close-city-selector" 
                            onClick={() => setShowCitySelector(false)}
                          >
                            <IoClose />
                          </button>
                        </div>
                      </div>
                      
                      <input 
                        className="search-input" 
                        placeholder="Search for your city"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)} 
                      />
                      
                      {/* Show detect location button only when not in search mode and no locations detected */}
                      {!isSearchActive && detectedLocations.length === 0 && (
                        <div 
                          className={`detect-location ${isLocationLoading ? 'loading' : ''} ${locationError ? 'error' : ''}`} 
                          onClick={!isLocationLoading ? detectLocation : undefined}
                        >
                          <div className="location-icon">
                            {isLocationLoading ? (
                              <div className="loader-circle"></div>
                            ) : (
                              <TfiLocationPin />
                            )}
                          </div>
                          <span>
                            {isLocationLoading 
                              ? "Detecting location..." 
                              : locationError 
                                ? "Location access denied" 
                                : "Detect my location"}
                          </span>
                        </div>
                      )}
                      
                      {locationError && !isSearchActive && (
                        <div className="location-error-message">
                          {locationError}
                        </div>
                      )}

                      {/* Detected Locations Section - show only when not searching */}
                      {detectedLocations.length > 0 && !isSearchActive && (
                        <div className="section detected-locations-section">
                          <div className="section-header">
                            <h2>Detected Locations</h2>
                            <button 
                              className="reload-location-btn" 
                              onClick={detectLocation}
                              title="Refresh location"
                            >
                              <MdRefresh />
                            </button>
                          </div>
                          <div className="detected-locations">
                            <div 
                              className={`detected-location ${selectedLocation === detectedCity ? 'selected' : ''}`}
                              onClick={() => selectDetectedLocation(detectedCity)}
                            >
                              <MdLocationCity className="location-type-icon" />
                              <div className="location-details">
                                <span className="location-label">City</span>
                                <span className="location-value">{detectedCity}</span>
                              </div>
                            </div>
                            
                            <div 
                              className={`detected-location ${selectedLocation === detectedState ? 'selected' : ''}`}
                              onClick={() => selectDetectedLocation(detectedState)}
                            >
                              <FaMapMarkerAlt className="location-type-icon" />
                              <div className="location-details">
                                <span className="location-label">State</span>
                                <span className="location-value">{detectedState}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Popular Cities Section - show only when not searching */}
                      {!isSearchActive && (
                        <div className="section">
                          <h2>Popular Cities</h2>
                          <div className="popular-cities">
                            {popularCities.map((city) => (
                              <div 
                                className={`city-icon ${selectedLocation === city.name ? 'selected' : ''}`}
                                key={city.name}
                                onClick={() => handleCitySelect(city.name)}
                              >
                                <div className="icon">
                                  <img src={city.icon} alt={city.name} />
                                </div>
                                <div>{city.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cities Section - always show but change title based on search */}
                      <div className="section">
                        <h2>
                          {isSearchActive 
                            ? `Search results for "${searchCity}"` 
                            : "Other Cities"}
                        </h2>
                        
                        {/* No results message */}
                        {isSearchActive && filteredOtherCities.length === 0 && (
                          <div className="no-results-message">
                            No cities found matching "{searchCity}"
                          </div>
                        )}
                        
                        <div className="other-cities">
                          {(showAllOtherCities || isSearchActive ? filteredOtherCities : filteredOtherCities.slice(0, 20)).map((city) => (
                            <div 
                              className={`city-name ${selectedLocation === city ? 'selected' : ''}`}
                              key={city}
                              onClick={() => handleCitySelect(city)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Show View All/Hide button only when not in search mode and there are more cities */}
                      {!isSearchActive && filteredOtherCities.length > 20 && (
                        <div 
                          className="toggle-cities-btn"
                          onClick={toggleOtherCities}
                        >
                          {showAllOtherCities ? "Hide All Cities" : "View All Cities"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bell_icon" onClick={handleNotificationClick}>
            <IoIosNotifications className={`bell_icon_icon ${is_new_notification ? "bell_animated" : ""}`} />
            {unreadCount > 0 && (
              <div className={`notification_count ${is_new_notification ? "show" : ""}`}>
                {unreadCount}
              </div>
            )}
          </div>

          <div className="profile" onClick={() => navigate('/Owner/Profile')}>
            <img
              src={user.user_profile_image_base64 || "https://via.placeholder.com/40"}
              alt="Profile"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
            <div className="profile_data">
              <div className="user_name">{user.user_name || "User"}</div>
              <div className="user_email">{user.user_email || "user@example.com"}</div>
            </div>
          </div>
        </div>
        {is_show_notification_pop && !navbar_open && (
          <div className="wrapper_for_show_layout">
            <div className="show_layout" onClick={() => handleNotificationPopupClick(temp_data?.notification_type)}>
              <button
                className="close-notification-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseNotificationPopup();
                }}
              >
                <IoClose />
              </button>
              {temp_data?.notification_type === "package" && renderViewPackageData(temp_data)}
              {temp_data?.notification_type === "service" && renderViewServiceData(temp_data)}
              {temp_data?.notification_type === "equipment" && renderViewEquipmentData(temp_data)}
            </div>
          </div>
        )}
      </div>
      <div className={`notifications ${navbar_open ? "active" : ""}`} id="notification_popup" >
        <div className="notification_header">
          <h2>Notifications </h2>

          <div className="switch-container">
            <p>Do not disturb</p>
            <input
              type="checkbox"
              id="toggleSwitch"
              hidden
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <label className="switch" htmlFor="toggleSwitch"></label>
          </div>
        </div>
        {all_data?.length > 0 ? (
          all_data?.map((notification, index) => (
            <div key={index} className="notification-item_for_all_notification">
              <RenderNotificationContent notification={notification} />
            </div>
          ))
        ) : (

          <div className="no_notification">
            <img src={no_notification} alt="" />
            <p>No Notifications Available</p>
          </div>

        )}
      </div>
    </div>
  );
}

export default React.memo(OwnerNavbar);
