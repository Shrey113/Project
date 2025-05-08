import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FaBuilding, FaMapMarkerAlt, FaUser, FaArrowRight, FaClock, FaCheck, FaTimes, FaEnvelope } from "react-icons/fa";

import user_backicon from "./../../../Owener/img/user_backicon.png"
import { Server_url, showAcceptToast, showWarningToast } from "../../../../redux/AllData";
import "./../Calendar/part/AddDetailsPop.css";

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
      {!member.isEventOwner && !member.isEventHandler && !member.isMemberBusyPending && (
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

// Add EmailSendingLoader component
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



const AddDetailsPop = ({ setShowEventModal, newEvent, setNewEvent, set_receiver_package_data, set_receiver_equipment_data, set_receiver_service_data, profile_data }) => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [DisabledTeamMembers, setDisabledTeamMembers] = useState([]);
  const [teamResponseStatus] = useState(null);
  const [isLoading] = useState(false);

  // New state for multi-day event handling
  const [isMultiDayEvent, setIsMultiDayEvent] = useState(false);
  const [eventDays, setEventDays] = useState([]);
  const [dayAssignments, setDayAssignments] = useState({});
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Add formStep state to track which page we're on
  const [formStep, setFormStep] = useState(1);

  // Add new state for assignment modal
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState({
    role: "",
    payment: ""
  });

  useEffect(() => {
    console.log("newEvent", newEvent);
    console.log("set_receiver_service_data", set_receiver_service_data);
    console.log("profile_data", profile_data);
    console.log("teamMembers", teamMembers);
    console.log("assignedMembers", assignedMembers);
    console.log("DisabledTeamMembers", DisabledTeamMembers);
    console.log("teamResponseStatus", teamResponseStatus);
    console.log("isLoading", isLoading);
  }, [newEvent, set_receiver_service_data, profile_data, teamMembers, assignedMembers, DisabledTeamMembers, teamResponseStatus, isLoading]);

  useEffect(() => {
    const defaultColor = COLOR_OPTIONS.find(color => color.default).value;
    setNewEvent(prev => ({ ...prev, backgroundColor: defaultColor }));

    // Check if this is a multi-day event by looking at the data format
    if (Array.isArray(newEvent.multi_day_data) && newEvent.multi_day_data.length > 1) {
      setIsMultiDayEvent(true);
      setEventDays(newEvent.multi_day_data);
      console.log("Multi-day event detected with days:", newEvent.multi_day_data.length);
    }
  }, [setNewEvent, newEvent.multi_day_data]);

  // Function to update day assignments for multi-day events
  const updateDayAssignments = (assignments) => {
    setDayAssignments(assignments);
    console.log("Updated day assignments:", assignments);
  };

  // Helper function to assign team members - updated for multi-day support
  // const assignTeamMembers = async (eventId) => {
  //   // Show loading overlay
  //   setIsLoading(true);

  //   try {
  //     if (isMultiDayEvent) {
  //       // For multi-day events, process each day's assignments
  //       const dayAssignmentPromises = Object.entries(dayAssignments).map(async ([dayIndex, members]) => {
  //         const dayId = eventDays[dayIndex].id;
  //         const formattedMembers = members.map((member) => ({
  //           member_id: member.member_id,
  //         }));

  //         const response = await fetch(`${Server_url}/team_members/add-team-members`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             user_email: user.user_email,
  //             team_members: formattedMembers,
  //             event_id: dayId,
  //             socket_id: socket.id || null
  //           }),
  //         });

  //         if (!response.ok) {
  //           const errorText = await response.text();
  //           throw new Error(`Failed to assign team members for day ${parseInt(dayIndex) + 1}: ${response.status} ${errorText}`);
  //         }

  //         return await response.json();
  //       });

  //       await Promise.all(dayAssignmentPromises);

  //     } else {
  //       // Original single-day event handling
  //       const formattedMembers = assignedMembers.map((member) => ({
  //         member_id: member.member_id,
  //       }));

  //       const response = await fetch(`${Server_url}/team_members/add-team-members`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           user_email: user.user_email,
  //           team_members: formattedMembers,
  //           event_id: eventId,
  //           socket_id: socket.id || null
  //         }),
  //       });

  //       if (!response.ok) {
  //         const errorText = await response.text();
  //         console.error("Error assigning team members:", response.status, errorText);
  //         throw new Error(`Failed to assign team members: ${response.status} ${errorText}`);
  //       }

  //       await response.json();
  //     }

  //     // Hide loader and close modal only after API call completes successfully
  //     setIsLoading(false);
  //     setShowEventModal(false);
  //     setNewEvent({
  //       title: "",
  //       start: new Date(),
  //       end: new Date(),
  //       description: "",
  //       backgroundColor: "#6366F1",
  //       titleError: "",
  //     });

  //     return "Waiting on Team";
  //   } catch (error) {
  //     // Hide loader on error
  //     setIsLoading(false);
  //     throw error;
  //   }
  // };

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

    // Validate multi-day event assignments
    if (isMultiDayEvent) {
      // Check if at least one member is assigned to each day
      const hasAssignmentsForAllDays = eventDays.every((day, index) =>
        dayAssignments[index] && dayAssignments[index].length > 0
      );

      if (!hasAssignmentsForAllDays) {
        showWarningToast({ message: "Please assign at least one team member to each day of the event." });
        return false;
      }
    }

    return true;
  };

  // const updateRequestStatus = (data) => {
  //   const { reason } = data;
  //   if (newEvent.event_request_type === "equipment") {
  //     set_receiver_equipment_data(prevData =>
  //       prevData.map(item =>
  //         item.id === newEvent.id ? { ...item, event_status: "Accepted", reason } : item
  //       )
  //     );
  //   } else if (newEvent.event_request_type === "package") {
  //     set_receiver_package_data(prevData =>
  //       prevData.map(item =>
  //         item.id === newEvent.id ? { ...item, assigned_team_member: teamMembers, event_status: "Waiting on Team", reason } : item
  //       )
  //     );
  //   } else if (newEvent.event_request_type === "service") {
  //     set_receiver_service_data(prevData =>
  //       prevData.map(item =>
  //         item.id === newEvent.id ? { ...item, event_status: "Waiting on Team", reason } : item
  //       )
  //     );
  //   } else {
  //     throw new Error(`Invalid event type: ${newEvent.event_request_type}`);
  //   }
  // };

  // const confirmEquipmentEvent = async (eventId) => {
  //   try {
  //     const response = await fetch(`${Server_url}/confirm-equipment-event`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         event_id: eventId,
  //         user_email: user.user_email,
  //         sender_email: newEvent.sender_email
  //       })
  //     });
  //     const data = await response.json();

  //     if (data.message !== "Equipment event confirmed successfully") {
  //       showRejectToast({ message: "Failed to confirm equipment event" });
  //       throw new Error("Failed to confirm equipment event");
  //     }

  //     const calendarResponse = await fetch(`${Server_url}/calendar/add-event`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         user_email: user.user_email,
  //         title: newEvent.title + " from " + newEvent.sender_email,
  //         start: newEvent.start,
  //         end: newEvent.end,
  //         description: newEvent.description,
  //         backgroundColor: newEvent.backgroundColor,
  //         sender_email: newEvent.sender_email,
  //         event_location: newEvent.event_location
  //       })
  //     });

  //     const calendarData = await calendarResponse.json();

  //     if (calendarData.message === 'Event created successfully') {
  //       showAcceptToast({ message: "Equipment event confirmed successfully" });
  //       setShowEventModal(false);
  //       setNewEvent({
  //         title: '',
  //         start: new Date(),
  //         end: new Date(),
  //         description: '',
  //         backgroundColor: '#6366F1',
  //         titleError: ''
  //       });
  //     } else {
  //       throw new Error("Failed to create calendar event");
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     showRejectToast({ message: error.message || "An error occurred while processing the equipment event" });
  //   }
  // };

  // Function to handle opening the assignment modal

  const openAssignmentModal = (member) => {
    setSelectedMember(member);
    setAssignmentDetails({ role: "", payment: "" });
    setShowAssignmentModal(true);
  };

  // Function to handle confirming the assignment
  const confirmAssignment = () => {
    if (!assignmentDetails.role || !assignmentDetails.payment) {
      alert("Please fill in all required fields");
      return;
    }

    if (isMultiDayEvent) {
      const newAssignments = { ...dayAssignments };
      if (!newAssignments[selectedDayIndex]) {
        newAssignments[selectedDayIndex] = [];
      }

      // Replace any existing assignment for this day (only one member per day)
      newAssignments[selectedDayIndex] = [{
        ...selectedMember,
        role: assignmentDetails.role,
        payment: assignmentDetails.payment
      }];

      setDayAssignments(newAssignments);
      updateDayAssignments(newAssignments);
    } else {
      // For single-day events, replace all assigned members
      setAssignedMembers([{
        ...selectedMember,
        role: assignmentDetails.role,
        payment: assignmentDetails.payment
      }]);
    }

    setShowAssignmentModal(false);
  };

  // Function to render the assignment modal
  const renderAssignmentModal = () => {
    if (!showAssignmentModal || !selectedMember) return null;

    return (
      <div className="assignment-modal-overlay">
        <div className="assignment-modal">
          <h3>Assign Team Member</h3>
          <div className="member-info-summary">
            <div className="member-avatar-container">
              <img
                src={selectedMember.member_profile_img ?
                  (["1", "2", "3", "4"].includes(selectedMember.member_profile_img) ?
                    `${profile_pic_user1}` : // This is a placeholder, should match your profile image logic
                    `${Server_url}/owner/profile-image/${selectedMember.team_member_email}`) :
                  user_backicon}
                alt={selectedMember.member_name}
                className="member-img"
              />
            </div>
            <div className="member-name">{selectedMember.member_name}</div>
          </div>

          <div className="assignment-form">
            <div className="form-field">
              <label>Role for this Event</label>
              <input
                type="text"
                placeholder="e.g. Photographer, Assistant, etc."
                value={assignmentDetails.role}
                onChange={(e) => setAssignmentDetails({ ...assignmentDetails, role: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Payment Amount (per day)</label>
              <div className="payment-input">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={assignmentDetails.payment}
                  onChange={(e) => setAssignmentDetails({ ...assignmentDetails, payment: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
            <button className="confirm-btn" onClick={confirmAssignment}>Assign</button>
          </div>
        </div>
      </div>
    );
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validate team member assignment
    if (isMultiDayEvent) {
      // Check if at least one day has a team member assigned
      const hasMembersAssigned = Object.values(dayAssignments).some(members => members && members.length > 0);
      if (!hasMembersAssigned) {
        showWarningToast({ message: "Please assign at least one team member to a day of the event." });
        return;
      }
    } else if (assignedMembers.length === 0) {
      showWarningToast({ message: "Please assign a team member before confirming the event." });
      return;
    }

    // Format team assignments as an array of objects with specific fields
    let formattedTeamAssignments = [];

    if (isMultiDayEvent) {
      // Process multi-day assignments
      Object.entries(dayAssignments).forEach(([dayIndex, members]) => {
        if (members && members.length > 0) {
          const member = members[0]; // Since we only allow one member per day
          const day = eventDays[parseInt(dayIndex)];

          formattedTeamAssignments.push({
            price_in_event: member.payment,
            role_in_event: member.role,
            event_id: day.id || `day_${dayIndex}`,
            member_id: member.member_id,
            assigned_by_email: user.user_email,
            start_date: day.start_date,
            end_date: day.end_date
          });
        }
      });
    } else {
      // Process single-day assignment
      if (assignedMembers.length > 0) {
        const member = assignedMembers[0];
        formattedTeamAssignments.push({
          price_in_event: member.payment,
          role_in_event: member.role,
          event_id: newEvent.id || 'single_day_event',
          member_id: member.member_id,
          assigned_by_email: user.user_email,
          start_date: newEvent.start,
          end_date: newEvent.end
        });
      }
    }

    // Log the event data with the new format
    console.log("Event Data:", {
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      description: newEvent.description,
      backgroundColor: newEvent.backgroundColor,
      isMultiDayEvent,
      teamAssignments: formattedTeamAssignments
    });
    const eventData = {
      user_email: user.user_email,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      description: newEvent.description,
      backgroundColor: newEvent.backgroundColor,
      isMultiDayEvent,
      teamAssignments: formattedTeamAssignments
    };

    try {
      const response = await fetch(`${Server_url}/owner/add_team_member_for_service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit event data');
      }


      if (response.ok) {
        const result = await response.json();
        if (result.message) {
          // assignTeamMembers()
        }
      }
      showAcceptToast({ message: "Event data successfully submitted!" });
      setShowEventModal(false);
    } catch (error) {
      console.error('Error submitting event data:', error);
      showWarningToast({ message: "Failed to submit event data. Please try again." });
    }

    showAcceptToast({ message: "Event data logged to console - no server action taken." });
    setShowEventModal(false);
  };

  useEffect(() => {

    const fetchTeamMembers = async () => {
      try {
        const formattedStartDate = formatDate(newEvent.start);
        const formattedEndDate = formatDate(newEvent.end);

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


        // Mark team members who are event owners or handlers
        const processedTeamMembers = inactiveData.map(member => {
          // Check if the team member is the event sender (owner)
          const isEventOwner = member.team_member_email === newEvent.sender_email;

          // Check if the team member is the event receiver (handler)
          const isEventHandler = member.team_member_email === user.user_email;
          const isMemberBusyPending = member.member_status === "Pending";

          return {
            ...member,
            isEventOwner,
            isEventHandler,
            isMemberBusyPending
          };
        });

        setTeamMembers(processedTeamMembers);

        // Make sure we handle all potential formats
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
              const errorText = await assignedResponse.text();
              console.error("Error fetching assigned members, status:", assignedResponse.status, "Response:", errorText);
              throw new Error(`Failed to fetch assigned members: ${assignedResponse.status} ${errorText}`);
            }

            const assignedData = await assignedResponse.json();

            if (Array.isArray(assignedData) && assignedData.length > 0) {
              // Mark assigned members who are event owners or handlers
              const processedAssignedMembers = assignedData.map(member => {
                const isEventOwner = member.team_member_email === newEvent.sender_email;
                const isEventHandler = member.team_member_email === user.user_email;
                const isMemberBusyPending = member.member_status === "Pending";

                return {
                  ...member,
                  isEventOwner,
                  isEventHandler,
                  isMemberBusyPending
                };
              });

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
  }, [user.user_email, newEvent.start, newEvent.end, newEvent.id, newEvent.sender_email]);


  const isMemberBusy = (member) => {
    const memberId = typeof member.member_id === 'number' ?
      member.member_id : parseInt(member.member_id);

    const result = DisabledTeamMembers.includes(memberId);
    return result;
  };

  // const removeAssignedMember = (member) => {
  //   setTeamMembers([...teamMembers, member]);
  //   setAssignedMembers(
  //     assignedMembers.filter((m) => m.member_id !== member.member_id)
  //   );
  // };

  // const assignMember = (member) => {
  //   if (isMemberBusy(member)) {
  //     showWarningToast({ message: `${member.member_name} is not available during this time period.` });
  //     return;
  //   }

  //   // Prevent assigning members who are event owners or handlers
  //   if (member.isEventOwner) {
  //     showWarningToast({ message: `${member.member_name} is the owner of this event and cannot be assigned.` });
  //     return;
  //   }

  //   if (member.isEventHandler) {
  //     showWarningToast({ message: `${member.member_name} is the event handler and cannot be assigned.` });
  //     return;
  //   }

  //   setAssignedMembers([...assignedMembers, member]);
  //   setTeamMembers(teamMembers.filter((m) => m.member_id !== member.member_id));
  // };

  // First step form showing basic event info
  const renderBasicInfoForm = () => (
    <form className="basic-info-form">
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

      <div className="form-field">
        <label className="form-label">Event Info</label>
        <div className="event-info-box">
          <div className="event-date-time">
            <div className="info-row">
              <span className="info-label">Start:</span>
              <span className="info-value">{formatDate(newEvent.start)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">End:</span>
              <span className="info-value">{formatDate(newEvent.end)}</span>
            </div>
          </div>
          {isMultiDayEvent && (
            <div className="info-row days-count">
              <span className="info-label">Total Days:</span>
              <span className="info-value day-count">{eventDays.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Event Color</label>
        <div className="color-selector">
          {COLOR_OPTIONS.map((color) => (
            <div
              key={color.id}
              className={`color-option ${newEvent.backgroundColor === color.value ? "selected" : ""}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setNewEvent({ ...newEvent, backgroundColor: color.value })}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="cancel-btn"
          onClick={() => setShowEventModal(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="next-btn"
          onClick={() => setFormStep(2)}
        >
          Next
        </button>
      </div>
    </form>
  );

  // Second step form showing team assignment
  const renderTeamAssignmentForm = () => (
    <div className="team-assignment-form">
      <h2>Assign Team Members</h2>

      <div className="team-assignment-container">
        {/* Left side: Day selection */}
        {isMultiDayEvent && (
          <div className="days-sidebar">
            <h4>Event Days</h4>
            <div className="day-items-container">
              {eventDays.map((day, index) => {
                const hasAssignment = dayAssignments[index] && dayAssignments[index].length > 0;

                return (
                  <div
                    key={index}
                    className={`day-item ${selectedDayIndex === index ? 'day-item-active' : ''} ${hasAssignment ? 'has-assignment' : ''}`}
                    onClick={() => setSelectedDayIndex(index)}
                  >
                    <div className="day-item-number">Day {index + 1}</div>
                    <div className="day-item-date">{formatDate(day.start_date)}</div>
                    {hasAssignment ? (
                      <div className="day-item-member">
                        <span className="assigned-icon">✓</span>
                        {dayAssignments[index][0].member_name}
                      </div>
                    ) : (
                      <div className="day-item-status unassigned">Not assigned</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right side: Team members */}
        <div className="team-members-container">
          {isMultiDayEvent ? (
            <div className="day-assignment">
              <h3>Assign Team Member for Day {selectedDayIndex + 1}</h3>

              {/* Current assignment for this day */}
              {dayAssignments[selectedDayIndex] && dayAssignments[selectedDayIndex].length > 0 && (
                <div className="current-assignment">
                  <h4>Current Assignment</h4>
                  <div className="assigned-member-card">
                    <div className="member-avatar-container">
                      <img
                        src={dayAssignments[selectedDayIndex][0].member_profile_img ?
                          (["1", "2", "3", "4"].includes(dayAssignments[selectedDayIndex][0].member_profile_img) ?
                            `${profile_pic_user1}` : // This is a placeholder
                            `${Server_url}/owner/profile-image/${dayAssignments[selectedDayIndex][0].team_member_email}`) :
                          user_backicon}
                        alt={dayAssignments[selectedDayIndex][0].member_name}
                        className="member-img"
                      />
                    </div>
                    <div className="assigned-member-details">
                      <div className="member-name">{dayAssignments[selectedDayIndex][0].member_name}</div>
                      <div className="member-role">{dayAssignments[selectedDayIndex][0].role}</div>
                      <div className="member-payment">${dayAssignments[selectedDayIndex][0].payment}/day</div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => {
                        const newAssignments = { ...dayAssignments };
                        newAssignments[selectedDayIndex] = [];
                        setDayAssignments(newAssignments);
                        updateDayAssignments(newAssignments);
                      }}
                    >
                      <CiCircleMinus />
                    </button>
                  </div>
                </div>
              )}

              {/* Available members list */}
              <div className="available-members">
                <h4>Available Team Members</h4>
                <div className="team-members-section">
                  <ul className="team-list">
                    {teamMembers.map((member) => {
                      const isDisabled = isMemberBusy(member);

                      // Don't show if already assigned to this day or is owner/handler
                      if ((dayAssignments[selectedDayIndex] &&
                        dayAssignments[selectedDayIndex].some(m => m.member_id === member.member_id)) ||
                        member.isEventOwner ||
                        member.isEventHandler) {
                        return null;
                      }

                      return (
                        <TeamMember
                          key={member.member_id}
                          member={{ ...member, status: isDisabled ? 'busy' : 'available' }}
                          onAction={() => openAssignmentModal(member)}
                          actionIcon={CiCirclePlus}
                          isDisabled={isDisabled}
                          actionButtonClass="assign-btn"
                        />
                      );
                    })}
                  </ul>

                  {teamMembers.filter(m => !m.isEventOwner && !m.isEventHandler).length === 0 && (
                    <div className="no-members-message">
                      <p>No team members available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="team-members-section">
              <h3>Assign Team Member</h3>

              {/* Current assignment for single day event */}
              {assignedMembers.length > 0 && (
                <div className="current-assignment">
                  <h4>Current Assignment</h4>
                  <div className="assigned-member-card">
                    <div className="member-avatar-container">
                      <img
                        src={assignedMembers[0].member_profile_img ?
                          (["1", "2", "3", "4"].includes(assignedMembers[0].member_profile_img) ?
                            `${profile_pic_user1}` : // This is a placeholder
                            `${Server_url}/owner/profile-image/${assignedMembers[0].team_member_email}`) :
                          user_backicon}
                        alt={assignedMembers[0].member_name}
                        className="member-img"
                      />
                    </div>
                    <div className="assigned-member-details">
                      <div className="member-name">{assignedMembers[0].member_name}</div>
                      <div className="member-role">{assignedMembers[0].role}</div>
                      <div className="member-payment">${assignedMembers[0].payment}/day</div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => setAssignedMembers([])}
                    >
                      <CiCircleMinus />
                    </button>
                  </div>
                </div>
              )}

              {/* Available members list */}
              <div className="available-members">
                <h4>Available Team Members</h4>
                <ul className="team-list">
                  {teamMembers.map((member) => {
                    const isDisabled = isMemberBusy(member);

                    // Don't show if already assigned or is owner/handler
                    if (assignedMembers.some(m => m.member_id === member.member_id) ||
                      member.isEventOwner ||
                      member.isEventHandler) {
                      return null;
                    }

                    return (
                      <TeamMember
                        key={member.member_id}
                        member={{ ...member, status: isDisabled ? 'busy' : 'available' }}
                        onAction={() => openAssignmentModal(member)}
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
          )}
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="back-btn"
          onClick={() => setFormStep(1)}
        >
          Back
        </button>
        <button
          type="button"
          className="confirm-btn"
          onClick={handleAddEvent}
          disabled={newEvent.event_status === "Waiting on Team" || isLoading}
        >
          {newEvent.event_status === "Waiting on Team" ? (
            <span className="waiting-status">
              <FaClock /> Team Confirmation
            </span>
          ) : isLoading ? "Processing..." : "Confirm Event"}
        </button>
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
    <div className="modal-overlay_add_event" onClick={() => setShowEventModal(false)}>
      <div
        className={`modal-content add_event_modal 
          ${newEvent.event_request_type === "equipment" ? "set_equipment_event" : ""} 
          ${formStep === 2 ? "step-two" : ""} 
          ${isMultiDayEvent && formStep === 2 ? "if_is_multi_day_and_page_2" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={() => setShowEventModal(false)}>
          ×
        </button>

        <div className="modal-content-container">
          {formStep === 1 ? (
            renderBasicInfoForm()
          ) : (
            newEvent.event_request_type === "equipment" ?
              renderUserProfileSection() :
              renderTeamAssignmentForm()
          )}
        </div>

        {isLoading && <EmailSendingLoader />}
        {renderAssignmentModal()}
      </div>
    </div>
  );
};

export default AddDetailsPop;

