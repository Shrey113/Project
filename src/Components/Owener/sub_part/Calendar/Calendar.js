import React, { useState, useEffect, useRef } from 'react'

import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { useSelector } from 'react-redux';
import { Server_url, showWarningToast } from '../../../../redux/AllData';
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { DndProvider } from 'react-dnd';


import { HTML5Backend } from 'react-dnd-html5-backend';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'


// my part files
import EventDetailsPop from './part/EventDetailsPop'
import AddDetailsPop from './part/AddDetailsPop'
import ShowContextMenuForCalendar from './part/showContextMenuForCalendar'
import CustomToolbar from './part/CustomToolbar.js'

// my css files
import './custom_css/Mui_add.css'
import './custom_css/custom_css.css'
import './Calendar.css'
import CustomYearView from './part/CustomYearView.js'

const locales = {
  'en-US': require('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const DraggableCalendar = withDragAndDrop(BigCalendar)

function Calendar() {
  const user = useSelector(state => state.user);

  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuEvent, setContextMenuEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const [is_button_disabled, set_is_button_disabled] = useState(false);

  
  // Reference to the calendar container
  const calendarContainerRef = useRef(null);
  // Ref to track the latest scroll position to avoid dependency issues
  const scrollPositionRef = useRef(0);

  // Save and restore scroll position when modals open/close
  useEffect(() => {
    const shouldHandleScroll = showEventModal || showEventDetails || showContextMenu;
    
    if (shouldHandleScroll) {
      // Get the scroll position of the calendar container or the window
      const currentPosition = window.pageYOffset || document.documentElement.scrollTop;

      scrollPositionRef.current = currentPosition;
      console.log("Saving scroll position:", currentPosition);
    } else if (scrollPositionRef.current > 0) {
      // When popups close, restore the saved scroll position
      console.log("Restoring scroll position:", scrollPositionRef.current);
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 50);
    }
  }, [showEventModal, showEventDetails, showContextMenu]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're using scrollPositionRef instead of scrollPosition state to avoid the dependency

  // Original overflow effect for body
  useEffect(() => {
    if (showEventDetails || showEventModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showEventDetails, showEventModal]);

  useEffect(() => {
    const mainPart = document.querySelector('.main_part');
    
    if (mainPart) {
      switch (true) {
        case showEventModal:
        case showEventDetails:
          mainPart.style.minHeight = '100vh';
          break;
        default:
          mainPart.style.minHeight = 'fit-content';
          break;
      }
    }
  }, [showEventModal, showEventDetails]);
  
  // Original fetchEvents effect
  useEffect(() => {
    const fetchEvents = async () => {
        try {
            const response = await fetch(`${Server_url}/calendar/events_by_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_email: user.user_email }),
            });

            const data = await response.json();

            if (response.ok) {
                // setEvents(data);
                const formated_data = data.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }));
                setEvents(formated_data);
            } else {
                console.log(data.error || 'An error occurred while fetching events');
            }
        } catch (err) {
            console.log('Failed to fetch events: ' + err.message);
        }
    };

    if (user.user_email) {
        fetchEvents();
    }
  }, [user.user_email]);

  const [newEvent, setNewEvent] = useState({
    id: events.length,
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    backgroundColor: '#6366F1',
    titleError: ''
  })

  const [activeDate, setActiveDate] = useState(null); // Keep track of the active date

  const handleDayClick = (date) => {
    setActiveDate(date); // Set the clicked date as the active date
    setView(Views.DAY);
  };

  // Custom open handlers to save scroll position
  const openEventModal = (slotInfo) => {
    setNewEvent({
      ...newEvent,
      start: slotInfo.start,
      end: slotInfo.end
    });
    setShowEventModal(true);
  }

  const openEventDetails = (event) => {
    // Save scroll position before opening details
    setSelectedEvent(event);
    setShowEventDetails(true);
  }

  const handleSelectSlot = (slotInfo) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (slotInfo.start < currentDate) {
      showWarningToast({message: "You cannot select past dates" });
      return; // Prevent creating events in the past
    }

    openEventModal(slotInfo);
  }

  const handleSelectEvent = (event) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const formattedEvent = {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    };
    
    // Allow viewing but disable editing for past events
    setIsEditing(event.start >= currentDate);
    set_is_button_disabled(event.start > currentDate);
    openEventDetails(formattedEvent);
  }

  const CustomEvent = ({ event }) => {
    return (
      <div className='custom-event-container'>
        <strong>{event.title}</strong>
      </div>
    );
  };
  
  const handleEventDrop = async ({ event, start, end }) => {
   
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 
    
    if (start < currentDate) {
        showWarningToast({message: "You cannot drop past events" });
        return; // Keep the event in its original position
    }else{
      return;
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    // return;
    // Update the event locally
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 


    if (start < currentDate) {
      showWarningToast({message: "You cannot resize past events" });
      return; // Keep the event in its original position
    }else{
      return;
    }
  };


  const handleEventContextMenu = (event, e) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (event.start < currentDate) {
      showWarningToast({message: "You cannot edit past events" });
      return; // Prevent creating events in the past
    }

    e.preventDefault();
    // Save scroll position before showing context menu
    setContextMenuEvent(event);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date) => {
    // Update the calendar view to show the selected date
    const calendarApi = document.querySelector('.rbc-calendar');
    if (calendarApi) {
      setView(Views.MONTH);
      calendarApi.scrollTo(date);
    }
  };



  return (
    <div className='owner-calendar-main-container' ref={calendarContainerRef}>
      {view === 'year' ? (
        <CustomYearView 
          date={new Date()} 
          events={events}
          onDateSelect={handleDateSelect}
          onView={setView}
        />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <DraggableCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 100px)' }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            selectable
            resizable
            draggableAccessor={() => true}
            defaultView={Views.MONTH}
            view={view}
            onView={setView}
            views={{
              month: true,
              week: true,
              day: true,
              year: CustomYearView
            }}
            messages={{
              noEventsInRange: 'No events to display.',
              allDay: 'All Day',
              date: 'Date',
              time: 'Time',
            }}
            components={{
              event: (props) => (
                <div onContextMenu={(e) => handleEventContextMenu(props.event, e)}>
                  <CustomEvent {...props} />
                </div>
              ),
              toolbar: CustomToolbar
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.backgroundColor,
                color: 'white',
                borderRadius: '5px',
                padding: '5px',
                fontSize: '14px',
              },
            })}
            length={30}
            dayPropGetter={(date) => {
              const today = new Date();
              const isToday = 
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

                const isActiveDate = activeDate && date.toDateString() === activeDate.toDateString(); // Check if date is active
              
              return {
                style: {
                  backgroundColor: isToday ? '#e6f3ff' : isActiveDate ? '#cce7ff' : undefined, // Highlight active date
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  }
                },
                className: 'calendar-day',
                onClick: () => handleDayClick(date),
              };
            }}
          />
        </DndProvider>
      )}
 
      {showContextMenu && (
    <ShowContextMenuForCalendar 
    
    contextMenuPosition={contextMenuPosition}
    contextMenuEvent={contextMenuEvent}
    setEvents={setEvents}
    events={events}
    setShowContextMenu={setShowContextMenu}
    setIsEditing={setIsEditing}
    setShowEventDetails={setShowEventDetails}
    setSelectedEvent={setSelectedEvent}
    />
      )}

      {/* Add Event pop */}
      {showEventModal && (
        <AddDetailsPop 
        setShowEventModal={setShowEventModal} 
        newEvent={newEvent} 
        setNewEvent={setNewEvent} 
        events={events}
        setEvents={setEvents}
        
        />
      )}

      {/* Event Details pop */}
      {showEventDetails && selectedEvent && (
        <EventDetailsPop 
        setShowEventDetails={setShowEventDetails} 
        selectedEvent={selectedEvent}
        setEvents={setEvents} events={events}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        is_button_disabled={is_button_disabled}
        />
      )}

    </div>
  )
}

export default Calendar
