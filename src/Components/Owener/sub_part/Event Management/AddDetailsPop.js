import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FaBuilding, FaMapMarkerAlt, FaUser, FaArrowRight, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import dayjs from "dayjs";

import user_backicon from "./../../../Owener/img/user_backicon.png"
import { Server_url, showAcceptToast, showRejectToast, showWarningToast } from "../../../../redux/AllData";
import "./../Calendar/part/AddDetailsPop.css";

import profile_pic_user1 from "./profile_pic/user1.jpg";
import profile_pic_user2 from "./profile_pic/user2.jpg";
import profile_pic_user3 from "./profile_pic/user3.jpg";
import profile_pic_user4 from "./profile_pic/user4.jpg";

import socket from "../../../../redux/socket";

// Add styles for status tags
const statusTagStyles = {
  accepted: {
    backgroundColor: "#22C55E",
    color: "white",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  pending: {
    backgroundColor: "#F59E0B",
    color: "white",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  declined: {
    backgroundColor: "#EF4444",
    color: "white",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  "waiting-on-team": {
    backgroundColor: "#F59E0B",
    color: "white",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
  }
};

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
  function getTeamMemberProfilePic(value) {
    if (value.includes("1")) {
      return profile_pic_user1;
    } else if (value.includes("2")) {
      return profile_pic_user2;
    } else if (value.includes("3")) {
      return profile_pic_user3;
    } else if (value.includes("4")) {
      return profile_pic_user4;
    } else {
      return profile_pic_user1;
    }
  }
  // Determine status icon based on member's confirmation status
  // console.log("member", member)
  const getMemberStatusIcon = () => {
    if (!member.confirmation_status || member.confirmation_status === 'Pending') {
      return <FaClock style={{ color: "#F59E0B" }} title="Awaiting response" />;
    } else if (member.confirmation_status === 'Accepted' || member.confirmation_status === 'Accepted') {
      return <FaCheck style={{ color: "#22C55E" }} title="Accepted" />;
    } else if (member.confirmation_status === 'Declined') {
      return <FaTimes style={{ color: "#EF4444" }} title="Declined" />;
    }
    return null;
  };

  return (
    <li className={`team-member ${isDisabled ? "down_opacity" : ""}`}>
      <div className="member-avatar-container">
        {["1", "2", "3", "4"].includes(member.member_profile_img) ? (
          <img
            src={getTeamMemberProfilePic(member.member_profile_img)}
            alt={member.member_name}
            className="member-img"
          />
        ) : (
          <img
            src={`${Server_url}/owner/profile-image/${member.team_member_email}`}
            alt={member.member_name}
            className="member-img"
          />
        )}
      </div>
      <div className="member-info">
        <strong title={member.member_name}>{member.member_name}</strong>
        {member.confirmation_status && (
          <div className="member-status-indicator">
            {getMemberStatusIcon()}
          </div>
        )}
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
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [DisabledTeamMembers, setDisabledTeamMembers] = useState([]);
  const [teamResponseStatus, setTeamResponseStatus] = useState(null);

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

    console.log("Assigning team members to event ID:", eventId, "Members:", formattedMembers);

    const response = await fetch(`${Server_url}/team_members/add-team-members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: user.user_email,
        team_members: formattedMembers,
        event_id: eventId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error assigning team members:", response.status, errorText);
      throw new Error(`Failed to assign team members: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Team assignment response:", data);

    return data.status || "Waiting on Team";
  };

  const confirmEquipmentEvent = async (eventId) => {
    try {
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

    if (assignedMembers.length === 0 && newEvent.event_request_type === "package") {
      showWarningToast({ message: "Please assign at least one team member before confirming the event." });
      return;
    }

    try {
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
        const eventId = data.event_id || newEvent.id;

        updateRequestStatus(data);

        if ((newEvent.event_request_type === "package" || newEvent.event_request_type === "service")
          && assignedMembers.length > 0) {
          const eventStatus = await assignTeamMembers(eventId);
          showAcceptToast({
            message: `Event created and team members notified. Status: ${eventStatus}`
          });
        } else if (newEvent.event_request_type === "equipment") {
          await confirmEquipmentEvent(newEvent.id);
        } else {
          showAcceptToast({ message: "Event created successfully!" });
        }

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
        const formattedStartDate = formatDate(newEvent.start);
        const formattedEndDate = formatDate(newEvent.end);

        console.log("Fetching team members for date range:", formattedStartDate, "to", formattedEndDate);

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

        const inactiveData = await inactiveResponse.json();
        const filteredData = await filteredResponse.json();

        console.log("Available team members:", inactiveData);
        console.log("Filtered data response:", filteredData);
        console.log("Busy team members:", filteredData.assignedTeamMembers || []);

        setTeamMembers(inactiveData);

        // Make sure we handle all potential formats
        let busyIds = [];
        if (Array.isArray(filteredData.assignedTeamMembers)) {
          busyIds = filteredData.assignedTeamMembers.map(id => {
            return typeof id === 'number' ? id : parseInt(id);
          }).filter(id => !isNaN(id));
        }

        console.log("Final list of busy member IDs:", busyIds);
        setDisabledTeamMembers(busyIds);

        if (newEvent.id) {
          try {
            console.log("Fetching assigned team members for event ID:", newEvent.id);
            const assignedResponse = await fetch(`${Server_url}/team_members/get-event-team-members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_id: newEvent.id }),
            });

            if (!assignedResponse.ok) {
              const errorText = await assignedResponse.text();
              console.error("Error fetching assigned members, status:", assignedResponse.status, "Response:", errorText);
              throw new Error(`Failed to fetch assigned members: ${assignedResponse.status} ${errorText}`);
            }

            const assignedData = await assignedResponse.json();
            console.log("Currently assigned members:", assignedData);

            if (Array.isArray(assignedData) && assignedData.length > 0) {
              setAssignedMembers(assignedData);

              setTeamMembers(prev =>
                prev.filter(member => !assignedData.some(m => m.member_id === member.member_id))
              );
            }
          } catch (error) {
            console.error("Error fetching assigned members:", error);
          }
        }

      } catch (error) {
        console.error("Error fetching team members:", error);
        showWarningToast({ message: "Failed to load team members. Please try again." });
      }
    };

    fetchTeamMembers();
  }, [user.user_email, newEvent.start, newEvent.end]);


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

  const renderTeamStatusOverview = () => {
    if (!teamResponseStatus) return null;

    return (
      <div className="team-status-overview">
        <h4>Team Member Responses</h4>
        <div className="status-counts">
          <div className="status-item">
            <span className="status-label">Accepted:</span>
            <span className="status-count confirmed-count">{teamResponseStatus.confirmed}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Pending:</span>
            <span className="status-count pending-count">{teamResponseStatus.pending}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Declined:</span>
            <span className="status-count declined-count">{teamResponseStatus.declined}</span>
          </div>
        </div>
        <div className="event-status">
          <strong>Event Status: </strong>
          <span
            className={`status-tag status-${newEvent.event_status?.toLowerCase().replace(/\s+/g, '-')}`}
            style={statusTagStyles[newEvent.event_status === "Accepted" ? "accepted" :
              newEvent.event_status?.toLowerCase().replace(/\s+/g, '-')] || {}}
          >
            {newEvent.event_status === "Accepted" ? "Accepted" : newEvent.event_status || "Pending"}
          </span>
        </div>
      </div>
    );
  };

  const renderTeamMemberSection = () => (
    <div className="assign_team_member_section">
      <h3>Team Members</h3>
      {newEvent.event_status === "Waiting on Team" && renderTeamStatusOverview()}
      <div className="team-members-section">
        <ul className="team-list">
          {assignedMembers.map((member) => (
            <TeamMember
              key={member.member_id}
              member={{ ...member, status: 'assigned' }}
              onAction={removeAssignedMember}
              actionIcon={CiCircleMinus}
              actionButtonClass="remove-btn"
            />
          ))}

          {teamMembers.map((member) => {
            const isDisabled = isMemberBusy(member);

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
            src={`${Server_url}/owner/profile-image/${profile_data?.user_email}` || user_backicon}
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
          <button
            type="submit"
            onClick={handleAddEvent}
            disabled={newEvent.event_status === "Waiting on Team"}
            className={newEvent.event_status === "Waiting on Team" ? "disabled-btn" : ""}
          >
            {newEvent.event_status === "Waiting on Team" ? (
              <span className="waiting-status">
                <FaClock /> Team Confirmation
              </span>
            ) : "Confirm Event"}
          </button>
          <button type="button" onClick={() => setShowEventModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDetailsPop;
