import React,{useState} from 'react'
import format from 'date-fns/format'
import './EventDetailsPop.css'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { Server_url } from '../../../../../redux/AllData';

const EventDetailsPop = ({ setShowEventDetails, selectedEvent,setEvents, events,isEditing,setIsEditing }) => {

    const [editedEvent, setEditedEvent] = useState({ ...selectedEvent });

    const handleDeleteEvent = async (eventId) => {
      try {
          const response = await fetch(`${Server_url}/calendar/events/${eventId}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          const data = await response.json();
          if(data.message === 'Event deleted successfully'){
            setEvents(events.filter(event => event.id !== eventId));
            setShowEventDetails(false);
          }else if(data.error){
            alert(data.error)
          }

      } catch (err) {
          console.error('Error deleting event:', err.message);
      }
  };
  


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateTimeChange = (newValue, field) => {
        setEditedEvent(prev => ({
            ...prev,
            [field]: newValue.toDate()
        }));
    };

    const handleColorChange = (e) => {
        setEditedEvent(prev => ({
            ...prev,
            backgroundColor: e.target.value
        }));
    };


    const handleSaveEvent = async () => {
      try {
          // Create the updated event object with all required fields
          const updatedEvent = {
              id: editedEvent.id,
              title: editedEvent.title || '',
              start: editedEvent.start,
              end: editedEvent.end,
              description: editedEvent.description || '',
              backgroundColor: editedEvent.backgroundColor || '#6366F1',
              titleError: ''
          };
  
          // Send PUT request to update the event on the server
          const response = await fetch(`${Server_url}/calendar/events/${editedEvent.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedEvent),
          });
  
          const data = await response.json();
          if(data.message === 'Event updated successfully'){
            setEvents(prevEvents => 
                prevEvents.map(event => 
                      event.id === updatedEvent.id ? updatedEvent : event
                  )
              );
              setIsEditing(false);
              setShowEventDetails(false);
          } else if(data.error){
            alert(data.error)
          }
      } catch (err) {
          console.error('Error saving event:', err.message);
      }
  };
  

    // Add theme configuration
    const theme = createTheme({
        palette: {
            primary: {
                main: '#6366F1',
            },
        },
    });

    // Add this helper to get today's date at the start of the day
    const today = dayjs().startOf('day');

  return (
    <div className='modal-overlay_event_details'>
      <div className='modal-content'>
        <button 
          className='modal-close' 
          onClick={() => setShowEventDetails(false)}
        >
          ×
        </button>
        <h2 className="event-title">{isEditing ? 'Edit Event' : selectedEvent.title}</h2>
        <div className='event-details'>
          <div className="form-group">
            <label>Event Title</label>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedEvent.title}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter event title"
              />
            ) : (
              <p className="detail-text">{selectedEvent.title}</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Start Date & Time</label>
              {isEditing ? (
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="datetime-picker-group">
                            <DatePicker
                                value={dayjs(editedEvent.start)}
                                onChange={(newValue) => handleDateTimeChange(newValue, 'start')}
                                className="form-control"
                                format="MMM DD, YYYY"
                                minDate={today}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        size: "small"
                                    }
                                }}
                            />
                            <MobileTimePicker
                                value={dayjs(editedEvent.start)}
                                onChange={(newValue) => handleDateTimeChange(newValue, 'start')}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        size: "small"
                                    }
                                }}
                            />
                        </div>
                    </LocalizationProvider>
                </ThemeProvider>
              ) : (
                <p className="detail-text">
                    {format(selectedEvent.start, 'MMM dd, yyyy hh:mm a')}
                </p>
              )}
            </div>

            <div className="form-group half">
              <label>End Date & Time</label>
              {isEditing ? (
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="datetime-picker-group">
                            <DatePicker
                                value={dayjs(editedEvent.end)}
                                onChange={(newValue) => handleDateTimeChange(newValue, 'end')}
                                minDate={dayjs(editedEvent.start)}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        size: "small"
                                    }
                                }}
                            />
                            <MobileTimePicker
                                value={dayjs(editedEvent.end)}
                                onChange={(newValue) => handleDateTimeChange(newValue, 'end')}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        size: "small"
                                    }
                                }}
                            />
                        </div>
                    </LocalizationProvider>
                </ThemeProvider>
              ) : (
                <p className="detail-text">
                    {format(selectedEvent.end, 'MMM dd, yyyy hh:mm a')}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={editedEvent.description || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter event description"
                rows="4"
              />
            ) : (
              <p className="detail-text">
                {selectedEvent.description || 'No description provided'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Event Color</label>
            {isEditing ? (
              <div className="color-options">
                <div 
                  className={`color-circle ${editedEvent.backgroundColor === '#6366F1' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#6366F1' }}
                  onClick={() => handleColorChange({ target: { value: '#6366F1' } })}
                />
                <div 
                  className={`color-circle ${editedEvent.backgroundColor === '#22C55E' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#22C55E' }}
                  onClick={() => handleColorChange({ target: { value: '#22C55E' } })}
                />
                <div 
                  className={`color-circle ${editedEvent.backgroundColor === '#F59E0B' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#F59E0B' }}
                  onClick={() => handleColorChange({ target: { value: '#F59E0B' } })}
                />
                <div 
                  className={`color-circle ${editedEvent.backgroundColor === '#EF4444' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#EF4444' }}
                  onClick={() => handleColorChange({ target: { value: '#EF4444' } })}
                />
              </div>
            ) : (
              <div className="color-preview" style={{ backgroundColor: selectedEvent.backgroundColor }} />
            )}
          </div>

          <div className='modal-actions'>
            {isEditing ? (
              <div className="button-group">
                <button className="primary-btn" onClick={handleSaveEvent}>
                  Save Changes
                </button>
                <button className="secondary-btn" onClick={() => setShowEventDetails(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="button-group">
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Event
                </button>
                <button className="delete-btn" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsPop
