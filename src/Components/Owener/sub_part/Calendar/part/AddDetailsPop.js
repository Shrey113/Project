import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FaClock, FaCheck, FaTimes, FaEnvelope } from "react-icons/fa";
import dayjs from "dayjs";

// import user_backicon from "./../../../../Owener/img/user_backicon.png"
import { Server_url, showAcceptToast, showRejectToast, showWarningToast } from "../../../../../redux/AllData";
import socket from "../../../../../redux/socket";
import "./AddDetailsPop.css";

import profile_pic_user1 from "./profile_pic/user1.jpg";
import profile_pic_user2 from "./profile_pic/user2.jpg";
import profile_pic_user3 from "./profile_pic/user3.jpg";
import profile_pic_user4 from "./profile_pic/user4.jpg";

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
        {member.isEventOwner ? (
          <span className="member-role-tag owner-tag">Owner of event</span>
        ) : member.isMemberBusyPending ? (
          <span className="member-role-tag busy-tag">Pending Approval</span>
        ) : member.isEventHandler ? (
          <span className="member-role-tag handler-tag">Event handler</span>
        ) : ''}
      </div>
      {!member.isEventOwner && !member.isEventHandler && (
        <button
          className={actionButtonClass}
          onClick={() => onAction(member)}
          disabled={isDisabled || member.isEventOwner || member.isEventHandler}
          title={isDisabled ? "This team member is not available" :
            member.isEventOwner ? "Event owner cannot be assigned" :
              member.isEventHandler ? "Event handler cannot be assigned" :
                actionButtonClass === "assign-btn" ? "Assign Member" : "Remove Member"}
          style={{
            cursor: (isDisabled || member.isEventOwner || member.isEventHandler) ? "not-allowed" : "pointer",
          }}
        >
          <ActionIcon style={{ width: "20px", height: "20px", display: "block" }} />
        </button>
      )}
    </li>
  );
};

const EmailSendingLoader = () => {
  return (
    <div className="email-sending-loader-overlay">
      <div className="email-sending-loader-container">
        <div className="email-loader-icon">
          <FaEnvelope className="envelope-icon" />
          <div className="email-sending-pulse"></div>
        </div>
        <h3>Processing Event</h3>
        <div className="email-progress-container">
          <div className="email-progress-bar" style={{ width: '100%' }}></div>
        </div>
        <p className="email-progress-text">
          Sending team notifications
        </p>
        <p className="email-sending-hint">Please don't close this window</p>
      </div>
    </div>
  );
};

const AddDetailsPop = ({ setShowEventModal, newEvent, setNewEvent, events, setEvents }) => {
  const user = useSelector(state => state.user);
  // const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [DisabledTeamMembers, setDisabledTeamMembers] = useState([]);
  const [teamResponseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const defaultColor = COLOR_OPTIONS.find(color => color.default).value;
    setNewEvent(prev => ({ ...prev, backgroundColor: defaultColor }));
  }, [setNewEvent]);

  const assignTeamMembers = async (eventId) => {
    setIsLoading(true);

    const formattedMembers = assignedMembers.map((member) => ({
      member_id: member.member_id,
    }));

    try {
      const response = await fetch(`${Server_url}/team_members/add-team-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.user_email,
          team_members: formattedMembers,
          event_id: eventId,
          socket_id: socket.id || null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign team members: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setIsLoading(false);
      setShowEventModal(false);
      setNewEvent({
        title: "",
        start: new Date(),
        end: new Date(),
        description: "",
        backgroundColor: "#6366F1",
        titleError: "",
      });

      return data.status || "Waiting on Team";
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

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

  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (assignedMembers.length === 0) {
      showWarningToast({ message: "Please assign at least one team member before confirming the event." });
      return;
    }

    try {
      const response = await fetch(`${Server_url}/calendar/add-event-with-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.user_email,
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          backgroundColor: newEvent.backgroundColor,
          team_members: assignedMembers.map(member => ({
            member_id: member.member_id
          }))
        })
      });

      const data = await response.json();

      if (data.message === "Event created successfully") {
        const eventId = data.id || newEvent.id;
        console.log("from the server side ", data, data.id);
        const eventStatus = await assignTeamMembers(eventId);
        showAcceptToast({
          message: `Event created and team members notified. Status: ${eventStatus}`
        });

        if (!isLoading) {
          setShowEventModal(false);
          setNewEvent({
            title: "",
            start: new Date(),
            end: new Date(),
            description: "",
            backgroundColor: "#6366F1",
            titleError: "",
            event_status: "Waiting on Team",
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error in handle Add Event:", error);
      showRejectToast({ message: error.message || "Failed to create event or assign team members." });
    }
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const formattedStartDate = formatDate(newEvent.start);
        const formattedEndDate = formatDate(newEvent.end);

        const [inactiveResponse, filteredResponse] = await Promise.all([
          fetch(`${Server_url}/team_members/get_inactive_members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: user.user_email,
            }),
          }),
          fetch(`${Server_url}/team_members/filtered_team_member`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: user.user_email,
              start_date: formattedStartDate,
              end_date: formattedEndDate,
            }),
          }),
        ]);

        const inactiveData = await inactiveResponse.json();
        const filteredData = await filteredResponse.json();

        const processedTeamMembers = inactiveData.map(member => ({
          ...member,
          isEventOwner: false,
          isEventHandler: member.team_member_email === user.user_email,
          isMemberBusyPending: member.member_status === "Pending"
        }));

        setTeamMembers(processedTeamMembers);

        let busyIds = [];
        if (Array.isArray(filteredData.assignedTeamMembers)) {
          busyIds = filteredData.assignedTeamMembers.map(id => {
            return typeof id === 'number' ? id : parseInt(id);
          }).filter(id => !isNaN(id));
        }

        setDisabledTeamMembers(busyIds);

        if (newEvent.id) {
          try {
            const assignedResponse = await fetch(`${Server_url}/team_members/get-event-team-members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_id: newEvent.id }),
            });

            if (!assignedResponse.ok) {
              throw new Error(`Failed to fetch assigned members: ${assignedResponse.status}`);
            }

            const assignedData = await assignedResponse.json();

            if (Array.isArray(assignedData) && assignedData.length > 0) {
              const processedAssignedMembers = assignedData.map(member => ({
                ...member,
                isEventOwner: false,
                isEventHandler: member.team_member_email === user.user_email,
                isMemberBusyPending: member.member_status === "Pending"
              }));

              setAssignedMembers(processedAssignedMembers);
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
  }, [user.user_email, newEvent.start, newEvent.end, newEvent.id]);

  const isMemberBusy = (member) => {
    const memberId = typeof member.member_id === 'number' ?
      member.member_id : parseInt(member.member_id);

    return DisabledTeamMembers.includes(memberId);
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

    if (member.isEventOwner) {
      showWarningToast({ message: `${member.member_name} is the owner of this event and cannot be assigned.` });
      return;
    }

    if (member.isEventHandler) {
      showWarningToast({ message: `${member.member_name} is the event handler and cannot be assigned.` });
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
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          rows="2"
        />
      </div>

      <div className="form-field">
        <label className="form-label">Event Color</label>
        <div className="color-selector">
          {COLOR_OPTIONS.map((color) => (
            <div
              key={color.id}
              className={`color-option ${newEvent.backgroundColor === color.value ? 'selected' : ''}`}
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
            className={`status-tag ${newEvent.event_status === "Accepted" ? "status-accepted" : newEvent.event_status === "Waiting on Team" ? "status-waiting-on-team" : newEvent.event_status === "Declined" ? "status-declined" : "status-pending"}`}
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

  return (
    <div className="modal-overlay_add_event"
      onClick={() => setShowEventModal(false)}
    >
      <div className="modal-content add_event_modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={() => setShowEventModal(false)} >
          ×
        </button>
        <div className="modal-content-container">
          {renderEventForm()}
          {renderTeamMemberSection()}
        </div>
        <div className="modal-actions">
          <button
            type="submit"
            onClick={handleAddEvent}
            disabled={newEvent.event_status === "Waiting on Team" || isLoading}
            className={newEvent.event_status === "Waiting on Team" || isLoading ? "disabled-btn" : ""}
          >
            {newEvent.event_status === "Waiting on Team" ? (
              <span className="waiting-status">
                <FaClock /> Team Confirmation
              </span>
            ) : isLoading ? "Processing..." : "Confirm Event"}
          </button>
          <button type="button" onClick={() => setShowEventModal(false)}>
            Cancel
          </button>
        </div>
      </div>

      {isLoading && (
        <EmailSendingLoader />
      )}
    </div>
  );
};

export default AddDetailsPop;
