import React from 'react';
import { Views } from 'react-big-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiSearch, FiSettings } from 'react-icons/fi';
import './CustomToolbar.css'

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  // const label = () => {
  //   const date = toolbar.date;
  //   switch (toolbar.view) {
  //     case Views.MONTH:
  //       return format(date, 'MMMM yyyy');
  //     case Views.WEEK:
  //       return `${format(date, 'MMM, yyyy')}`;
  //     case Views.DAY:
  //       return format(date, 'EEEE , d , MMMM , yyyy');
  //     case 'year':
  //       return format(date, 'yyyy');
  //     default:
  //       return format(date, 'MMMM yyyy');
  //   }
  // };

  return (
    <div className="custom-toolbar">
      <div className="toolbar-left">
        <h2 className="month-year">{format(toolbar.date, 'MMMM yyyy')}</h2>
        <button 
          className="toolbar-btn today-btn"
          onClick={goToCurrent}
        >
          • Today
        </button>
        <div className="navigation-buttons">
          <button className="toolbar-btn nav-btn" onClick={goToBack}>
            <FiChevronLeft />
          </button>
          <button className="toolbar-btn nav-btn" onClick={goToNext}>
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
        <button className="toolbar-btn icon-btn">
          <FiSearch />
        </button>
        <button className="toolbar-btn icon-btn">
          <FiSettings />
        </button>
        <div className="user-avatar">
          <img src="" alt="" />
          <span className="online-indicator"></span>
        </div>
      </div>
    </div>
  );
};

export default CustomToolbar; 