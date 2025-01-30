import React, { useEffect, useState } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './css/Owner_side_bar.css';

import user4 from './img/user4.jpg';
import app_icon from './img/app-store.png';

import close_menu from './img/close.png'

import dashboard_icon from './img/active/dashboard.png';
import dashboard_no_active_icon from './img/no_active/dashboard.png';

import Event_icon from './img/active/calendar.png'
import Event_no_active_icon  from './img/no_active/calendar.png'


import Team_icon from './img/active/group.png'
import Team_no_active_icon from './img/no_active/group.png'

import client_icon from './img/active/client.png'
import client_no_active_icon from './img/no_active/client.png'

import Packages_icon from './img/active/photo.png'
import Packages_no_active_icon from './img/no_active/photo.png'


function OwnerSideBar() {
  const dispatch = useDispatch();

    const user = useSelector((state) => state.user);
    const isMobile = useSelector((state) => state.user.isMobile);
    const isSidebarOpen = useSelector((state) => state.user.isSidebarOpen);
    const activeIndex = useSelector((state) => state.user.activeIndex);

    const set_is_sidebar_open = (value) => {
      dispatch({
        type: 'SET_USER_Owner', 
        payload: {
          isSidebarOpen: value,
        }
      });
    };
    const setActiveIndex = (value) => {
      dispatch({type: 'SET_USER_Owner', payload: {
        activeIndex: value,
      }});
    }

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);



   
  

    // const sidebarRef = useRef(null);
    const navigate = useNavigate();


    
  const handleItemClick = (index) => {
    setActiveIndex(index);
    if (isMobile) {
      set_is_sidebar_open(false);
    }
    navigate(menuItems[index].path);
  };

    const menuItems = [
        { name: 'Dashboard', icon:dashboard_icon  ,active_icon:dashboard_no_active_icon, path: '/Owner'},
        { name: 'Event Management', icon: Event_icon, active_icon: Event_no_active_icon, path: '/Owner/Event' },
        { name: 'Team Management', icon: Team_icon, active_icon: Team_no_active_icon, path: '/Owner/Team' },
        { name: 'Invoice Management', icon: client_icon ,active_icon: client_no_active_icon, path: '/Owner/Invoice'},
        { name: 'Packages and Pricing', icon: Packages_icon,active_icon: Packages_no_active_icon, path: '/Owner/Packages' },
        // { name: 'calendar ', icon: Packages_icon,active_icon: Packages_no_active_icon, path: '/Owner/calendar' },
        {
          name: "Search Photographer ",
          icon: Packages_icon,
          active_icon: Packages_no_active_icon,
          path: "/Owner/search_photographer",
        },
      ];

  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen, isMobile]);

  return (
    <>
    <div 
      className="side_bar_black_bg" 
      style={{display: (isMobile && isSidebarOpen) ? "block" : "none"}}
      onClick={() => set_is_sidebar_open(!isSidebarOpen)}
    >
    </div>
    {/* side bar */}
    <div className={`side_bar ${!isSidebarOpen ? "open_side_bar" : "close_side_bar"} 
                         ${isMobile ? 'for_mobile' : ''}`} id="OwnerSideBar">

  

    {/* close side bar button */}

    <div className="side_bar_title">
    {isMobile ? 
      <div className={`close_side_bar_button ${isSidebarOpen ? "active" : ""}`} 
      onClick={() => set_is_sidebar_open(!isSidebarOpen)}>
        <img src={close_menu} alt="Close" />
    </div>

      :



<div className="title_bar_img">
<img src={app_icon} alt="" />
</div>

    }

        <div className="title_bar_text">Owner {user.user_Status}</div>
    </div>

    <div className={`category_con ${isMobile ? 'for_mobile' : ''}`}>
      {activeIndex <= menuItems.length && 
      
    
<div
  className={`active_me_slider ${isMobile ? "for_mobile" : ""}`}
  style={{
    height: `${windowWidth <= 768 ? 50 : 60}px`,
    top: `${activeIndex * (windowWidth <= 768 ? 50 : 60)}px`,
    transition: "all 0.2s ease-in-out",
  }}
></div>

}

      {menuItems.map((item, index) => (
        <div
          key={index}
          className={`item ${index === activeIndex && "active"}`}
          onClick={() => handleItemClick(index)}
        >
          <div className="icon">
            {item.active_icon ? (
              activeIndex === index ? (
                <img src={item.active_icon} alt={item.name} />
              ) : (
                <img src={item.icon} alt={item.name} />
              )
            ) : (
              <img src={item.icon} alt={item.name} />
            )}
          </div>
            <div className={`text`}>
              {item.name}
            </div>
        </div>
      ))}
    </div>

    <div className="user_profile" onClick={() => {
        setActiveIndex(menuItems.length + 1);
        navigate('/Owner/Profile');
    }}>
      <div className="user_icon_1">
        <img src={user.user_profile_image_base64 || user4} alt="" />
      </div>
      <div className="user_data">
        <div className="user_name">{user.user_name}</div>
        <div className="user_email">{user.user_email}</div>
      </div>
    </div>


  </div>
  </>
  )
}

export default OwnerSideBar
