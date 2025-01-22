import React from 'react';
import { Views } from 'react-big-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

  const label = () => {
    const date = toolbar.date;
    switch (toolbar.view) {
      case Views.MONTH:
        return format(date, 'MMMM yyyy');
      case Views.WEEK:
        return `${format(date, 'MMM, yyyy')}`;
      case Views.DAY:
        return format(date, 'EEEE , d , MMMM , yyyy');
      case 'year':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  return (
    <div className="custom-toolbar">
      <div className="toolbar-navigation">
        <button 
          className="toolbar-btn today-btn"
          onClick={goToCurrent}
        >
          Today
        </button>
      </div>
      <span className="toolbar-label">
        <button className="toolbar-btn nav-btn" onClick={goToBack}>
          <FiChevronLeft />
        </button>
        <span className="date-label">{label()}</span>
        <button className="toolbar-btn nav-btn" onClick={goToNext}>
          <FiChevronRight />
        </button>
      </span>
      <div className="toolbar-views">
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
    </div>
  );
};

export default CustomToolbar; 