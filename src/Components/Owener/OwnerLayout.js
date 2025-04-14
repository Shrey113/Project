import React from 'react';
import { useUIContext } from '../../redux/UIContext';
import './css/Owner_layout.css';

// This component provides the layout structure and applies UI context classes
const OwnerLayout = ({ children }) => {
  const { isMobile, isSidebarOpen } = useUIContext();

  // Define the correct class based on sidebar state and device type
  const layoutClasses = isMobile
    ? `Owner_main_home_pag_con for_mobile`
    : `Owner_main_home_pag_con ${!isSidebarOpen ? 'sidebar-closed' : ''}`;

  return (
    <div className={layoutClasses}>
      <div className="main_part" >
        {children}
      </div>
    </div>
  );
};

export default OwnerLayout; 