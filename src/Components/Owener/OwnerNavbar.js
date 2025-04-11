import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "./css/Owner_navbar.css";
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
// import { Bell } from "lucide-react";

import { IoArrowBack } from "react-icons/io5"; // Import back icon

function OwnerNavbar({ searchTerm = "", setSearchTerm = () => { } }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  // Use UI Context instead of Redux for UI-specific state
  const { isMobile, isSidebarOpen, setIsSidebarOpen } = useUIContext();

  const [is_new_notification, set_is_new_notification] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef(null);

  const [temp_data, set_temp_data] = useState(null);

  // const [realtime_notification, set_realtime_notification] = useState(false);
  const [is_show_notification_pop, set_is_show_notification_pop] = useState(false);
  const [navbar_open, set_navbar_open] = useState(false);

  const [owner_name, set_owner_name] = useState(null);

  const [all_data, set_all_data] = useState([]);

  const [isChecked, setIsChecked] = useState(() => {
    return localStorage.getItem(`switchState_for_${user.user_email}`) === "true";
  });

  useEffect(() => {
    localStorage.setItem(`switchState_for_${user.user_email}`, isChecked);
  }, [isChecked, user.user_email]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest("#notification_popup") &&
        !event.target.closest(".bell_icon")
      ) {
        set_navbar_open(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbar_open]);

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

  async function getUserNameByEmail(user_email) {
    try {
      const response = await fetch(`${Server_url}/owner/get-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email }),
      });

      const data = await response.json();
      set_owner_name(data.user_name)


      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user name");
      }

      return data.name;
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

  const fetchNotificationData = async () => {
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
      console.log("Notification data", data.notifications);
    } catch (error) {
      console.error("Error fetching notification data:", error);
    }
  }

  const handleNotificationClick = () => {
    set_is_new_notification(false);
    set_navbar_open(!navbar_open);
    fetchNotificationData();
  };

  const renderViewPackageData = (notification) => {
    return (
      <>
        <div><GrServices style={{ height: "20px", width: "20px" }} /><p>{notification.notification_name || "N/A"}</p> </div>
        <div><PiUserCheckFill style={{ height: "20px", width: "20px" }} /> <p>{notification.sender_email || "N/A"}</p></div>
      </>
    );
  };

  const renderViewServiceData = (notification) => {
    return (
      <>
        <div> <GrServices style={{ height: "20px", width: "20px" }} /> <p> {notification.notification_name || "N/A"}</p></div>
        <div> <PiUserCheckFill style={{ height: "20px", width: "20px" }} /> <p>{notification.sender_email || "N/A"}</p></div>
      </>
    );
  };

  const renderViewEquipmentData = (notification) => {
    return (
      <>
        <div>  <GrServices style={{ height: "20px", width: "20px" }} /> <p>{notification.notification_name || "N/A"}</p> </div>
        <div><PiUserCheckFill style={{ height: "20px", width: "20px" }} /> <p> {notification.sender_email || "N/A"}</p></div>
      </>
    );
  };



  function set_temp_notification(data) {
    set_is_show_notification_pop(true);
    set_temp_data(data);

    setTimeout(() => {
      set_is_show_notification_pop(false);
    }, 3000);
  }

  // for package notification 
  useEffect(() => {
    const fetchAndUpdateNotifications = async () => {
      try {
        const response = await fetch(`${Server_url}/get_all_notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.user_email
          })
        })
        const data = await response.json();
        if (!response.ok) {
          console.log("Error:", data.message);
        }
        set_all_data(data.notifications);
        console.log("this is all data", data.notifications);
      } catch (error) {
        console.log(error)
      }
    }

    function showNotification(data, type) {
      console.log("this is package notification id:", data, type);
      if (!isChecked) {
        console.log("running package notification", isChecked)
        set_temp_notification(data, type);
        console.log("running dot ", isChecked);
        set_is_new_notification(true);
      }
      fetchAndUpdateNotifications();
      if (navbar_open) {
        set_is_new_notification(false);
      }
    }

    socket.on(`package_notification_${user.user_email}`, (data) => showNotification(data.all_data, data.type));

    return () => {
      socket.off(`package_notification_${user.user_email}`, showNotification);
    };
  }, [user.user_email, navbar_open, isChecked]);

  // for service notification 
  useEffect(() => {
    const fetchAndUpdateNotifications = async () => {
      try {
        const response = await fetch(`${Server_url}/get_all_notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.user_email
          })
        })
        const data = await response.json();
        if (!response.ok) {
          console.log("Error:", data.message);
        }
        set_all_data(data.notifications);
      } catch (error) {
        console.log(error)
      }
    }

    function showNotificationService(data, type) {
      console.log("this is serivce notification id:", data, type);
      if (!isChecked) {
        set_temp_notification(data, type);
        set_is_new_notification(true);
      }

      // set_temp_notification(data, type);
      fetchAndUpdateNotifications();
      if (navbar_open) {
        set_is_new_notification(false);
      }
    }
    socket.on(`service_notification_${user.user_email}`, (data) => showNotificationService(data.all_data, data.type));

    return () => {
      socket.off(`service_notification_${user.user_email}`, showNotificationService);
    };
  }, [user.user_email, navbar_open, isChecked]);

  // for equipment notification 
  useEffect(() => {
    const fetchAndUpdateNotifications = async () => {
      try {
        const response = await fetch(`${Server_url}/get_all_notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.user_email
          })
        })
        const data = await response.json();
        if (!response.ok) {
          console.log("Error:", data.message);
        }
        set_all_data(data.notifications);
      } catch (error) {
        console.log(error)
      }
    }


    function showNotificationEquipment(data, type) {
      console.log("this is equipment notification id:", data, type);
      if (!isChecked) {
        set_temp_notification(data, type);
        set_is_new_notification(true);
      }

      fetchAndUpdateNotifications();
      if (navbar_open) {
        set_is_new_notification(false);
      }
    }

    socket.on(`equipment_notification_${user.user_email}`, (data) => {
      showNotificationEquipment(data.all_data, data.type);
    });

    return () => {
      socket.off(`equipment_notification_${user.user_email}`, showNotificationEquipment);
    };
  }, [user.user_email, navbar_open, isChecked]);


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




  const RenderNotificationContent = ({ notification }) => {
    const [profile_image, set_profile_image] = useState(null);

    useEffect(() => {
      const get_profile_image = async () => {
        const response = await fetch(`${Server_url}/owner/get-profile-image/${notification.sender_email}`);
        const data = await response.json();
        console.log("this is profile image:", data);
        set_profile_image(data.profile_image);
      };

      get_profile_image();
    }, [notification]);


    const updateNotificationIsSeen = async (notification_id) => {
      const response = await fetch(`${Server_url}/owner/update-Notification-is-seen/${notification_id}`);
      const data = await response.json();
      console.log("this is update notification is seen:", data);
    }

    if (!notification) return null;

    const { notification_type, notification_name, sender_email, location, days_required, is_seen, created_at } = notification;

    return (
      <div
        className={`notification-item ${notification_type}-notification ${is_seen ? 'read' : 'unread'}`}
        onClick={() => {
          updateNotificationIsSeen(notification.id);
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
          {profile_image ? (
            <img
              src={`${profile_image}`}
              alt="profile"
              className="notification-profile-img"
            />
          ) :
            <div className="first_character">
              <span>{sender_email.charAt(0).toUpperCase()}</span>
            </div>
          }
        </div>

        {/* Middle: Notification Content */}
        <div className="notification-middle">
          <div className="notification-user-line">
            <span className="notification-user-name">
              {sender_email || "N/A"}
            </span>
            <span className="notification-action">
              <span>{notification_name || "N/A"}</span>
              <div className="rounded-dot" />
              <span>{notification_type || "N/A"}</span>
            </span>
          </div>

          <div className="notification-content">
            {location || "N/A"}
          </div>
        </div>

        {/* Right: Time */}
        <div className="notification-right">
          <span className="notification-time">
            <span>Days Required : {days_required || "N/A"}</span>
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
            </div>
          )}

          <div className="bell_icon" onClick={handleNotificationClick}>
            <IoIosNotifications className="bell_icon_icon" />
            <div className={`notification_count ${is_new_notification ? "show" : ""}`}></div>
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
        {is_show_notification_pop && (
          <div className="wrapper_for_show_layout">
            <div className="show_layout">
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
