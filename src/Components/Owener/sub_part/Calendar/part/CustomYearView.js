// CustomYearView.js
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './CustomYearView.css'

const CustomYearView = ({ date, events, onDateSelect, onView }) => {
  const [selectedYear, setSelectedYear] = useState(moment(date).year());
  const [selectedDate, setSelectedDate] = useState(moment(date));
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const goToCurrent = () => {
    setSelectedYear(moment().year());
  };

  const months = Array.from({ length: 12 }, (_, index) => moment().year(selectedYear).month(index));

  const getDaysInMonth = (month) => {
    const firstDay = month.clone().startOf('month');
    const daysInMonth = month.daysInMonth();
    const startDay = firstDay.day();
    
    const days = [];
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: firstDay.clone().subtract(startDay - i, 'days').date(), isCurrentMonth: false });
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    return days;
  };

  const handleDateClick = (day, month, e, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    
    const clickedDate = moment().year(selectedYear).month(month).date(day);
    setSelectedDate(clickedDate);

    // Find events for this date
    const dateEvents = events.filter(event => 
      moment(event.start).isSame(clickedDate, 'day')
    );

    // Set popup content and position
    const rect = e.target.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });

    setPopupContent({
      date: clickedDate,
      events: dateEvents
    });

    setShowPopup(true);

    if (onDateSelect) {
      onDateSelect(clickedDate.toDate());
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupContent(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPopup && !e.target.closest('.date-popup')) {
        handleClosePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const DatePopup = ({ content, position }) => {
    if (!content) return null;

    return (
      <div 
        className="date-popup"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y - 10}px`,
          transform: 'translateY(-100%)'
        }}
      >
        <div className="popup-header">
          <span>{content.date.format('ddd')}</span>
          <span className="popup-date">{content.date.format('D')}</span>
          <button className="close-btn" onClick={handleClosePopup}>×</button>
        </div>
        <div className="popup-content">
          {content.events.length > 0 ? (
            <div className="event-list">
              {content.events.map((event, index) => (
                <div key={index} className="event-item">
                  <span className="event-title">{event.title}</span>
                  <span className="event-description">{event.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              There are no events scheduled on this day.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="year-view-container">
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
          <button className="toolbar-btn nav-btn" onClick={handlePreviousYear}>
            <span>←</span>
          </button>
          <span className="date-label">{selectedYear}</span>
          <button className="toolbar-btn nav-btn" onClick={handleNextYear}>
            <span>→</span>
          </button>
        </span>
        <div className="toolbar-views">
          <select 
            className="view-select"
            value="year"
            onChange={(e) => onView(e.target.value)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>
      <div className="year-view">
        {months.map((month, monthIndex) => {
          const eventsInMonth = events.filter((event) => 
            moment(event.start).isSame(month, 'month')
          );
          const days = getDaysInMonth(month);
          
          return (
            <div key={month.format('MMMM')} className="month-container">
              <h3 className="month-title">{month.format('MMMM')}</h3>
              <div className="calendar-grid">
                <div className="weekday-header">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="weekday">{day}</div>
                  ))}
                </div>
                <div className="days-grid">
                  {days.map((day, index) => {
                    const hasEvent = eventsInMonth.some(event => 
                      moment(event.start).date() === day.day && day.isCurrentMonth
                    );
                    const isSelected = selectedDate.year() === selectedYear && 
                                     selectedDate.month() === monthIndex && 
                                     selectedDate.date() === day.day;
                    
                    return (
                      <div 
                        key={index} 
                        className={`day-cell 
                          ${!day.isCurrentMonth ? 'other-month' : ''} 
                          ${hasEvent ? 'has-event' : ''}
                          ${isSelected ? 'selected' : ''}
                        `}
                        onClick={(e) => handleDateClick(day.day, monthIndex, e, day.isCurrentMonth)}
                      >
                        {day.day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showPopup && <DatePopup content={popupContent} position={popupPosition} />}
    </div>
  );
};

export default CustomYearView;
