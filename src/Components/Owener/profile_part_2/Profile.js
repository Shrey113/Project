import React, { useEffect } from 'react';
import './Profile.css';

import AddProfileData from './profile_parts/AddProfileData2';
import AddBusinessData from './profile_parts/AddBusinessData';
import AddPortfolio from './profile_parts/AddPortfolio';
import AddEquipment from './profile_parts/AddEquipment';
import AddReviews from './profile_parts/AddReviews';
import AddBusinessServices from './profile_parts/AddBusinessServices';
import OwnerUrlList from './profile_parts/owner_url_components/OwnerUrlList';
import { useUIContext } from '../../../redux/UIContext';

function Profile() {
  const { activeProfileSection } = useUIContext();

  useEffect(() => {
    if(!activeProfileSection){
      activeProfileSection = 'User Profile';
    }
  }, [activeProfileSection]);

  return (
    <div className="profile-container-after-accept profile-without-sidebar">
      <div className="content">

        <div className="wrap_content">
          {activeProfileSection === 'User Profile' && <AddProfileData />}
          {activeProfileSection === 'Business Profile' && <AddBusinessData />}
          {activeProfileSection === "Business Services" && <AddBusinessServices />}
          {activeProfileSection === 'Portfolio' && <AddPortfolio />}
          {activeProfileSection === "Equipment's" && <AddEquipment />}
          {activeProfileSection === "Social Media Links" && <OwnerUrlList />}
          {activeProfileSection === "Reviews" && <AddReviews />}
        </div>
      </div>
    </div>
  );
}

export default Profile;
