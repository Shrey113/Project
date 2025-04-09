import React, { useState, useEffect } from "react";
import "./TeamOverview.css";
import { useSelector } from "react-redux";
// import add_icon from "./Team_overview/plus.png";
import Edit_icon from "./Team_overview/pencil.png";
import Remove_icon from "./Team_overview/delete.png";
// import View_icon from "./Team_overview/info.png";
import profile_pic_user1 from "./profile_pic/user1.jpg";
import profile_pic_user2 from "./profile_pic/user2.jpg";
import profile_pic_user3 from "./profile_pic/user3.jpg";
import profile_pic_user4 from "./profile_pic/user4.jpg";

import ilasstion_1 from './../img/team_memeber/Good team-bro.png';
import ilasstion_2 from './../img/team_memeber/New team members-pana.png';

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

// const ADDCard = ({ total_member }) => {
//   return (
//     <div className="card_for_a_owner_team">
//       {/* <div className="icon">
//         <img src={all_user} alt="" />
//       </div> */}
//       <h3 className="title">Total member</h3>
//       <p className="description">{total_member}</p>
//       <div className="avatars">
//         <img src={profile_pic_user1} alt="Avatar 1" />
//         <img src={profile_pic_user2} alt="Avatar 2" />
//         <img src={profile_pic_user3} alt="Avatar 3" />
//         <img src={profile_pic_user4} alt="Avatar 4" />
//       </div>
//     </div>
//   );
// };

// const ADDCardForActive = ({ total_member }) => {
//   return (
//     <div className="card_for_a_owner_team">
//       {/* <div className="icon">
//         <img src={all_user} alt="" />
//       </div> */}
//       <h3 className="title">Active member</h3>
//       <p className="description">{total_member}</p>
//       <div className="avatars">
//         <img src={profile_pic_user1} alt="Avatar 1" />
//         <img src={profile_pic_user2} alt="Avatar 2" />
//         <img src={profile_pic_user3} alt="Avatar 3" />
//         <img src={profile_pic_user4} alt="Avatar 4" />
//       </div>
//     </div>
//   );
// };

// const ActionMenu = ({ member, onEdit, onRemove, onView }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   // Add useEffect for handling outside clicks
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showMenu && !event.target.closest(".action-menu-container")) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showMenu]);

//   return (
//     <div className="action-menu-container">
//       {/* Show 3-dot menu button on mobile */}
//       <button
//         className="mobile-menu-trigger"
//         onClick={() => setShowMenu(!showMenu)}
//       >
//         <span></span>
//         <span></span>
//         <span></span>
//       </button>

//       {/* Regular buttons for desktop */}
//       <div className="desktop-actions">
//         <button onClick={onEdit}>
//           <img src={Edit_icon} alt="Edit Icon" />
//         </button>
//         <button onClick={onRemove}>
//           <img src={Remove_icon} alt="Remove Icon" />
//         </button>
//         <button onClick={onView}>
//           <img src={View_icon} alt="View Icon" />
//         </button>
//       </div>

//       {/* Popup menu for mobile */}
//       {showMenu && (
//         <div className="mobile-action-menu">
//           <button
//             onClick={() => {
//               onEdit();
//               setShowMenu(false);
//             }}
//           >
//             <img src={Edit_icon} alt="Edit Icon" />
//             <span>Edit</span>
//           </button>
//           <button
//             onClick={() => {
//               onRemove();
//               setShowMenu(false);
//             }}
//           >
//             <img src={Remove_icon} alt="Remove Icon" />
//             <span>Remove</span>
//           </button>
//           <button
//             onClick={() => {
//               onView();
//               setShowMenu(false);
//             }}
//           >
//             <img src={View_icon} alt="View Icon" />
//             <span>View</span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

