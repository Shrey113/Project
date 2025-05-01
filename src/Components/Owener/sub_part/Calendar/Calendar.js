import React, { useState, useEffect, useRef, useMemo, useCallback, useReducer, createContext, useContext } from 'react'
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
import EventDetailsPop from './part/EventDetailsPop'
import AddDetailsPop from './part/AddDetailsPop'
import ShowContextMenuForCalendar from './part/showContextMenuForCalendar'
import CustomToolbar from './part/CustomToolbar.js'
import './custom_css/Mui_add.css'
import './custom_css/custom_css.css'
import './Calendar.css'
import CustomYearView from './part/CustomYearView.js'

const CalendarContext = createContext(null);

const TEMPORAL_CONSTANTS = {
  SCROLL_DELAY_MS: 50,
  DEFAULT_VIEW: Views.MONTH,
  BACKGROUND_COLOR: '#6366F1',
  DAY_BACKGROUND: {
    TODAY: '#e6f3ff',
    ACTIVE: '#cce7ff',
    HOVER: '#f0f0f0'
  },
  EVENT_STYLES: {
    borderRadius: '5px',
    padding: '5px',
    fontSize: '14px',
    color: 'white'
  },
  I18N_CONFIG: {
    noEventsInRange: 'No events to display.',
    allDay: 'All Day',
    date: 'Date',
    time: 'Time',
  }
};

const DateUtilityFactory = (function() {
  return {
    createNormalizedDate: () => {
      const normalizedDate = new Date();
      normalizedDate.setHours(0, 0, 0, 0);
      return normalizedDate;
    },
    compareDates: (firstDate, secondDate) => {
      return new Date(firstDate).getTime() - new Date(secondDate).getTime();
    },
    isPastDate: (dateToCheck) => {
      const normalizedNow = DateUtilityFactory.createNormalizedDate();
      return new Date(dateToCheck) < normalizedNow;
    }
  };
})();

const EventStateActionTypes = {
  SET_EVENTS: 'SET_EVENTS',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT'
};

const eventStateReducer = (state, action) => {
  switch (action.type) {
    case EventStateActionTypes.SET_EVENTS:
      return action.payload;
    case EventStateActionTypes.ADD_EVENT:
      return [...state, action.payload];
    case EventStateActionTypes.UPDATE_EVENT:
      return state.map(event => event.id === action.payload.id ? action.payload : event);
    case EventStateActionTypes.DELETE_EVENT:
      return state.filter(event => event.id !== action.payload);
    default:
      return state;
  }
};

const useEventStateManager = (initialEvents = []) => {
  const [events, dispatch] = useReducer(eventStateReducer, initialEvents);
  
  const setEvents = useCallback((newEvents) => {
    dispatch({ type: EventStateActionTypes.SET_EVENTS, payload: newEvents });
  }, []);
  
  const addEvent = useCallback((event) => {
    dispatch({ type: EventStateActionTypes.ADD_EVENT, payload: event });
  }, []);
  
  const updateEvent = useCallback((event) => {
    dispatch({ type: EventStateActionTypes.UPDATE_EVENT, payload: event });
  }, []);
  
  const deleteEvent = useCallback((eventId) => {
    dispatch({ type: EventStateActionTypes.DELETE_EVENT, payload: eventId });
  }, []);
  
  return { events, setEvents, addEvent, updateEvent, deleteEvent };
};

const LocalizerSingleton = (() => {
  const locales = {
    'en-US': require('date-fns/locale/en-US')
  };
  
  let instance = null;
  
  return {
    getInstance: () => {
      if (!instance) {
        instance = dateFnsLocalizer({
          format,
          parse,
          startOfWeek,
          getDay,
          locales,
        });
      }
      return instance;
    }
  };
})();

const EnhancedDraggableCalendar = withDragAndDrop(BigCalendar);

