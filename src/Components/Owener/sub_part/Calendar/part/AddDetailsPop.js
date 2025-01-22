import React from 'react'
import './AddDetailsPop.css'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector } from 'react-redux';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

import { Server_url } from '../../../../../redux/AllData';

// Create a custom theme for the date picker
const theme = createTheme({
    palette: {
      primary: {
        main: '#4f46e5',
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4f46e5',
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#6b7280',
          },
        },
      },
    },
  });
  
  const colorOptions = [
    { id: 'purple', value: '#6366F1', label: 'Purple' },
    { id: 'green', value: '#22C55E', label: 'Green' },
    { id: 'orange', value: '#F59E0B', label: 'Orange' },
    { id: 'red', value: '#EF4444', label: 'Red' }
  ];


const AddDetailsPop = ({setShowEventModal, newEvent, setNewEvent, events, setEvents}) => {

  const user = useSelector(state => state.user);

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


    const validateForm = () => {
        if (!newEvent.title.trim()) {
          setNewEvent(prev => ({ ...prev, titleError: 'Event title is required' }));
          return false;
        }
        if (newEvent.title.trim().length < 3) {
          setNewEvent(prev => ({ ...prev, titleError: 'Title must be at least 3 characters' }));
          return false;
        }
        return true;
      };
    
      const handleAddEvent = (e) => {
        e.preventDefault();
    
        if (validateForm()) {
 
            fetch(`${Server_url}/calendar/add-event`, {
                method: 'POST', // Using POST to create a new event
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_email: user.user_email, 
                    title: newEvent.title,
                    start: newEvent.start,
                    end: newEvent.end,
                    description: newEvent.description,
                    backgroundColor: newEvent.backgroundColor,
                })
            })
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
              if(data.message === 'Event created successfully'){
                fetchEvents();
                setShowEventModal(false);
                setNewEvent({
                  title: '',
                  start: new Date(),
                  end: new Date(),
                  description: '',
                  backgroundColor: '#6366F1',
                  titleError: ''
              });
              }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    };
    

  return (
    <div className='modal-overlay_add_event'>
    <div className='modal-content'>
      <button 
        className='modal-close' 
        onClick={() => setShowEventModal(false)}
      >
        ×
      </button>
      <h2>Add New Event</h2>
      <form onSubmit={handleAddEvent}>
        <div className="form-field">
          <label className="form-label">Event Title</label>
          <input
            className="event-title-input"
            type="text"
            placeholder="Enter event title"
            value={newEvent.title}
            onChange={(e) => {
              setNewEvent({
                ...newEvent,
                title: e.target.value,
                titleError: ''
              });
            }}
          />
          {newEvent.titleError && <p className="error-text">{newEvent.titleError}</p>}
        </div>

        <div className="date-time-container">
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="date-input-group">
                <label>Start Date</label>
                <DatePicker
                  value={dayjs(newEvent.start)}
                  onChange={(newValue) => {
                    const newDate = newValue.toDate();
                    const currentTime = dayjs(newEvent.start);
                    newDate.setHours(currentTime.hour(), currentTime.minute());
                    setNewEvent({
                      ...newEvent,
                      start: newDate,
                      end: newValue.isAfter(dayjs(newEvent.end)) ? newDate : newEvent.end
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      className: 'modern-date-picker'
                    },
                  }}
                  minDate={dayjs()}
                  format="MMM D, YYYY"
                />
                <MobileTimePicker
                  value={dayjs(newEvent.start)}
                  onChange={(newValue) => {
                    setNewEvent({
                      ...newEvent,
                      start: newValue.toDate(),
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      className: 'modern-date-picker'
                    },
                  }}
                  format="hh:mm A"
                />
              </div>
              <div className="date-input-group">
                <label>End Date</label>
                <DatePicker
                  value={dayjs(newEvent.end)}
                  onChange={(newValue) => {
                    const newDate = newValue.toDate();
                    const currentTime = dayjs(newEvent.end);
                    newDate.setHours(currentTime.hour(), currentTime.minute());
                    setNewEvent({
                      ...newEvent,
                      end: newDate
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      className: 'modern-date-picker'
                    },
                  }}
                  minDate={dayjs(newEvent.start)}
                  format="MMM D, YYYY"
                />
                <MobileTimePicker
                  value={dayjs(newEvent.end)}
                  onChange={(newValue) => {
                    setNewEvent({
                      ...newEvent,
                      end: newValue.toDate()
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      className: 'modern-date-picker'
                    },
                  }}
                  format="hh:mm A"
                />
              </div>
            </LocalizationProvider>
          </ThemeProvider>
        </div>

        <div className="form-field">
          <label className="form-label">Description</label>
          <textarea
            className="event-description"
            placeholder="Enter event description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            rows="2"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Event Color</label>
          <div className="color-selector">
            {colorOptions.map((color) => (
              <div
                key={color.id}
                className={`color-option ${newEvent.backgroundColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => setNewEvent({...newEvent, backgroundColor: color.value})}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className='modal-actions'>
          <button type="submit">Add Event</button>
          <button type="button" onClick={() => setShowEventModal(false)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
  )
}

export default AddDetailsPop