const DetailPopup = ({ member, onClose }) => {
  // Add click handler for overlay
  const handleOverlayClick = (e) => {
    if (e.target.className === "detail-popup-overlay") {
      onClose();
    }
  };

  return (
    <div className="detail-popup-overlay" onClick={handleOverlayClick}>
      <div className="detail-popup-content">
        <div className="detail-header">
          <div className="detail-profile">
            <img src={member.member_profile_img} alt={member.member_name} />
            <div className="detail-profile-info">
              <h2>{member.member_name}</h2>
              <span className={`status-badge ${member.member_status.toLowerCase() === 'available' ? 'assigned' : 'available'}`}>
                {member.member_status.toLowerCase() === 'available' ? 'Assigned' : 'Available'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3>Professional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Role</label>
                <p>{member.member_role}</p>
              </div>
              <div className="info-item">
                <label>Event Assignment</label>
                <p>{member.member_event_assignment || "No current assignment"}</p>
              </div>
              <div className="info-item">
                <label>Member ID</label>
                <p>{member.member_id}</p>
              </div>
              <div className="info-item">
                <label>Join Date</label>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member, onEdit, onRemove, activeDropdown, setActiveDropdown }) => {
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const isDropdownActive = activeDropdown === member.member_id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownActive && !event.target.closest('.more-options-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownActive, setActiveDropdown]);

  return (
    <div className="member-card">
      <div className="status-indicator">
        <span className={member.member_status === "Active" ? "available" : "assigned"}></span>
        <div className="more-options-container">
          <button
            className="more-options"
            onClick={() => {
              setActiveDropdown(isDropdownActive ? null : member.member_id);
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          {isDropdownActive && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item edit-btn"
                onClick={() => {
                  onEdit(member);
                  setActiveDropdown(null);
                }}
              >
                <img src={Edit_icon} alt="Edit" />
                <span>Edit</span>
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item delete-btn"
                onClick={() => {
                  let is_confrom = window.confirm("You wont to remove member")
                  if (is_confrom) {
                    onRemove(member.member_id, member.owner_email);
                  }
                  setActiveDropdown(null);
                }}
              >
                <img src={Remove_icon} alt="Remove" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-image">
          <img src={member.member_profile_img} alt={member.member_name} />
        </div>
        <h3>{member.member_name}</h3>
        <p className="role">{member.member_role}</p>
      </div>
      <div className="divider"></div>
      <button
        className={`details-btn ${member.member_status === "Available" ? "available" : "assigned"}`}
        onClick={() => {
          if (member.member_status === "Available") {
            setShowDetailPopup(true);
          }

        }}
      >
        Details
      </button>

      {showDetailPopup && (
        <DetailPopup
          member={member}
          onClose={() => setShowDetailPopup(false)}
        />
      )}
    </div>
  );
};

const TeamOverview = () => {
  const user = useSelector((state) => state.user);
  const [teamData, setTeamData] = useState([]);

  // const fetchTeamMembers = async () => {
  //   try {
  //     // Fetch assigned members
  //     const statusResponse = await fetch(`${Server_url}/team_members/get_all_members_status`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         user_email: user.user_email,
  //       }),
  //     });

  //     const statusData = await statusResponse.json();
  //     console.log("Fetched Status Data:", statusData);

  //     // Extract assigned members and their event details
  //     let assignedMembersMap = new Map();

  //     // Check if statusData has the expected structure
  //     if (statusData && Array.isArray(statusData.assigned_team_member) && Array.isArray(statusData.event_details)) {
  //       statusData.assigned_team_member.forEach((member, index) => {
  //         if (member) {
  //           assignedMembersMap.set(member, {
  //             event_request_type: statusData.event_details[index]?.event_request_type || 'Unknown',
  //             event_detail: statusData.event_details[index]?.event_detail || 'Unknown'
  //           });
  //         }
  //       });
  //     }

  //     // Rest of the fetch logic remains the same
  //     const membersResponse = await fetch(`${Server_url}/team_members/get_members`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         user_email: user.user_email,
  //       }),
  //     });

  //     const membersData = await membersResponse.json();
  //     console.log("Fetched Members Data:", membersData);

  //     // Update team members' status based on assignment
  //     const updatedTeamData = membersData.map(member => {

  //       const assignment = assignedMembersMap.get(member.member_name);

  //       return {
  //         ...member,
  //         member_status: assignment ? "Available" : "Active",
  //         member_event_assignment: assignment
  //           ? `${assignment.event_request_type} - ${assignment.event_detail}`
  //           : "Not Assigned",
  //       };
  //     });

  //     setTeamData(updatedTeamData);

  //   } catch (error) {
  //     console.error("Error fetching team members:", error);
  //   }
  // };

  const fetchTeamMembers = async () => {
    try {
      // Fetch assigned members
      const statusResponse = await fetch(`${Server_url}/team_members/get_all_members_status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.user_email,
        }),
      });

      const statusData = await statusResponse.json();

      // Extract assigned members and their event details
      let assignedMembersMap = new Map();
      
      // Safely check if statusData exists and has items
      if (statusData && Array.isArray(statusData) && statusData.length > 0 && statusData[0]) {
        // Now safely check for assigned_team_member
        if (Array.isArray(statusData[0].assigned_team_member)) {
          
          statusData.forEach((item) => {
            if (item && Array.isArray(item.assigned_team_member)) {
              item.assigned_team_member.forEach((member) => {
                if (member) {
                  assignedMembersMap.set(member, {
                    event_request_type: item.event_request_type || 'Unknown',
                    event_detail: item.event_detail || 'Unknown'
                  });
                }
              });
            } else {
              console.warn("Skipping item with invalid assigned_team_member:", item);
            }
          });
        } 
        // else {
        //   console.log("statusData has no valid assigned_team_member array");
        // }
      } 
      // else {
      //   console.log("No valid status data available");
      // }

      // Rest of the fetch logic remains the same
      const membersResponse = await fetch(`${Server_url}/team_members/get_members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.user_email,
        }),
      });

      const membersData = await membersResponse.json();

      // Update team members' status based on assignment
      const updatedTeamData = membersData.map(member => {
        const assignment = assignedMembersMap.get(member.member_name);

        return {
          ...member,
          member_status: assignment ? "Available" : "Active",
          member_event_assignment: assignment
            ? `${assignment.event_request_type} - ${assignment.event_detail}`
            : "Not Assigned",
        };
      });

      setTeamData(updatedTeamData);

    } catch (error) {
      console.error("Error fetching team members:", error);
      // Set empty array as fallback to prevent further errors
      setTeamData([]);
    }
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Fetch assigned members
        const statusResponse = await fetch(`${Server_url}/team_members/get_all_members_status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.user_email,
          }),
        });

        const statusData = await statusResponse.json();
        console.log("Fetched Status Data:", statusData);

        // Extract assigned members and their event details
        let assignedMembersMap = new Map();
        
        // Safely check if statusData exists and has items
        if (statusData && Array.isArray(statusData) && statusData.length > 0 && statusData[0]) {
          // Now safely check for assigned_team_member
          if (Array.isArray(statusData[0].assigned_team_member)) {
            console.log("statusData available");
            
            statusData.forEach((item) => {
              if (item && Array.isArray(item.assigned_team_member)) {
                item.assigned_team_member.forEach((member) => {
                  if (member) {
                    assignedMembersMap.set(member, {
                      event_request_type: item.event_request_type || 'Unknown',
                      event_detail: item.event_detail || 'Unknown'
                    });
                  }
                });
              } else {
                console.warn("Skipping item with invalid assigned_team_member:", item);
              }
            });
          }
          //  else {
          //   console.log("statusData has no valid assigned_team_member array");
          // }
        }
        //  else {
        //   console.log("No valid status data available");
        // }

        // Rest of the fetch logic remains the same
        const membersResponse = await fetch(`${Server_url}/team_members/get_members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.user_email,
          }),
        });

        const membersData = await membersResponse.json();

        // Update team members' status based on assignment
        const updatedTeamData = membersData.map(member => {
          const assignment = assignedMembersMap.get(member.member_name);

          return {
            ...member,
            member_status: assignment ? "Available" : "Active",
            member_event_assignment: assignment
              ? `${assignment.event_request_type} - ${assignment.event_detail}`
              : "Not Assigned",
          };
        });

        setTeamData(updatedTeamData);

      } catch (error) {
        console.error("Error fetching team members:", error);
        // Set empty array as fallback to prevent further errors
        setTeamData([]);
      }
    };
    fetchTeamMembers();
  }, [user.user_email]);

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

  // const handleViewUser = (member) => {
  //   setPopupState({ show: true, action: "View", member });
  // };

  const handleSave = (newData) => {
    if (popupState.action === "Add") {
      setTeamData([...teamData, newData]);
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

  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <div className="team-overview-container">
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card total-members">
          <div className="data-container">
            <h2>Total Member</h2>
            <div className="count">{teamData.length}</div>
          </div>
          <img src={ilasstion_2} alt="ilasstion_2" />

        </div>
        <div className="stat-card active-members">
          <div className="data-container">
            <h2>Active Member</h2>
            <div className="count">{totalMemberStatusLength}</div>
          </div>
          <img src={ilasstion_1} alt="ilasstion_1" />
        </div>
      </div>

      {/* Team Overview Section */}
      <div className="team-section">
        <div className="section-header">
          <div className="title-and-legend">
            <h2>Team Overview</h2>
            <div className="status-legend">
              <span className="legend-item">
                <span className="dot available"></span> Available
              </span>
              <span className="legend-item">
                <span className="dot assigned"></span> Assigned
              </span>
            </div>
          </div>
          <button className={`add-member-btn_top ${teamData.length === 0 ? 'assigned' : 'available'}`} onClick={handleAddUser}>
            <span>Add Member</span>
            <span className="plus-icon">+</span>
          </button>
        </div>

        {teamData.length === 0 ? (
          <div className="empty-team-state">
            <div className="empty-profile-stack">
              <div className="profile-overlay">
                <img src={profile_pic_user1} alt="Team member" className="empty-profile-img" />
                <img src={profile_pic_user2} alt="Team member" className="empty-profile-img" />
                <img src={profile_pic_user3} alt="Team member" className="empty-profile-img" />
                <img src={profile_pic_user4} alt="Team member" className="empty-profile-img" />
              </div>
            </div>
            <h3>Build Your Dream Team</h3>
            <p>Start by adding your first team member. Expand your photography business with a talented crew!</p>
            <button className="add-member-btn empty-state-btn" onClick={handleAddUser}>
              <span>Add Your First Team Member</span>
              <span className="plus-icon">+</span>
            </button>
          </div>
        ) : (
          <div className="members-grid">
            {teamData.map((member, index) => (
              <MemberCard
                key={index}
                member={member}
                onEdit={handleEditUser}
                onRemove={handleRemoveUser}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keep existing popup component */}
      {popupState.show && (
        <PopUp
          action={popupState.action}
          member={popupState.member}
          onClose={() => setPopupState({ show: false, action: "", member: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TeamOverview;
