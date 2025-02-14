import React, { useState } from 'react';
import './Profile.css';

import AddProfileData from './profile_parts/AddProfileData2'
import AddBusinessData from './profile_parts/AddBusinessData';
import AddPortfolio from './profile_parts/AddPortfolio';
import AddEquipment from './profile_parts/AddEquipment';
import AddReviews from './profile_parts/AddReviews';
import AddBusinessServices from './profile_parts/AddBusinessServices';
import OwnerUrlList from './profile_parts/owner_url_components/OwnerUrlList';





function Profile() {

  
  const [activeSection, setActiveSection] = useState('User Profile');
  const [showMenu, setShowMenu] = useState(false);

  const sections = ['User Profile', 'Business Profile',"Business Services", 'Portfolio', "Equipment's", "Reviews", "Social Media Links"];

  return (
    <div className="profile-container-after-accept">
      <div className="profile-header-mobile" onClick={() => setShowMenu(!showMenu)}>
        <span>{activeSection}</span>
        <span className="menu-icon">{showMenu ? '▼' : '▶'}</span>
      </div>
      
      <div className={`sidebar ${showMenu ? 'show-menu' : ''}`}>
        {sections.map((section) => (
          <div
            key={section}
            className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(section);
              setShowMenu(false);
            }}
          >
            {section}
          </div>
        ))}
      </div>
      <div className="content">
        <div className="wrap_content">

   
        {activeSection === 'User Profile' && <AddProfileData/>}
        {activeSection === 'Business Profile' && <AddBusinessData/>}
        {activeSection === "Business Services" && <AddBusinessServices/>}
        {activeSection === 'Portfolio' && <AddPortfolio/>}
        {activeSection === "Equipment's" && <AddEquipment/>}
        {activeSection === "Reviews" && <AddReviews/>}
        {activeSection === "Social Media Links" && <OwnerUrlList/>}
        </div>
  
      </div>
    </div>
  );
}

export default Profile;
