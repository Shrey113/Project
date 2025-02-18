import React, { useState, useEffect } from "react";
import "./TeamOverview.css";
import { useSelector } from "react-redux";
import add_icon from "./Team_overview/plus.png";
import Edit_icon from "./Team_overview/pencil.png";
import Remove_icon from "./Team_overview/delete.png";
import View_icon from "./Team_overview/info.png";
import profile_pic_user1 from "./profile_pic/user1.jpg";
import profile_pic_user2 from "./profile_pic/user2.jpg";
import profile_pic_user3 from "./profile_pic/user3.jpg";
import profile_pic_user4 from "./profile_pic/user4.jpg";

// import all_user from './Team_overview/sigma.png';

import { Server_url } from "../../../redux/AllData";

const PopUp = ({ action, member, onClose, onSave }) => {
  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    member_id: member?.member_id || "",
    member_name: member?.member_name || "",
    member_role: member?.member_role || "",
    member_event_assignment: member?.member_event_assignment || "",
    member_status: member?.member_status || "Active",
    member_profile_img: member?.member_profile_img || profile_pic_user1,
  });

  const [formErrors, setFormErrors] = useState({
    member_name: "",
    member_role: "",
    member_event_assignment: "",
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.member_name) errors.member_name = "Name is required";
    if (!formData.member_role) errors.member_role = "Role is required";
    if (!formData.member_event_assignment)
      errors.member_event_assignment = "Event Assignment is required";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePicChange = (img) => {
    setFormData({ ...formData, member_profile_img: img });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (action === "Add") {
      // Handle adding a new member
      try {
        const response = await fetch(`${Server_url}/team_members/add_members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner_email: user.user_email,
            member_name: formData.member_name,
            member_profile_img: profile_pic_user1,
            member_role: formData.member_role,
            member_event_assignment: formData.member_event_assignment,
            member_status: formData.member_status,
          }),
        });

        if (response.ok) {
          onSave(formData);
        } else {
          console.error("Failed to add member");
        }
      } catch (error) {
        console.error("Error adding team member:", error);
      }
    } else if (action === "Edit") {
      // Handle updating an existing member
      try {
        const response = await fetch(
          `${Server_url}/team_members/update_member`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              member_id: formData.member_id, // Unique ID
              owner_email: user.user_email,
              member_name: formData.member_name,
              member_profile_img: formData.member_profile_img,
              member_role: formData.member_role,
              member_event_assignment: formData.member_event_assignment,
              member_status: formData.member_status,
            }),
          }
        );

        if (response.ok) {
          onSave(formData);
        } else {
          console.error("Failed to update member");
        }
      } catch (error) {
        console.error("Error updating team member:", error);
      }
    }
    onClose();
  };

  // Add click handler for overlay
  const handleOverlayClick = (e) => {
    if (e.target.className === "popup-overlay") {
      onClose();
    }
  };

  return (
    <div
      className="popup-overlay"
      id="TeamOverview_pop_menu"
      onClick={handleOverlayClick}
    >
      <div className="popup-content">
        <h3>{action} User</h3>
        {action !== "View" ? (
          <form>
            <label>
              Name:
              <input
                type="text"
                name="member_name"
                value={formData.member_name}
                onChange={handleChange}
              />
              {formErrors.member_name && (
                <div className="error">{formErrors.member_name}</div>
              )}
            </label>
            <label>
              Role:
              <input
                type="text"
                name="member_role"
                value={formData.member_role}
                onChange={handleChange}
              />
              {formErrors.member_role && (
                <div className="error">{formErrors.member_role}</div>
              )}
            </label>
            <label>
              Event Assignment:
              <input
                type="text"
                name="member_event_assignment"
                value={formData.member_event_assignment}
                onChange={handleChange}
              />
              {formErrors.member_event_assignment && (
                <div className="error">
                  {formErrors.member_event_assignment}
                </div>
              )}
            </label>
            <label>
              Status:
              <select
                name="member_status"
                value={formData.member_status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>

            <label className="pro_title">Profile Picture:</label>
            <div className="profile-pic-selection">
              <img
                src={profile_pic_user1}
                alt="User 1"
                onClick={() => handleProfilePicChange(profile_pic_user1)}
                className={
                  formData.member_profile_img === profile_pic_user1
                    ? "selected"
                    : ""
                }
              />
              <img
                src={profile_pic_user2}
                alt="User 2"
                onClick={() => handleProfilePicChange(profile_pic_user2)}
                className={
                  formData.member_profile_img === profile_pic_user2
                    ? "selected"
                    : ""
                }
              />
              <img
                src={profile_pic_user3}
                alt="User 3"
                onClick={() => handleProfilePicChange(profile_pic_user3)}
                className={
                  formData.member_profile_img === profile_pic_user3
                    ? "selected"
                    : ""
                }
              />
              <img
                src={profile_pic_user4}
                alt="User 4"
                onClick={() => handleProfilePicChange(profile_pic_user4)}
                className={
                  formData.member_profile_img === profile_pic_user4
                    ? "selected"
                    : ""
                }
              />
            </div>
          </form>
        ) : (
          <div className="member-card">
            <table className="member-table">
              <tbody>
                <tr>
                  <td className="label">
                    <strong>Name:</strong>
                  </td>
                  <td>{formData.member_name}</td>
                </tr>
                <tr>
                  <td className="label">
                    <strong>Role:</strong>
                  </td>
                  <td>{formData.member_role}</td>
                </tr>
                <tr>
                  <td className="label">
                    <strong>Event Assignment:</strong>
                  </td>
                  <td>{formData.member_event_assignment || "Unassigned"}</td>
                </tr>
                <tr>
                  <td className="label">
                    <strong>Status:</strong>
                  </td>
                  <td>{formData.member_status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="popup-actions">
          <button onClick={onClose}>Cancel</button>
          {action !== "View" && <button onClick={handleSubmit}>Save</button>}
        </div>
      </div>
    </div>
  );
};

const ADDCard = ({ total_member }) => {
  return (
    <div className="card_for_a_owner_team">
      {/* <div className="icon">
        <img src={all_user} alt="" />
      </div> */}
      <h3 className="title">Total member</h3>
      <p className="description">{total_member}</p>
      <div className="avatars">
        <img src={profile_pic_user1} alt="Avatar 1" />
        <img src={profile_pic_user2} alt="Avatar 2" />
        <img src={profile_pic_user3} alt="Avatar 3" />
        <img src={profile_pic_user4} alt="Avatar 4" />
      </div>
    </div>
  );
};

const ADDCardForActive = ({ total_member }) => {
  return (
    <div className="card_for_a_owner_team">
      {/* <div className="icon">
        <img src={all_user} alt="" />
      </div> */}
      <h3 className="title">Active member</h3>
      <p className="description">{total_member}</p>
      <div className="avatars">
        <img src={profile_pic_user1} alt="Avatar 1" />
        <img src={profile_pic_user2} alt="Avatar 2" />
        <img src={profile_pic_user3} alt="Avatar 3" />
        <img src={profile_pic_user4} alt="Avatar 4" />
      </div>
    </div>
  );
};

const ActionMenu = ({ member, onEdit, onRemove, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Add useEffect for handling outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(".action-menu-container")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="action-menu-container">
      {/* Show 3-dot menu button on mobile */}
      <button
        className="mobile-menu-trigger"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Regular buttons for desktop */}
      <div className="desktop-actions">
        <button onClick={onEdit}>
          <img src={Edit_icon} alt="Edit Icon" />
        </button>
        <button onClick={onRemove}>
          <img src={Remove_icon} alt="Remove Icon" />
        </button>
        <button onClick={onView}>
          <img src={View_icon} alt="View Icon" />
        </button>
      </div>

      {/* Popup menu for mobile */}
      {showMenu && (
        <div className="mobile-action-menu">
          <button
            onClick={() => {
              onEdit();
              setShowMenu(false);
            }}
          >
            <img src={Edit_icon} alt="Edit Icon" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              onRemove();
              setShowMenu(false);
            }}
          >
            <img src={Remove_icon} alt="Remove Icon" />
            <span>Remove</span>
          </button>
          <button
            onClick={() => {
              onView();
              setShowMenu(false);
            }}
          >
            <img src={View_icon} alt="View Icon" />
            <span>View</span>
          </button>
        </div>
      )}
    </div>
  );
};

const TeamOverview = () => {
  const user = useSelector((state) => state.user);
  const [teamData, setTeamData] = useState([]);
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${Server_url}/team_members/get_members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.user_email,
        }),
      });
      const data = await response.json();
      setTeamData(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${Server_url}/team_members/get_members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.user_email,
          }),
        });
        const data = await response.json();
        setTeamData(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };
    fetchTeamMembers();
  }, [ user.user_email]);

  const [popupState, setPopupState] = useState({
    show: false,
    action: "",
    member: null,
  });

  const handleAddUser = () => {
    setPopupState({ show: true, action: "Add", member: null });
  };

  const handleEditUser = (member) => {
    setPopupState({ show: true, action: "Edit", member: { ...member } }); // Spread the member data to make sure it's passed correctly
  };

  const handleViewUser = (member) => {
    setPopupState({ show: true, action: "View", member });
  };

  const handleSave = (newData) => {
    if (popupState.action === "Add") {
      setTeamData([...teamData, newData]);
      fetchTeamMembers();
    } else if (popupState.action === "Edit") {
      fetchTeamMembers();
    }
  };

  const handleRemoveUser = async (memberId, ownerEmail) => {
    try {
      // Sending DELETE request to the backend to remove the member
      const response = await fetch(`${Server_url}/team_members/delete_member`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: memberId,
          owner_email: ownerEmail, // Pass owner_email along with member_id
        }),
      });

      if (response.ok) {
        fetchTeamMembers();
      } else {
        console.error("Failed to delete member");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const totalMemberStatusLength = teamData.reduce((total, item) => {
    return item.member_status === "Active" ? total + 1 : total;
  }, 0);

  // Add new useEffect for handling outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupState.show &&
        !event.target.closest(".popup-content") &&
        !event.target.closest("button")
      ) {
        setPopupState({ show: false, action: "", member: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupState.show]);

  return (
    <div className="team-overview">
      <div className="all_card_con">
        <ADDCard total_member={teamData.length} />

        <ADDCardForActive total_member={totalMemberStatusLength} />
      </div>

      <div className="team-member-list">
        <div className="title_bar">
          <h2>Team Overview</h2>
          <button onClick={handleAddUser}>
            <img src={add_icon} alt="Add Icon" />
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Role</th>
              <th>Event Assignment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamData.map((member, index) => (
              <tr key={index}>
                <td data-label="No">{index + 1}</td>
                <td data-label="Name">
                  <div className="profile_con">
                    <div className="profile_img">
                      <img src={member.member_profile_img} alt="" />
                    </div>
                    <div className="data">{member.member_name}</div>
                  </div>
                </td>
                <td data-label="Role">{member.member_role}</td>
                <td data-label="Event Assignment">
                  {member.member_event_assignment || "Unassigned"}
                </td>
                <td data-label="Status">{member.member_status}</td>
                <td data-label="Actions">
                  <ActionMenu
                    member={member}
                    onEdit={() => handleEditUser(member)}
                    onRemove={() =>
                      handleRemoveUser(member.member_id, user.user_email)
                    }
                    onView={() => handleViewUser(member)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popupState.show && (
        <PopUp
          action={popupState.action}
          member={popupState.member}
          onClose={() =>
            setPopupState({ show: false, action: "", member: null })
          }
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TeamOverview;
