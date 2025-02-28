import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./css/Owner_navbar.css";
import { IoIosNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import burger_menu from "./img/burger-menu.png";
function OwnerNavbar({ searchTerm = "", setSearchTerm = () => { } }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isMobile = useSelector((state) => state.user.isMobile);
  const isSidebarOpen = useSelector((state) => state.user.isSidebarOpen);
  const [is_new_notification, set_is_new_notification] = useState(true);

  // const [realtime_notification, set_realtime_notification] = useState(false);
  const [is_show_notification_pop, set_is_show_notification_pop] = useState(true);
  const [navbar_open, set_navbar_open] = useState(false);
  const set_is_sidebar_open = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        isSidebarOpen: value,
      },
    });
  };


  const setActiveIndex = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        activeIndex: value,
      },
    });
  };
  // const pathSegments = location.pathname.split("/").slice(0, 3).join("/");

  // const navbarName =
  //   {
  //     "/Owner": "Dashboard",
  //     "/Owner/Event": "Event",
  //     "/Owner/Team": "Team",
  //     "/Owner/Invoice": "Invoice",
  //     "/Owner/Packages": "Packages And Pricing",
  //     "/Owner/search_photographer": "Photographer",
  //     "/Owner/search_photographer/:owner_email/all_photos": "Photographer > Portfolio",
  //   }[pathSegments] || "Owner Panel";

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
      const isLastItem = index === readablePath.length - 1;
      return (
        <span
          key={index}
          className={`breadcrumb-item ${isLastItem ? 'last-item' : 'previous-item'}`}
          style={{
            cursor: index < readablePath.length - 1 ? "pointer" : "default",
            color: index < readablePath.length - 1 ? "#007bff" : "black"
          }}
          onClick={() => {
            goBack(index);
          }}
        >
          {name} {index < readablePath.length - 1 ? ">" : ""}
        </span>
      );
    });



  };

  const handleNotificationClick = () => {
    set_is_new_notification(false);
    set_navbar_open(!navbar_open);
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //     set_is_show_notification_pop(false);
  //   }, 1000);
  // }, []);

  function set_temp_notification() {
    set_is_show_notification_pop(true);
    setTimeout(() => {
      set_is_show_notification_pop(false);
    }, 1000);
  }


  return (
    <>
      <div id="constant_navbar" className="constant_navbar">
        <div className="navbar_section_name">
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
          <div className="breadcrumb-container">
            {getNavbarName()}
          </div>
        </div>
        <div className="navebar_profile">
          {setSearchTerm && (
            <div className="search_bar">
              <input
                className="search_for_all_section"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  if (setSearchTerm) {
                    setSearchTerm(e.target.value);
                  }
                }}
              />
            </div>
          )}

          <div className="bell_icon" onClick={() => { handleNotificationClick(); }}>
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
        {is_show_notification_pop &&
          <div className="wrapper_for_show_layout">
            <div className={`show_layout `}></div>
          </div>
        }

      </div>
      <div className={`notifications ${navbar_open ? "active" : ""}`} id="notification_popup" >
        <p>No Notifications Available </p>
      </div>
    </>
  );
}

export default OwnerNavbar;
