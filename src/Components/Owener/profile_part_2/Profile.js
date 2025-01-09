import React, { useState } from 'react';
import './Profile.css';

import AddProfileData from './profile_parts/AddProfileData2'
// import AddServicesData2 from './profile_parts/AddServicesData2';
import AddBusinessData from './profile_parts/AddBusinessData';
import AddPortfolio from './profile_parts/AddPortfolio';
import AddEquipment from './profile_parts/AddEquipment';
import AddReviews from './profile_parts/AddReviews';



function Profile() {
  const [activeSection, setActiveSection] = useState('User Profile');

  const sections = ['User Profile', 'Business Profile', 'portfolio', "Equipment's", "Reviews"];

  return (
    <div className="profile-container">
      <div className="sidebar">
        {sections.map((section) => (
          <div
            key={section}
            className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </div>
        ))}
      </div>
      <div className="content">
        <div className="wrap_content">

   
        {activeSection === 'User Profile' && <AddProfileData/>}
        {activeSection === 'Business Profile' && <AddBusinessData/>}
        {activeSection === 'portfolio' && <AddPortfolio/>}
        {activeSection === "Equipment's" && <AddEquipment/>}
        {activeSection === "Reviews" && <AddReviews/>}
        </div>
  
      </div>
    </div>
  );
}

export default Profile;