const useScrollPositionManager = () => {
  const scrollPositionRef = useRef(0);
  
  const saveScrollPosition = useCallback(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
        scrollPositionRef.current = currentPosition;
        resolve(currentPosition);
      }, 0);
    });
  }, []);
  
  const restoreScrollPosition = useCallback(() => {
    return new Promise(resolve => {
      if (scrollPositionRef.current > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
          resolve(true);
        }, TEMPORAL_CONSTANTS.SCROLL_DELAY_MS);
      } else {
        resolve(false);
      }
    });
  }, []);
  
  return { scrollPositionRef, saveScrollPosition, restoreScrollPosition };
};

const useViewTransitionState = (initialView = TEMPORAL_CONSTANTS.DEFAULT_VIEW) => {
  const [view, setViewState] = useState(initialView);
  const [activeDate, setActiveDate] = useState(null);
  
  const setView = useCallback((newView) => {
    return new Promise(resolve => {
      setViewState(newView);
      resolve(newView);
    });
  }, []);
  
  return { view, setView, activeDate, setActiveDate };
};

const EventAttributeProcessor = {
  processForDisplay: (event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end)
  }),
  
  extractEventMetadata: (event) => ({
    id: event.id,
    title: event.title,
    startTime: new Date(event.start).toISOString(),
    endTime: new Date(event.end).toISOString(),
  })
};

