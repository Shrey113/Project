import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './css/Owner_side_bar.css';

import user4 from './img/user4.jpg';
import app_icon from './img/app-store.png';



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


function OwnerSideBar({activeIndex, setActiveIndex}) {
    const user = useSelector((state) => state.user);
    const [isSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    
  const handleItemClick = (index) => {
    setActiveIndex(index);
    navigate(menuItems[index].path);
  };



    const menuItems = [
        { name: 'Dashboard', icon:dashboard_icon  ,active_icon:dashboard_no_active_icon, path: '/Owner'},
        { name: 'Event Management', icon: Event_icon, active_icon: Event_no_active_icon, path: '/Owner/Event' },
        { name: 'Team Management', icon: Team_icon, active_icon: Team_no_active_icon, path: '/Owner/Team' },
        { name: 'Invoice Management', icon: client_icon ,active_icon: client_no_active_icon, path: '/Owner/Invoice'},
        { name: 'Packages and Pricing', icon: Packages_icon,active_icon: Packages_no_active_icon, path: '/Owner/Packages' },
      ];
  return (
    <div className="side_bar" id='OwnerSideBar' ref={sidebarRef} style={{width: isSidebarOpen ? '340px' : '70px'}}>

    {/* <div className="toggle_button_con" onClick={()=>{setIsSidebarOpen(!isSidebarOpen)}}>
      {isSidebarOpen ?
      <img src={toggle_close_button_icon} alt="" />
      :
      <img src={ toggle_button_icon} alt="" />
      
    }
      
    </div> */}
    <div className="side_bar_title">
      <div className="title_bar_img">
        <img src={app_icon} alt="" />
      </div>
      {isSidebarOpen && <div className="title_bar_text">Owner {user.user_Status}</div>}
    </div>

    <div className="category_con">
      {activeIndex <= menuItems.length && 
      
    
      <div className={`active_me_slider ${isSidebarOpen ? '' : ''}`} style={{
          top: `${activeIndex * 60}px`,
          transition: "all 0.2s ease-in-out",
        }}>
          {isSidebarOpen && <div className="side_menu"></div>}
        </div>

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
            {isSidebarOpen && 
            <div className={`text`}>
              {item.name}
            </div>}
        </div>
      ))}
    </div>

    <div className="user_profile" onClick={() => {
        setActiveIndex(menuItems.length + 1);
        navigate('/Owner/Profile');
    }}>
      <div className="user_icon_1">
        <img src={user4} alt="" />
      </div>
      {isSidebarOpen && <div className="user_data">
        <div className="user_name">{user.user_name}</div>
        <div className="user_email">{user.user_email}</div>
      </div>}
    </div>
  </div>
  )
}

export default OwnerSideBar
