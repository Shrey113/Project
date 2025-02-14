import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import dayjs from "dayjs";

import { Server_url,showAcceptToast,showRejectToast,showWarningToast } from "../../../../redux/AllData";
import "./../Calendar/part/AddDetailsPop.css";

// import socket from "../../../../redux/socket";

const COLOR_OPTIONS = [
  { id: "purple", value: "#6366F1", label: "Purple", default: true },
  { id: "green", value: "#22C55E", label: "Green", default: false },
  { id: "orange", value: "#F59E0B", label: "Orange", default: false },
  { id: "red", value: "#EF4444", label: "Red", default: false },
];

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5" },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4f46e5",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#6b7280" },
      },
    },
  },
});

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

const TeamMember = ({ member, onAction, actionIcon: ActionIcon, isDisabled, actionButtonClass }) => (
  <li className={`team-member ${isDisabled ? "down_opacity" : ""}`}>
    <img src={member.member_profile_img} alt={member.member_name} className="member-img" />
    <div className="member-info">
      <strong>{member.member_name}</strong>
    </div>
    <button
      className={actionButtonClass}
      onClick={() => onAction(member)}
      disabled={isDisabled}
      title={isDisabled ? "This team member cannot be assigned." : ""}
      style={{
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <ActionIcon style={{ height: "20px", width: "20px" }} />
    </button>
  </li>
);

const AddDetailsPop = ({ setShowEventModal, newEvent, setNewEvent, set_receiver_package_data, set_receiver_equipment_data }) => {
  const user = useSelector((state) => state.user);
  // const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [DisabledTeamMembers, setDisabledTeamMembers] = useState([]);



  // Set default color

  useEffect(() => {
    const defaultColor = COLOR_OPTIONS.find(color => color.default).value;
    setNewEvent(prev => ({ ...prev, backgroundColor: defaultColor }));
  }, [setNewEvent]);

  const validateForm = () => {
    if (!newEvent.title.trim()) {
      setNewEvent((prev) => ({
        ...prev,
        titleError: "Event title is required",
      }));
      return false;
    }
    if (newEvent.title.trim().length < 3) {
      setNewEvent((prev) => ({
        ...prev,
        titleError: "Title must be at least 3 characters",
      }));
      return false;
    }
    return true;
  };

  // Helper function to update request data status
  const updateRequestStatus = (data) => {
    const { reason } = data;
    if (newEvent.event_request_type === "equipment") {
      set_receiver_equipment_data(prevData =>
        prevData.map(item =>
          item.id === newEvent.id ? { ...item, event_status: "Accepted", reason } : item
        )

      );
    } else if (newEvent.event_request_type === "package") {
      set_receiver_package_data(prevData =>
        prevData.map(item =>
          item.id === newEvent.id ? { ...item, event_status: "Accepted", reason } : item
        )
      );

    } else {
      throw new Error(`Invalid event type: ${newEvent.event_request_type}`);
    }
  };

  // Helper function to assign team members
  const assignTeamMembers = async (eventId) => {
    const response = await fetch(`${Server_url}/add-team-members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: user.user_email,
        team_members: assignedMembers,
        event_id: eventId
      })
    });
    const data = await response.json();
    if (data.message !== "Team members assigned successfully") {
      throw new Error("Failed to assign team members");
    }
  };


  const confirmEquipmentEvent = async (eventId) => {
    try {
      // First confirm the equipment event
      const response = await fetch(`${Server_url}/confirm-equipment-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          user_email: user.user_email,
          sender_email: newEvent.sender_email
        })
      });
      const data = await response.json();
      
      if (data.message !== "Equipment event confirmed successfully") {
        showRejectToast({message: "Failed to confirm equipment event"});
        throw new Error("Failed to confirm equipment event");
      }
      
      // Then create the calendar event
      const calendarResponse = await fetch(`${Server_url}/calendar/add-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.user_email, 
          title: newEvent.title + " from " + newEvent.sender_email,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          backgroundColor: newEvent.backgroundColor,
          sender_email: newEvent.sender_email,
          event_location: newEvent.event_location
        })
      });
      
      const calendarData = await calendarResponse.json();
      
      if (calendarData.message === 'Event created successfully') {
        showAcceptToast({message: "Equipment event confirmed successfully"});
        setShowEventModal(false);
        setNewEvent({
          title: '',
          start: new Date(),
          end: new Date(),
          description: '',
          backgroundColor: '#6366F1',
          titleError: ''
        });
      } else {
        throw new Error("Failed to create calendar event");
      }
    } catch (error) {
      console.error('Error:', error);
      showRejectToast({message: error.message || "An error occurred while processing the equipment event"});
    }
  };


  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Add check for assigned team members
    if (assignedMembers.length === 0 && newEvent.event_request_type === "package") {
      showWarningToast({message:"Please assign at least one team member before confirming the event."});
      return;
    }

    try {
      // Create event
      const response = await fetch(`${Server_url}/calendar/add-event-with-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.user_email,
          title:newEvent.title + " from " + newEvent.sender_email,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          backgroundColor: newEvent.backgroundColor,
          sender_email: newEvent.sender_email,
          event_location: newEvent.event_location

        })
      });


      const data = await response.json();
      
      if (data.message === "Event created successfully") {
        // Update request status
        updateRequestStatus(data);
        
        // Assign team members
        if (newEvent.event_request_type === "package") {
          await assignTeamMembers(newEvent.id);
        }else if (newEvent.event_request_type === "equipment") {
          await confirmEquipmentEvent(newEvent.id);
        }
        


        // Reset form and close modal
        showAcceptToast({message:"Event and team members assigned successfully!"});

        setShowEventModal(false);
        setNewEvent({
          title: "",
          start: new Date(),
          end: new Date(),
          description: "",
          backgroundColor: "#6366F1",
          titleError: "",
        });
      }
    } catch (error) {
      console.error("Error in handleAddEvent:", error);
      showRejectToast({message:error.message || "Failed to create event or assign team members."});
    }
  };


  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(
          `${Server_url}/team_members/get_inactive_members`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: user.user_email,
            }),
          }
        );
        const data = await response.json();
        setTeamMembers(data);

        const filteredResponse = await fetch(
          `${Server_url}/team_members/filtered_team_member`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: user.user_email,
              start_date: formatDate(newEvent.start),
              end_date: formatDate(newEvent.end),
            }),
          }
        );
        const filteredData = await filteredResponse.json();
        setDisabledTeamMembers(filteredData.assignedTeamMembers);
        
      } catch (error) {
        console.error("Error f etching team members:", error);
      }
    };

    fetchTeamMembers();
  }, [user.user_email, newEvent.start, newEvent.end]);



  const removeAssignedMember = (member) => {
    setTeamMembers([...teamMembers, member]);
    setAssignedMembers(
      assignedMembers.filter((m) => m.member_id !== member.member_id)
    );
  };

  const assignMember = (member) => {
    if (DisabledTeamMembers.includes(member.member_name)) {
      console.log(`Cannot assign ${member.member_name}, they are disabled.`);
      return;
    }
    setAssignedMembers([...assignedMembers, member]);
    setTeamMembers(teamMembers.filter((m) => m.member_id !== member.member_id));
  };

  const renderEventForm = () => (
    <form onSubmit={handleAddEvent}>
      <h2>Add New Event</h2>
      <div className="form-field">
        <label className="form-label">Event Title</label>
        <input
          className="event-title-input"
          type="text"
          placeholder="Enter event title"
          value={newEvent.title + " from " + newEvent.sender_email}
          readOnly
        />


        {newEvent.titleError && (
          <p className="error-text">{newEvent.titleError}</p>
        )}
      </div>

      <div className="date-time-container">
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="date-input-group">
              <label>Start Date</label>
              <DatePicker
                readOnly
                value={newEvent.start ? dayjs(newEvent.start) : null}
                onChange={(newValue) => {
                  const newDate = newValue.toDate();
                  const currentTime = dayjs(newEvent.start);
                  newDate.setHours(
                    currentTime.hour(),
                    currentTime.minute()
                  );
                  setNewEvent({
                    ...newEvent,
                    start: newDate,
                    end: newValue.isAfter(dayjs(newEvent.end))
                      ? newDate
                      : newEvent.end,
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    className: "modern-date-picker",
                  },
                }}
                minDate={dayjs()}
                format="MMM DD, YYYY"
              />
            </div>
            <div className="date-input-group">
              <label>End Date</label>
              <DatePicker
                readOnly
                value={newEvent.start ? dayjs(newEvent.end) : null}
                onChange={(newValue) => setNewEvent(newValue, "start")}
                className="form-control"
                format="MMM DD, YYYY"
                slotProps={{
                  textField: {
                    variant: "outlined",
                    size: "small",
                  },
                }}
              />
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      </div>

      <div className="form-field">
        <label className="form-label">Description</label>
        <textarea
          readOnly
          className="event-description"
          placeholder="Enter event description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
          rows="2"
        />
      </div>

      <div className="form-field">
        <label className="form-label">Event Color</label>
        <div className="color-selector">
          {COLOR_OPTIONS.map((color) => (
            <div
              key={color.id}
              className={`color-option ${
                newEvent.backgroundColor === color.value ? "selected" : ""
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setNewEvent({ ...newEvent, backgroundColor: color.value })}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <button type="submit">Confirm Event</button>
        <button type="button" onClick={() => setShowEventModal(false)}>
          Cancel
        </button>
      </div>
    </form>
  );

  const renderTeamMemberSection = () => (
    <div className="assign_team_member_section">
      <h3>Assigned Members</h3>
      {assignedMembers.length > 0 && (
        <div className="assigned-members-section">
          <ul className="team-list">
            {assignedMembers.map((member) => (
              <TeamMember
                key={member.member_id}
                member={member}
                onAction={removeAssignedMember}
                actionIcon={CiCircleMinus}
                actionButtonClass="remove-btn"
              />
            ))}
          </ul>
        </div>
      )}

      <div className="team-members-section">
        <h3>Available Team Members</h3>
        {teamMembers.length > 0 ? (
          <ul className="team-list">
            {teamMembers.map((member) => {
              const isDisabled = DisabledTeamMembers.includes(
                member.member_name
              );

              return (
                <TeamMember
                  key={member.member_id}
                  member={member}
                  onAction={assignMember}
                  actionIcon={CiCirclePlus}
                  isDisabled={isDisabled}
                  actionButtonClass="assign-btn"
                />
              );
            })}
          </ul>
        ) : (
          <p>No team members available.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay_add_event">
      <div className={`modal-content add_event_modal ${newEvent.event_request_type === "equipment" ? "set_equipment_event" : ""}`}>
        <button
          className="modal-close"
          onClick={() => setShowEventModal(false)}

        >
          ×
        </button>
        {renderEventForm()}
        
        {newEvent.event_request_type === "equipment" ? null  :  renderTeamMemberSection()}
      </div>
    </div>

  );
};

export default AddDetailsPop;
