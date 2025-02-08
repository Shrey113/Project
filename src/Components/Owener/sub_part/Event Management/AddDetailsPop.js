import React, { useEffect, useState } from "react";
import "./../Calendar/part/AddDetailsPop.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSelector } from "react-redux";
// import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";

// import { CiCirclePlus } from "react-icons/md";
import { CiCirclePlus,CiCircleMinus } from "react-icons/ci";
// import { IoRemoveCircleOutline } from "react-icons/io5";
import { Server_url } from "../../../../redux/AllData";

// Create a custom theme for the date picker
const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
    },
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
        root: {
          color: "#6b7280",
        },
      },
    },
  },
});

const colorOptions = [
  { id: "purple", value: "#6366F1", label: "Purple" },
  { id: "green", value: "#22C55E", label: "Green" },
  { id: "orange", value: "#F59E0B", label: "Orange" },
  { id: "red", value: "#EF4444", label: "Red" },
];

const AddDetailsPop = ({ setShowEventModal, newEvent, setNewEvent }) => {
  const user = useSelector((state) => state.user);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [DisabledTeamMembers, setDisabledTeamMembers] = useState([]);

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

  const handleAddEvent = (e) => {
    e.preventDefault();

    if (validateForm()) {
      fetch(`${Server_url}/calendar/add-event-with-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.user_email,
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          backgroundColor: newEvent.backgroundColor,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Event created successfully") {
            // Second fetch request to assign team members
            fetch(`${Server_url}/add-team-members`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_email: user.user_email,
                team_members: assignedMembers,
                event_id: newEvent.id,
              }),
            })
              .then((res) => res.json())
              .then((assignData) => {
                if (
                  assignData.message === "Team members assigned successfully"
                ) {
                  alert("Event and team members assigned successfully!");
                  setShowEventModal(false);
                  setNewEvent({
                    title: "",
                    start: new Date(),
                    end: new Date(),
                    description: "",
                    backgroundColor: "#6366F1",
                    titleError: "",
                  });
                } else {
                  alert("Event created, but failed to assign team members.");
                }
              })
              .catch((error) => {
                console.error("Error assigning team members:", error);
                alert(
                  "Event created, but there was an error assigning team members."
                );
              });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to create event.");
        });
    }
  };

  const fetchTeamMembers = async () => {
    if (showTeamModal) {
      setShowTeamModal(false);
      return;
    }
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
      console.log("Team members:", data);

      setShowTeamModal(true);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }

    function formatDate(isoString) {
      const date = new Date(isoString);
      return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0")
      );
    }

    try {
      const response = await fetch(
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
      const data = await response.json();
      setDisabledTeamMembers(data.assignedTeamMembers);
      console.log("Filtered data of user", data.assignedTeamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // const fetchDetailsDeep = async () => {
  //   try {
  //     const response = await fetch(`${Server_url}/team_members/filtered_data`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         user_email: user.user_email,
  //       }),
  //     });
  //     const data = await response.json();
  //     console.log("Filtered data of user", data);
  //   } catch (error) {
  //     console.error("Error fetching team members:", error);
  //   }
  // };

  useEffect(() => {
    fetchTeamMembers();
  }, []);
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
  return (
    <div className="modal-overlay_add_event">
      <div className="modal-content add_event_modal">
        <button
          className="modal-close"
          onClick={() => setShowEventModal(false)}
        >
          ×
        </button>

        <form onSubmit={handleAddEvent}>
          <h2>Add New Event</h2>
          <div className="form-field">
            <label className="form-label">Event Title</label>
            <input
              className="event-title-input"
              type="text"
              placeholder="Enter event title"
              value={newEvent.title}
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
              {colorOptions.map((color) => (
                <div
                  key={color.id}
                  className={`color-option ${
                    newEvent.backgroundColor === color.value ? "selected" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() =>
                    setNewEvent({ ...newEvent, backgroundColor: color.value })
                  }
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* )} */}

          <div className="modal-actions">
            <button type="submit">Confirm Event</button>
            <button type="button" onClick={() => setShowEventModal(false)}>
              Cancel
            </button>
          </div>
        </form>

        <div className="assign_team_member_section">
          <h3>Assigned Members</h3>
          {assignedMembers.length > 0 && (
            <div className="assigned-members-section">
              
              <ul className="team-list">
                {assignedMembers.map((member) => (
                  <li key={member.member_id} className="team-member">
                    <img
                      src={member.member_profile_img}
                      alt={member.member_name}
                      className="member-img"
                    />
                    <div className="member-info">
                      <strong>{member.member_name}</strong>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeAssignedMember(member)}
                    >
                      <CiCircleMinus
                        style={{ height: "20px", width: "20px" }}
                      />
                    </button>
                  </li>
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
                    <li
                      key={member.member_id}
                      className={`team-member  ${
                        isDisabled ? "down_opacity" : ""
                      }`}
                    >
                      <img
                        src={member.member_profile_img}
                        alt={member.member_name}
                        className="member-img"
                      />
                      <div className="member-info">
                        <strong>{member.member_name}</strong>
                      </div>
                      <button
                        className="assign-btn"
                        onClick={() => assignMember(member)}
                        disabled={isDisabled}
                        title={
                          isDisabled
                            ? "This team member cannot be assigned."
                            : ""
                        }
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        <CiCirclePlus
                          style={{ height: "20px", width: "20px" }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No team members available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDetailsPop;