function Calendar() {
  const user = useSelector(state => state.user);
  const { events, setEvents } = useEventStateManager([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuEvent, setContextMenuEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { view, setView, activeDate, setActiveDate } = useViewTransitionState();
  const [is_button_disabled, set_is_button_disabled] = useState(false);
  
  const calendarContainerRef = useRef(null);
  const { scrollPositionRef, saveScrollPosition, restoreScrollPosition } = useScrollPositionManager();

  const uiStateBundle = useMemo(() => ({
    showEventModal, 
    showEventDetails, 
    showContextMenu
  }), [showEventModal, showEventDetails, showContextMenu]);
  
  useEffect(() => {
    const shouldHandleScroll = Object.values(uiStateBundle).some(Boolean);
    
    const executeScrollOperations = async () => {
      if (shouldHandleScroll) {
        const position = await saveScrollPosition();
      } else {
        await restoreScrollPosition();
      }
    };
    
    executeScrollOperations();
  }, [uiStateBundle, saveScrollPosition, restoreScrollPosition]);
  
  useEffect(() => {
    const documentBodyStyleHandler = (isModalOpen) => {
      document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
    };
    
    const isAnyModalOpen = showEventDetails || showEventModal;
    documentBodyStyleHandler(isAnyModalOpen);
  }, [showEventDetails, showEventModal]);

  useEffect(() => {
    const applyMainPartHeightStrategy = () => {
      const mainPart = document.querySelector('.main_part');
      
      if (mainPart) {
        const heightStrategy = useMemo(() => {
          if (showEventModal || showEventDetails) {
            return '100vh';
          }
          return 'fit-content';
        }, [showEventModal, showEventDetails]);
        
        mainPart.style.minHeight = heightStrategy;
      }
    };
    
    applyMainPartHeightStrategy();
  }, [showEventModal, showEventDetails]);
  
  useEffect(() => {
    const initiateDataRetrieval = async () => {
      try {
        const eventServiceClient = {
          fetchUserEvents: async (userEmail) => {
            const eventRequestPayload = { user_email: userEmail };
            const eventEndpoint = `${Server_url}/calendar/events_by_user`;
            
            const response = await fetch(eventEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventRequestPayload),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Event retrieval failure');
            }
            
            return await response.json();
          }
        };
        
        if (user.user_email) {
          const rawEventData = await eventServiceClient.fetchUserEvents(user.user_email);
          const normalizedEvents = rawEventData.map(EventAttributeProcessor.processForDisplay);
          setEvents(normalizedEvents);
        }
      } catch (error) {
        console.log('Failed to fetch events: ' + error.message);
      }
    };

    initiateDataRetrieval();
  }, [user.user_email, setEvents]);

  const newEventInitialState = useMemo(() => ({
    id: events.length,
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    backgroundColor: TEMPORAL_CONSTANTS.BACKGROUND_COLOR,
    titleError: ''
  }), [events.length]);
  
  const [newEvent, setNewEvent] = useState(newEventInitialState);

  const handleDayClick = useCallback((date) => {
    const viewTransitionHandler = async () => {
      await setActiveDate(date);
      await setView(Views.DAY);
    };
    
    viewTransitionHandler();
  }, [setActiveDate, setView]);

  const openEventModal = useCallback((slotInfo) => {
    return new Promise(resolve => {
      setNewEvent(prevState => ({
        ...prevState,
        start: slotInfo.start,
        end: slotInfo.end
      }));
      setShowEventModal(true);
      resolve(true);
    });
  }, []);

  const openEventDetails = useCallback((event) => {
    return new Promise(resolve => {
      setSelectedEvent(event);
      setShowEventDetails(true);
      resolve(true);
    });
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    const slotValidationHandler = async () => {
      const normalizedDate = DateUtilityFactory.createNormalizedDate();
      
      if (DateUtilityFactory.isPastDate(slotInfo.start)) {
        await Promise.resolve(showWarningToast({message: "You cannot select past dates" }));
        return false;
      }
      
      return await openEventModal(slotInfo);
    };
    
    slotValidationHandler();
  }, [openEventModal]);

  const handleSelectEvent = useCallback((event) => {
    const eventSelectionProcessor = async () => {
      const normalizedDate = DateUtilityFactory.createNormalizedDate();
      
      const formattedEvent = EventAttributeProcessor.processForDisplay(event);
      
      const isEventInFuture = !DateUtilityFactory.isPastDate(event.start);
      setIsEditing(isEventInFuture);
      set_is_button_disabled(isEventInFuture);
      
      await openEventDetails(formattedEvent);
    };
    
    eventSelectionProcessor();
  }, [openEventDetails]);

  const CustomEvent = useCallback(({ event }) => {
    return (
      <div className='custom-event-container'>
        <strong>{event.title}</strong>
      </div>
    );
  }, []);
  
  const handleEventDrop = useCallback(async ({ event, start, end }) => {
    const eventModificationValidator = async () => {
      if (DateUtilityFactory.isPastDate(start)) {
        await Promise.resolve(showWarningToast({message: "You cannot drop past events" }));
        return false;
      }
      return true;
    };
    
    return await eventModificationValidator();
  }, []);

  const handleEventResize = useCallback(async ({ event, start, end }) => {
    const eventResizeValidator = async () => {
      if (DateUtilityFactory.isPastDate(start)) {
        await Promise.resolve(showWarningToast({message: "You cannot resize past events" }));
        return false;
      }
      return true;
    };
    
    return await eventResizeValidator();
  }, []);

  const handleEventContextMenu = useCallback((event, e) => {
    const contextMenuHandler = async () => {
      if (DateUtilityFactory.isPastDate(event.start)) {
        await Promise.resolve(showWarningToast({message: "You cannot edit past events" }));
        return false;
      }
      
      e.preventDefault();
      
      setContextMenuEvent(event);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
      return true;
    };
    
    contextMenuHandler();
  }, []);

  useEffect(() => {
    const contextMenuOutsideClickHandler = () => {
      setShowContextMenu(false);
    };

    document.addEventListener('click', contextMenuOutsideClickHandler);
    return () => {
      document.removeEventListener('click', contextMenuOutsideClickHandler);
    };
  }, []);

  const handleDateSelect = useCallback((date) => {
    const calendarViewTransition = async () => {
      const calendarApi = document.querySelector('.rbc-calendar');
      
      if (calendarApi) {
        await setView(Views.MONTH);
        
        if (typeof calendarApi.scrollTo === 'function') {
          calendarApi.scrollTo(date);
        }
      }
    };
    
    calendarViewTransition();
  }, [setView]);

  const eventPropProcessor = useCallback((event) => ({
    style: {
      ...TEMPORAL_CONSTANTS.EVENT_STYLES,
      backgroundColor: event.backgroundColor,
    },
  }), []);

  const dayPropProcessor = useCallback((date) => {
    const today = new Date();
    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isActiveDateMatch = activeDate && date.toDateString() === activeDate.toDateString();
    
    return {
      style: {
        backgroundColor: isToday 
          ? TEMPORAL_CONSTANTS.DAY_BACKGROUND.TODAY 
          : isActiveDateMatch 
            ? TEMPORAL_CONSTANTS.DAY_BACKGROUND.ACTIVE 
            : undefined,
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: TEMPORAL_CONSTANTS.DAY_BACKGROUND.HOVER,
        }
      },
      className: 'calendar-day',
      onClick: () => handleDayClick(date),
    };
  }, [activeDate, handleDayClick]);

  const calendarViewConfig = useMemo(() => ({
    month: true,
    week: true,
    day: true,
    year: CustomYearView
  }), []);

  const eventHandlers = useMemo(() => ({
    onSelectSlot: handleSelectSlot,
    onSelectEvent: handleSelectEvent,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize,
    onView: setView,
  }), [handleSelectSlot, handleSelectEvent, handleEventDrop, handleEventResize, setView]);

  const calendarComponents = useMemo(() => ({
    event: (props) => (
      <div onContextMenu={(e) => handleEventContextMenu(props.event, e)}>
        <CustomEvent {...props} />
      </div>
    ),
    toolbar: CustomToolbar
  }), [CustomEvent, handleEventContextMenu]);

  const renderCalendarContent = useMemo(() => {
    if (view === 'year') {
      return (
        <CustomYearView 
          date={new Date()} 
          events={events}
          onDateSelect={handleDateSelect}
          onView={setView}
        />
      );
    }
    
    return (
      <DndProvider backend={HTML5Backend}>
        <EnhancedDraggableCalendar
          localizer={LocalizerSingleton.getInstance()}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 100px)' }}
          {...eventHandlers}
          selectable
          resizable
          draggableAccessor={() => true}
          defaultView={TEMPORAL_CONSTANTS.DEFAULT_VIEW}
          view={view}
          views={calendarViewConfig}
          messages={TEMPORAL_CONSTANTS.I18N_CONFIG}
          components={calendarComponents}
          eventPropGetter={eventPropProcessor}
          length={30}
          dayPropGetter={dayPropProcessor}
        />
      </DndProvider>
    );
  }, [view, events, handleDateSelect, setView, eventHandlers, calendarViewConfig, calendarComponents, eventPropProcessor, dayPropProcessor]);

  const contextValue = useMemo(() => ({
    events,
    setEvents,
    showEventModal,
    setShowEventModal,
    showEventDetails,
    setShowEventDetails,
    selectedEvent,
    setSelectedEvent,
    isEditing,
    setIsEditing,
    is_button_disabled,
    contextMenuEvent,
    contextMenuPosition,
    showContextMenu,
    setShowContextMenu
  }), [
    events, 
    setEvents,
    showEventModal,
    showEventDetails,
    selectedEvent, 
    isEditing,
    is_button_disabled,
    contextMenuEvent,
    contextMenuPosition,
    showContextMenu
  ]);

  return (
    <CalendarContext.Provider value={contextValue}>
      <div className='owner-calendar-main-container' ref={calendarContainerRef}>
        {renderCalendarContent}
 
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

        {showEventModal && (
          <AddDetailsPop 
            setShowEventModal={setShowEventModal} 
            newEvent={newEvent} 
            setNewEvent={setNewEvent} 
            events={events}
            setEvents={setEvents}
          />
        )}

        {showEventDetails && selectedEvent && (
          <EventDetailsPop 
            setShowEventDetails={setShowEventDetails} 
            selectedEvent={selectedEvent}
            setEvents={setEvents} 
            events={events}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            is_button_disabled={is_button_disabled}
          />
        )}

      </div>
    </CalendarContext.Provider>
  )
}

export default Calendar
