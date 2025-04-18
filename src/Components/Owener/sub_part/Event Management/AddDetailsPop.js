import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FaBuilding, FaMapMarkerAlt, FaUser, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

import { Server_url, showAcceptToast, showRejectToast, showWarningToast } from "../../../../redux/AllData";
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

const TeamMember = ({ member, onAction, actionIcon: ActionIcon, isDisabled, actionButtonClass }) => {
  // Determine status class based on member status
  const getStatusClass = () => {
    if (member.status === 'assigned') return 'assigned-member';
    if (member.status === 'busy') return 'busy-member';
    return 'available-member';
  };

  return (
    <li className={`team-member ${isDisabled ? "down_opacity" : ""}`}>
      <div className="member-avatar-container">
        <img src={member.member_profile_img} alt={member.member_name} className="member-img" />
        <span className={`status-badge ${getStatusClass()}`}></span>
      </div>
      <div className="member-info">
        <strong title={member.member_name}>{member.member_name}</strong>
      </div>
      <button
        className={actionButtonClass}
        onClick={() => onAction(member)}
        disabled={isDisabled}
        title={isDisabled ? "This team member is not available" : actionButtonClass === "assign-btn" ? "Assign Member" : "Remove Member"}
        style={{
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
      >
        <ActionIcon style={{ width: "20px", height: "20px", display: "block" }} />
      </button>
    </li>
  );
};

const AddDetailsPop = ({ setShowEventModal, newEvent, setNewEvent, set_receiver_package_data, set_receiver_equipment_data, set_receiver_service_data, profile_data }) => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
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
          item.id === newEvent.id ? { ...item, assigned_team_member: teamMembers, event_status: "Accepted", reason } : item
        )
      );
      // window.location.reload();
    } else if (newEvent.event_request_type === "service") {
      set_receiver_service_data(prevData =>
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
  // Ensure you're only sending member_id in each object
  const formattedMembers = assignedMembers.map((member) => ({
    member_id: member.member_id,
  }));

  const response = await fetch(`${Server_url}/add-team-members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_email: user.user_email,
      team_members: formattedMembers,
      event_id: eventId,
    }),
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
        showRejectToast({ message: "Failed to confirm equipment event" });
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
        showAcceptToast({ message: "Equipment event confirmed successfully" });
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
      showRejectToast({ message: error.message || "An error occurred while processing the equipment event" });
    }
  };





  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Add check for assigned team members
    if (assignedMembers.length === 0 && newEvent.event_request_type === "package") {
      showWarningToast({ message: "Please assign at least one team member before confirming the event." });
      return;
    }

    try {
      // Create event
      const response = await fetch(`${Server_url}/calendar/add-event-with-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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


      const data = await response.json();

      if (data.message === "Event created successfully") {
        // Update request status
        updateRequestStatus(data);

        // Assign team members
        if (newEvent.event_request_type === "package") {
          await assignTeamMembers(newEvent.id);
        } else if (newEvent.event_request_type === "equipment") {
          await confirmEquipmentEvent(newEvent.id);
        } else if (newEvent.event_request_type === "service") {
          await assignTeamMembers(newEvent.id);
        }



        // Reset form and close modal
        showAcceptToast({ message: "Event and team members assigned successfully!" });

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
      showRejectToast({ message: error.message || "Failed to create event or assign team members." });
    }
  };


  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Format the dates first to ensure the correct format is passed
        const formattedStartDate = formatDate(newEvent.start);
        const formattedEndDate = formatDate(newEvent.end);

        console.log("Fetching team members for date range:", formattedStartDate, "to", formattedEndDate);

        // Make both API calls concurrently using Promise.all
        const [inactiveResponse, filteredResponse] = await Promise.all([
          fetch(`${Server_url}/team_members/get_inactive_members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: user.user_email,
            }),
          }),
          fetch(`${Server_url}/team_members/filtered_team_member`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: user.user_email,
              start_date: formattedStartDate,
              end_date: formattedEndDate,
            }),
          }),
        ]);

        // Parse the responses
        const inactiveData = await inactiveResponse.json();
        const filteredData = await filteredResponse.json();

        console.log("Available team members:", inactiveData);
        console.log("Filtered data response:", filteredData);
        console.log("Busy team members:", filteredData.assignedTeamMembers || []);

        // Update states with the fetched data
        setTeamMembers(inactiveData);
        
        // Make sure we handle all potential formats
        let busyIds = [];
        if (Array.isArray(filteredData.assignedTeamMembers)) {
          busyIds = filteredData.assignedTeamMembers.map(id => {
            // Make sure the ID is a number
            return typeof id === 'number' ? id : parseInt(id);
          }).filter(id => !isNaN(id)); // Remove any NaN values
        }
        
        console.log("Final list of busy member IDs:", busyIds);
        setDisabledTeamMembers(busyIds);

      } catch (error) {
        console.error("Error fetching team members:", error);
        showWarningToast({ message: "Failed to load team members. Please try again." });
      }
    };

    // Call fetchTeamMembers whenever user email or event dates change
    fetchTeamMembers();
  }, [user.user_email, newEvent.start, newEvent.end]);
  


  // Helper function to check if a member is busy during the event time
  const isMemberBusy = (member) => {
    const memberId = typeof member.member_id === 'number' ? 
      member.member_id : parseInt(member.member_id);
      
    const result = DisabledTeamMembers.includes(memberId);
    console.log(`Checking if member ${member.member_name} (ID: ${memberId}) is busy:`, result);
    return result;
  };

  const removeAssignedMember = (member) => {
    setTeamMembers([...teamMembers, member]);
    setAssignedMembers(
      assignedMembers.filter((m) => m.member_id !== member.member_id)
    );
  };

  const assignMember = (member) => {
    // Check if member is disabled by checking if their ID is in the DisabledTeamMembers array
    if (isMemberBusy(member)) {
      showWarningToast({ message: `${member.member_name} is not available during this time period.` });
      return;
    }
    setAssignedMembers([...assignedMembers, member]);
    setTeamMembers(teamMembers.filter((m) => m.member_id !== member.member_id));
  };

  const renderEventForm = () => (
    <form>
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
              className={`color-option ${newEvent.backgroundColor === color.value ? "selected" : ""
                }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setNewEvent({ ...newEvent, backgroundColor: color.value })}
              title={color.label}
            />
          ))}
        </div>
      </div>


    </form>
  );

  const renderTeamMemberSection = () => (
    <div className="assign_team_member_section">
      <h3>Team Members</h3>
      <div className="team-members-section">
        <ul className="team-list">
          {/* Render assigned members first */}
          {assignedMembers.map((member) => (
            <TeamMember
              key={member.member_id}
              member={{ ...member, status: 'assigned' }}
              onAction={removeAssignedMember}
              actionIcon={CiCircleMinus}
              actionButtonClass="remove-btn"
            />
          ))}

          {/* Render available members */}
          {teamMembers.map((member) => {
            const isDisabled = isMemberBusy(member);

            // Skip if this member is already assigned
            if (assignedMembers.some(m => m.member_id === member.member_id)) {
              return null;
            }

            return (
              <TeamMember
                key={member.member_id}
                member={{ ...member, status: isDisabled ? 'busy' : 'available' }}
                onAction={assignMember}
                actionIcon={CiCirclePlus}
                isDisabled={isDisabled}
                actionButtonClass="assign-btn"
              />
            );
          })}
        </ul>

        {teamMembers.length === 0 && assignedMembers.length === 0 && (
          <div className="no-members-message">
            <p>No team members available.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserProfileSection = () => (
    <div className="profile_page">
      <div className="profile-header">
        <div className="profile-image-container">
          <img
            src={profile_data?.user_profile_image_base64 || "https://via.placeholder.com/120"}
            alt={profile_data?.user_name || "User"}
            className="profile-image"
          />
        </div>
        <h3 className="profile-name">{profile_data?.user_name || "Photography Professional"}</h3>
      </div>

      <div className="profile-details">
        <div className="profile-detail-item">
          <div className="profile-detail-icon">
            <FaUser />
          </div>
          <span className="profile-detail-label">Name:</span>
          <span className="profile-detail-value">{profile_data?.user_name || "Not provided"}</span>
        </div>

        <div className="profile-detail-item">
          <div className="profile-detail-icon">
            <FaBuilding />
          </div>
          <span className="profile-detail-label">Business:</span>
          <span className="profile-detail-value">{profile_data?.business_name || "Not provided"}</span>
        </div>

        <div className="profile-detail-item">
          <div className="profile-detail-icon">
            <FaMapMarkerAlt />
          </div>
          <span className="profile-detail-label">Address:</span>
          <span className="profile-detail-value">{profile_data?.business_address || "Not provided"}</span>
        </div>
      </div>

      <button
        className="profile-navigation-button"
        onClick={() => {
          document.documentElement.style.overflow = "auto";
          navigate(`/Owner/search_photographer/${profile_data?.user_email}`);
        }}
      >
        View Full Profile <FaArrowRight />
      </button>
    </div>
  )

  return (
    <div className="modal-overlay_add_event"
      onClick={() => setShowEventModal(false)}
    >
      <div className={`modal-content add_event_modal ${newEvent.event_request_type === "equipment" ? "set_equipment_event" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={() => setShowEventModal(false)} >
          ×
        </button>
        <div className="modal-content-container">
          {renderEventForm()}

          {newEvent.event_request_type === "equipment" ? renderUserProfileSection() : renderTeamMemberSection()}
        </div>
        <div className="modal-actions">
          <button type="submit" onClick={handleAddEvent}>Confirm Event</button>
          <button type="button" onClick={() => setShowEventModal(false)}>
            Cancel
          </button>
        </div>


      </div>
    </div>

  );
};

export default AddDetailsPop;
