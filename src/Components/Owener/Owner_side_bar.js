import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import "./css/Owner_side_bar.css";

import app_icon from "./img/app-store.png";

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
import MenuItem from "./Owner_side_bar_item";

function OwnerSideBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => { },
  });

  const user = useSelector((state) => state.user);
  const isMobile = useSelector((state) => state.user.isMobile);
  const isSidebarOpen = useSelector((state) => state.user.isSidebarOpen);
  const activeIndex = useSelector((state) => state.user.activeIndex);

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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (index) => {
    if (menuItems[index].name === 'Event') {
      // Toggle the sub-menu visibility without setting active index
      setActiveIndex(activeIndex === index ? 1 : 1.1);
      navigate(menuItems[index].path);
    } else if (menuItems[index].subMenu) {
      setActiveIndex(index);
    } else {
      const targetPath = menuItems[index].path;
      if (location.pathname !== targetPath) {
        setActiveIndex(index);
        navigate(targetPath);
      }
    }

    if (isMobile) {
      set_is_sidebar_open(false);
    }
  };

  const menuItems = [
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
  ];

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

  const handleLogout = () => {
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      onConfirm: () => {
        window.location.href = "/";
        localStorage.removeItem(localstorage_key_for_jwt_user_side_key); // Remove admin token from localStorage
        // window.location.reload();
      },
    });
  };

  return (
    <>
      <div
        className="side_bar_black_bg"
        style={{ display: isMobile && isSidebarOpen ? "block" : "none" }}
        onClick={() => set_is_sidebar_open(!isSidebarOpen)}
      ></div>
      {/* side bar */}
      <div
        className={`side_bar ${!isSidebarOpen ? "open_side_bar" : "close_side_bar"
          } 
                         ${isMobile ? "for_mobile" : ""}`}
        id="OwnerSideBar"
      >
        {/* close side bar button */}

        <div className="side_bar_title">
          {isMobile ? (
            <div
              className={`close_side_bar_button ${isSidebarOpen ? "active" : ""
                }`}
              onClick={() => set_is_sidebar_open(!isSidebarOpen)}
            >
              <MenuOpenIcon />
            </div>
          ) : (
            <div className="title_bar_img">
              <img src={app_icon} alt="" />
            </div>
          )}

          <div className="title_bar_text">Owner {user.user_Status}</div>
        </div>

        <div className={`category_con ${isMobile ? "for_mobile" : ""}`}>
          {activeIndex <= menuItems.length && (
            <div
              className={`active_me_slider ${isMobile ? "for_mobile" : ""}`}
              style={{
                height: `${windowWidth <= 768 ? 50 : 60}px`,
                top: `${Math.floor(activeIndex) * (windowWidth <= 768 ? 50 : 60)
                  }px`,
                transition: "all 0.2s ease-in-out",
              }}
            ></div>
          )}

          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              index={index}
              activeIndex={activeIndex}
              handleItemClick={handleItemClick}
              isMobile={isMobile}
              set_is_sidebar_open={set_is_sidebar_open}
              setActiveIndex={setActiveIndex}
              navigate={navigate}
            />
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
              {" "}
              <LogoutIcon
                style={{ color: "#f08080" }}
              />
            </div>

            <span className="logout_text">Logout</span>
          </button>
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
      </div>
    </>
  );
}

export default OwnerSideBar;
