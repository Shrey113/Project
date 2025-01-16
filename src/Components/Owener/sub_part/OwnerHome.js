import React from 'react';
import { useSelector } from 'react-redux';
import './OwnerHome.css';
import { localstorage_key_for_jwt_user_side_key } from './../../../redux/AllData.js';
import Search from './Dashboard/part/search.js';

function OwnerHome() {
  const user = useSelector((state) => state.user);

  const handleLogout = () => {
    // Clear the JWT from local storage
    localStorage.removeItem(localstorage_key_for_jwt_user_side_key);

    window.location.reload();
    console.log("User logged out successfully!");
  };

  return (
    <div className='owner_home_page_container'>
    <Search/>
      <div className="title_bar">
        <div className="user_data">
          <div className="user_name">Hey, {user.user_name} 👋</div>
          <div className="user_message">
            Here's what's happening in your workspace
          </div>
        </div>
      </div>

      <button style={{ width: "fit-content" }} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default OwnerHome;
