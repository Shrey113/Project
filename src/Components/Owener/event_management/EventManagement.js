import React, { useState } from 'react';
import './EventManagement.css';

function EventManagement() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="button_con_wrap">
      <div className="button_con">
        {/* Animated Active Button */}
        <div
          className="active_button"
          style={{ left: activeIndex * 150 + 'px' }}
        ></div>

        {/* Buttons */}
        <button onClick={() => setActiveIndex(0)}>
          <span>Add Event</span>
        </button>
        <button onClick={() => setActiveIndex(1)}>
          <span>Edit Event</span>
        </button>
        <button onClick={() => setActiveIndex(2)}>
          <span>Delete Event</span>
        </button>
      </div>
    </div>
  );
}

export default EventManagement;
