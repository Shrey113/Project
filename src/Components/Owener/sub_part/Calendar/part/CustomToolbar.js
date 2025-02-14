import React from 'react';
import { Views } from 'react-big-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './CustomToolbar.css'
import { useSelector } from 'react-redux';
const CustomToolbar = (toolbar) => {
  const user = useSelector(state => state.user);
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };


  
  const label = () => {
    const date = toolbar.date;
    
    switch (toolbar.view) {
      case Views.MONTH:
        return format(date, 'MMM yyyy'); // Example: Jan 2024
      case Views.WEEK:
        return format(date, 'MMM d'); // Example: Jan 15
      case Views.DAY:
        return format(date, 'EEE, d MMM'); // Example: Mon, 15 Jan
      case 'year':
        return format(date, 'yyyy'); // Example: 2024
      default:
        return format(date, 'MMM yyyy'); // Fallback: Jan 2024
    }
  };
  
  return (
    <div className="custom-toolbar">
      <div className="toolbar-left">
        <h2 className="month-year">{label()}</h2>
        <button 
          className="toolbar-btn today-btn"
          onClick={goToCurrent}
        >
          <div className="mini-calendar">
            <div className="calendar-month">{format(new Date(), 'MMM')}</div>
            <div className="calendar-day">{format(new Date(), 'd')}</div>
          </div>
          {/* <span className="today-text">Today</span> */}
        </button>
        <div className="navigation-buttons">
          <button 
            className="toolbar-btn nav-btn" 
            onClick={goToBack}
            aria-label="Previous"
          >
            <FiChevronLeft />
          </button>
          <button 
            className="toolbar-btn nav-btn" 
            onClick={goToNext}
            aria-label="Next"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="view-dropdown">
          <select 
            className="view-select" 
            value={toolbar.view}
            onChange={(e) => toolbar.onView(e.target.value)}
          >
            <option value={Views.MONTH}>Month</option>
            <option value={Views.WEEK}>Week</option>
            <option value={Views.DAY}>Day</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div className="user-avatar">
          <img src={user.user_profile_image_base64} alt="" />
            
        </div>
      </div>
    </div>
  );
};

export default CustomToolbar; 