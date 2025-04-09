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
    setIsSidebarOpen,
    setActiveIndex,
    toggleSidebar
  }), [isMobile, isSidebarOpen, activeIndex, toggleSidebar]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext; 