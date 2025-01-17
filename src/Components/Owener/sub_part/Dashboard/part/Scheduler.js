import React, { useState } from 'react';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, Inject, EventSettingsModel } from '@syncfusion/ej2-react-schedule';
import './Scheduler.css';

const Scheduler = () => {
  const [events, setEvents] = useState([]);

  const eventSettings = {
    dataSource: events,
  };

  const handleEventAdd = (e) => {
    const newEvent = {
      Id: events.length + 1,
      Subject: e.Subject,
      StartTime: e.StartTime,
      EndTime: e.EndTime,
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="scheduler-container">
      <h1>Event Scheduler</h1>
      
      <ScheduleComponent
        height="650px"
        eventSettings={eventSettings}
        selectedDate={new Date()}
        onActionBegin={handleEventAdd}
      >
        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
    </div>
  );
};

export default Scheduler;
