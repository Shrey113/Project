import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./css/Owner_navbar.css";
import { IoIosNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import burger_menu from "./img/burger-menu.png";
import socket from "./../../redux/socket";
import { Server_url } from "../../redux/AllData";
import { PiUserCheckFill } from "react-icons/pi";
import { GrServices } from "react-icons/gr";
import { BiSearch } from "react-icons/bi";

function OwnerNavbar({ searchTerm = "", setSearchTerm = () => { } }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isMobile = useSelector((state) => state.user.isMobile);
  const isSidebarOpen = useSelector((state) => state.user.isSidebarOpen);
  const [is_new_notification, set_is_new_notification] = useState(false);

  const [temp_data, set_temp_data] = useState(null);

  // const [realtime_notification, set_realtime_notification] = useState(false);
  const [is_show_notification_pop, set_is_show_notification_pop] = useState(false);
  const [navbar_open, set_navbar_open] = useState(false);

  const [owner_name,set_owner_name] = useState(null);

  const [all_data, set_all_data] = useState([]);
  const set_is_sidebar_open = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        isSidebarOpen: value,
      },
    });
  };

  useEffect(() => {
  function handleClickOutside(event) {
    if (
      !navbar_open &&
      !event.target.closest("#notification_popup")  &&
      !event.target.closest(".bell_icon")
    ) {
      set_navbar_open(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [is_show_notification_pop,navbar_open]);

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


  const setActiveIndex = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        activeIndex: value,
      },
    });
  };

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

    if (pathname === "/" || pathname === "/Owner") {
      return "Dashboard";
    }

    const pathSegments = pathname.split("/").filter(Boolean);
    const pathMap = {
      Owner: "Dashboard",
      Event: "Event Management",
      Team: "Team Management",
      Invoice: "Invoice Management",
      Packages: "Packages & Pricing",
      search_photographer: "Photographer Search",
      all_photos: "Photographer Portfolio",
      equipment: "Equipment Requests",
      services: "Services Requests",
      equipments: "All Equipment",
    };
    console.log("pathSegments:", pathSegments);
    const packagesIndex = pathSegments.indexOf("packages");

    let readablePath = pathSegments.map((segment) => pathMap[segment] || segment);
    console.log("readablePath:", readablePath);

    if (pathSegments.length >= 2 && pathSegments[1] === "Event" && pathSegments[2] === "packages") {
      readablePath[packagesIndex] = "Packages Requests";
    }
    if (pathSegments.length >= 3 && pathSegments[3] === "packages") {
      readablePath[packagesIndex] = "All Packages ";
    }

    if (pathSegments.length === 1 && pathSegments[0] === "Owner") {
      return "Dashboard";
    }

    if (pathSegments[0] === "Owner") {
      readablePath.shift();
    }

    function goBack(index) {
      console.log("Index:", index);

      if (readablePath.length - 1 === index) {
        return;
      }

      let run_data = (readablePath.length - 1) - index;

      function goBackStep(step) {
        if (step > 0) {
          setTimeout(() => {
            window.history.back();
            goBackStep(step - 1);
          }, 100);
        }
      }

      goBackStep(run_data);
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
            goBack(index);
          }}
        >
          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name) && owner_name ? owner_name : name}
          {index < readablePath.length - 1 ? ">" : ""}
        </span>
      );
    });
  };

  const handleNotificationClick = () => {
    set_is_new_notification(false);
    set_navbar_open(!navbar_open);
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

  const get_all_notifications = async () => {
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

  // for package notification 

  useEffect(() => {
    const get_all_notifications = async () => {
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
    function showNotification(data, type) {
      console.log("this is package notification id:", data, type);
      set_temp_notification(data);
      get_all_notifications();
      if (navbar_open) {
        set_is_new_notification(false);
      } else {
        set_is_new_notification(true);
      }

    }
    socket.on(`package_notification_${user.user_email}`, (data) => showNotification(data.all_data, data.type));

    return () => {
      socket.off(`package_notification_${user.user_email}`, showNotification);
    };
  }, [user.user_email,navbar_open]);

  // for service notification 
  useEffect(() => {
    const get_all_notifications = async () => {
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
      set_temp_notification(data, type);
      get_all_notifications();
      if (navbar_open === true) {
        set_is_new_notification(false);
      } else {
        set_is_new_notification(true);
      }
    }
    socket.on(`service_notification_${user.user_email}`, (data) => showNotificationService(data.all_data, data.type));

    return () => {
      socket.off(`service_notification_${user.user_email}`, showNotificationService);
    };
  }, [user.user_email,navbar_open]);

  // for equipment notification 
  useEffect(() => {
    const get_all_notifications = async () => {
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
      set_temp_notification(data, type);
      get_all_notifications();
      if (navbar_open === true) {
        set_is_new_notification(false);
      } else {
        set_is_new_notification(true);
      }
    }

    socket.on(`equipment_notification_${user.user_email}`, (data) => {
      showNotificationEquipment(data.all_data, data.type);
    });

    return () => {
      socket.off(`equipment_notification_${user.user_email}`, showNotificationEquipment);
    };
  }, [user.user_email,navbar_open]);


  // function calculateDays(startDate, endDate) {
  //   if (!startDate || !endDate) return "N/A";

  //   const start = new Date(startDate);
  //   const end = new Date(endDate);

  //   const diffTime = end - start; // Difference in milliseconds
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

  //   return diffDays > 0 ? `${diffDays} days` : "0 days";
  // }


  const renderNotificationContent = (notification) => {
    return (

      <>

        {notification?.notification_type === "package" && (
          <>
            <p>id:{notification.id}</p>
            <p><strong>Package Name:</strong> {notification.notification_name || "N/A"}</p>
            <p><strong>Requested By:</strong> {notification.sender_email || "N/A"}</p>
            <p><strong>Location :</strong> {notification.location || "N/A"}</p>
            <p><strong>Days Required:</strong> {notification.days_required || "N/A"}</p>
          </>
        )}

        {notification?.notification_type === "service" && (
          <>
            <p>id:{notification.id}</p>
            <p><strong>Service Name:</strong> {notification.notification_name || "N/A"}</p>
            <p><strong>Requested By:</strong> {notification.sender_email || "N/A"}</p>
            <p><strong>Location:</strong> {notification.location || "N/A"}</p>
            <p><strong>Days Required:</strong> {notification.days_required || "N/A"}</p>
          </>
        )}

        {notification.notification_type === "equipment" && (
          <>
            <p>id:{notification.id}</p>
            <p><strong>Equipment Name:</strong> {notification.notification_name || "N/A"}</p>
            <p><strong>Requested By:</strong> {notification.sender_email || "N/A"}</p>
            <p><strong>Location:</strong> {notification.location || "N/A"}</p>
            <p><strong>Days Required:</strong> {notification.days_required || "N/A"}</p>
          </>
        )}
      </>
    );

  };


  return (
    <>
      <div id="constant_navbar" className="constant_navbar">
        <div className="navbar_section_name" style={{ cursor: "pointer" }}>
          {isMobile && (
            <div
              className="toggle_button_con"
              id="toggle_button_con_home_page"
              onClick={() => {
                set_is_sidebar_open(!isSidebarOpen);
              }}
            >
              <img src={burger_menu} alt="Menu" />
            </div>
          )}
          {getNavbarName()}
        </div>
        <div className="navbar_profile">
          {setSearchTerm &&
            <div className="search_bar">
            <BiSearch className="search_icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                if (setSearchTerm) {
                  setSearchTerm(e.target.value);
                }
              }}
            />
          </div>}

          <div className="bell_icon" onClick={() => { handleNotificationClick(); get_all_notifications(); }}>
            <IoIosNotifications style={{ height: "25px", width: "25px" }} />
            <div className={`notification_count ${is_new_notification ? "show" : ""}`}></div>
          </div>
          <div
            className="profile"
            onClick={() => {
              setActiveIndex(10);
              navigate("/Owner/Profile");
            }}
          >
            <img src={user.user_profile_image_base64} alt="" />
            <div className="profile_data">
              <div className="user_name">{user.user_name}</div>
              <div className="user_email">{user.user_email}</div>
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
        {all_data?.length > 0 ? (
          all_data?.map((notification, index) => (
            <div key={index} className="notification-item">
              {renderNotificationContent(notification)}
            </div>
          ))
        ) : (
          <p>No Notifications Available</p>
        )}
      </div>
    </>
  );
}

export default OwnerNavbar;
