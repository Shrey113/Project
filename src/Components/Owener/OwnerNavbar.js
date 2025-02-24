import React from "react";
import { useSelector } from "react-redux";
import "./css/Owner_navbar.css";
import { IoIosNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import burger_menu from "./img/burger-menu.png";
function OwnerNavbar({ searchTerm = "", setSearchTerm = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isMobile = useSelector((state) => state.user.isMobile);
  const isSidebarOpen = useSelector((state) => state.user.isSidebarOpen);
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
  const pathSegments = location.pathname.split("/").slice(0, 3).join("/");

  const navbarName =
    {
      "/Owner": "Dashboard",
      "/Owner/Event": "Event",
      "/Owner/Team": "Team", 
      "/Owner/Invoice": "Invoice",
      "/Owner/Packages": "Packages And Pricing",
      "/Owner/search_photographer": "Photographer",
    }[pathSegments] || "Owner Panel";
  return (
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
        {navbarName}
      </div>
      <div className="navebar_profile">
        {setSearchTerm && 
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
        </div>}

        <div className="bell_icon">
          <IoIosNotifications style={{ height: "25px", width: "25px" }} />
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
    </div>
  );
}

export default OwnerNavbar;
