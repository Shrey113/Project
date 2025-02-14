import React, { useEffect, useState } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './css/Owner_side_bar.css';

// import user4 from './img/user4.jpg';
import app_icon from './img/app-store.png';

// import close_menu from './img/close.png'

// import dashboard_icon from './img/active/dashboard.png';
// import dashboard_no_active_icon from './img/no_active/dashboard.png';

// import Event_icon from './img/active/calendar.png'
// import Event_no_active_icon  from './img/no_active/calendar.png'


// import Team_icon from './img/active/group.png'
// import Team_no_active_icon from './img/no_active/group.png'

// import client_icon from './img/active/client.png'
// import client_no_active_icon from './img/no_active/client.png'

// import Packages_icon from './img/active/photo.png'
// import Packages_no_active_icon from './img/no_active/photo.png'

// import logout_icon from './img/logout.png'

import { ConfirmMessage, localstorage_key_for_jwt_user_side_key } from './../../redux/AllData.js';

import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

function OwnerSideBar() {
  const dispatch = useDispatch();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => {}
  });

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
        { 
          name: 'Dashboard', 
          icon: <DashboardIcon className={`menu-icon ${activeIndex === 0 ? 'active' : ''}`} />,
          path: '/Owner'
        },
        { 
          name: 'Event Management', 
          icon: <EventIcon className={`menu-icon ${activeIndex === 1 ? 'active' : ''}`} />,
          path: '/Owner/Event' 
        },
        { 
          name: 'Team Management', 
          icon: <GroupsIcon className={`menu-icon ${activeIndex === 2 ? 'active' : ''}`} />,
          path: '/Owner/Team' 
        },
        { 
          name: 'Invoice Management', 
          icon: <ReceiptIcon className={`menu-icon ${activeIndex === 3 ? 'active' : ''}`} />,
          path: '/Owner/Invoice'
        },
        { 
          name: 'Packages and Pricing', 
          icon: <LocalOfferIcon className={`menu-icon ${activeIndex === 4 ? 'active' : ''}`} />,
          path: '/Owner/Packages' 
        },
        {
          name: "Search Photographer",
          icon: <SearchIcon className={`menu-icon ${activeIndex === 5 ? 'active' : ''}`} />,
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

  
  const handleLogout = () => {
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      onConfirm: () => {
        localStorage.removeItem(localstorage_key_for_jwt_user_side_key); // Remove admin token from localStorage
        window.location.reload(); // Reload the page to reset the app state
      }
    });
  };


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
        <MenuOpenIcon />
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
            {item.icon}
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
        {user.user_profile_image_base64 ? 
          <img src={user.user_profile_image_base64} alt="" /> :
          <PersonIcon className="default-avatar" />
        }
      </div>
      <div className="user_data">
        <div className="user_name">{user.user_name}</div>
        <div className="user_email">{user.user_email}</div>
      </div>
      <button 
        className="logout_button"
        onClick={(e) => {
          e.stopPropagation();
            handleLogout();
        }}
      >
        <LogoutIcon />
      </button>
    </div>

    {showDeleteConfirm.isVisible && ( 
        <ConfirmMessage message_title={showDeleteConfirm.message_title} message={showDeleteConfirm.message} 
          onCancel={() => setShowDeleteConfirm({...showDeleteConfirm, isVisible:false})} onConfirm={showDeleteConfirm.onConfirm} button_text="Logout"/>
      )}

  </div>
  </>
  )
}

export default OwnerSideBar
