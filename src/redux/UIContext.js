import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Create a context for UI state
const UIContext = createContext();

// Custom hook for using the UI context
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};

// Provider component for UI state
export const UIProvider = ({ children }) => {
  const location = useLocation();

  // Initialize state based on window size
  // On mobile: sidebar is closed by default
  // On desktop: sidebar is open by default
  const isMobileDevice = window.innerWidth <= 1200;
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  // Always start with the sidebar closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(isMobileDevice ? false : true);

  const [activeIndex, setActiveIndex] = useState(0);

  // Add state for profile sections
  const storedProfileSection = localStorage.getItem('activeSection_for_profile_page') || 'User Profile';
  const [activeProfileSection, setActiveProfileSection] = useState(storedProfileSection);

  // Use useMemo for profileSections to avoid recreating the array on every render
  const profileSections = useMemo(() => [
    'User Profile',
    'Business Profile',
    "Business Services",
    'Portfolio',
    "Equipment's",
    "Social Media Links",
    "Reviews"
  ], []);

  // Add drive sections
  const driveProfileSections = useMemo(() => [
    'Drive Home',
    'Shared Files',
    'Starred Items'
  ], []);

  // Update localStorage when activeProfileSection changes
  useEffect(() => {
    localStorage.setItem('activeSection_for_profile_page', activeProfileSection);
  }, [activeProfileSection]);

  // Force sidebar state reset on first render for mobile devices
  useEffect(() => {
    if (isMobileDevice) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobileDevice]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1200;
      setIsMobile(mobile);

      // On mobile devices, sidebar should be closed by default
      // On desktop devices, sidebar should be open by default
      if (mobile !== isMobile) {
        setIsSidebarOpen(!mobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Toggle sidebar function - wrap in useCallback
  const toggleSidebar = useCallback(() => {
    console.log("Toggling sidebar", !isSidebarOpen);
    setIsSidebarOpen(prev => !prev);
  }, [isSidebarOpen]);

  // Update activeIndex based on current route
  useEffect(() => {
    const updateActiveIndex = () => {
      let newActiveIndex;

      switch (location.pathname) {
        case "/Owner":
          newActiveIndex = 0;
          break;
        case "/Owner/Event":
          newActiveIndex = 1;
          break;
        case "/Owner/Team":
          newActiveIndex = 2;
          break;
        case "/Owner/Invoice":
          newActiveIndex = 3;
          break;
        case "/Owner/Packages":
          newActiveIndex = 4;
          break;
        case "/Owner/Event/packages":
          newActiveIndex = 1.1;
          break;
        case "/Owner/Event/equipment":
          newActiveIndex = 1.2;
          break;
        case "/Owner/Event/services":
          newActiveIndex = 1.3;
          break;
        case "/Owner/Profile":
          newActiveIndex = 8;
          break;
        case "/Owner/drive":
        case "/Owner/drive/home":
        case "/Owner/drive/shared":
        case "/Owner/drive/starred":
          newActiveIndex = 6;
          break;
        default:
          if (location.pathname.includes("/Owner/search_photographer")) {
            newActiveIndex = 5;
          }
          break;
      }

      // Only update if the activeIndex actually changed
      if (newActiveIndex !== undefined && newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    };

    updateActiveIndex();
  }, [location.pathname, activeIndex]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isMobile,
    isSidebarOpen,
    activeIndex,
    activeProfileSection,
    profileSections,
    driveProfileSections,
    setIsSidebarOpen,
    setActiveIndex,
    setActiveProfileSection,
    toggleSidebar
  }), [isMobile, isSidebarOpen, activeIndex, activeProfileSection, profileSections, driveProfileSections, toggleSidebar]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext; 