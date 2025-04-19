import React, { useState, useEffect } from "react";
import "./TeamOverview.css";
import socket from "./../../../redux/socket";
import { useSelector } from "react-redux";
// import add_icon from "./Team_overview/plus.png";
import Edit_icon from "./Team_overview/pencil.png";
import "./PopupStyles.css";
import Remove_icon from "./Team_overview/delete.png";
// import View_icon from "./Team_overview/info.png";
import profile_pic_user1 from "./profile_pic/user1.jpg";
import profile_pic_user2 from "./profile_pic/user2.jpg";
import profile_pic_user3 from "./profile_pic/user3.jpg";
import profile_pic_user4 from "./profile_pic/user4.jpg";

import ilasstion_1 from './../img/team_memeber/Good team-bro.png';
import ilasstion_2 from './../img/team_memeber/New team members-pana.png';

// import all_user from './Team_overview/sigma.png';

import { Server_url, showRejectToast, ConfirmMessage } from "../../../redux/AllData";

const PopUp = ({ action, member, onClose, onSave }) => {
  const user = useSelector((state) => state.user);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    member_id: member?.member_id || "",
    member_name: member?.member_name || "",
    member_role: member?.member_role || "",
    member_event_assignment: member?.member_event_assignment || "",
    member_status: member?.member_status || "Active",
    member_profile_img: member?.member_profile_img || profile_pic_user1,
    member_email: member?.member_email || "",
    member_phone: member?.member_phone || "",
  });

  const [formErrors, setFormErrors] = useState({
    member_name: "",
    member_role: "",
    member_event_assignment: "",
    member_email: "",
  });

  const [activeTab, setActiveTab] = useState("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);



  const validateForm = () => {
    const errors = {};
    if (!formData.member_name) errors.member_name = "Name is required";
    if (!formData.member_role) errors.member_role = "Role is required";
    if (activeTab === "manual" & !formData.member_email) errors.member_email = "Email is required";

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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 3 || !user?.user_email) return;

      setIsSearching(true);
      try {
        const response = await fetch(`${Server_url}/team_members/photographers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            user_email: user.user_email,
          }),
        });

        const data = await response.json();
        setSearchResults(data);
        // console.log("this is the data", data[0].mobile_number);
      } catch (error) {
        console.error("Error searching photographers:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 3 && user?.user_email) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, user?.user_email]);




  const handleSelectSearchResult = (result) => {
    console.log("this is the result......................", result.mobile_number);
    setSelectedSearchResult(result);
    setFormData({
      ...formData,
      member_name: result.user_name || "",
      member_email: result.user_email || "",
      member_phone: result.mobile_number || "",
      member_profile_img: result.user_profile_image_base64 || profile_pic_user1,
    });
  };

  // const sendInvitation = async (email) => {
  //   try {
  //     const response = await fetch(`${Server_url}/team_members/send_invitation`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         owner_email: user.user_email,
  //         member_email: email,
  //         member_role: formData.member_role,
  //         member_name: formData.member_name,
  //         member_profile_img: formData.member_profile_img,
  //         member_phone: formData.member_phone,
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("this is the data invitation link/////........", data);
  //       console.log("this is the data invitation link/////........", data.invitationLink);
  //       return data.invitationLink;
  //     } else {
  //       console.error("Failed to send invitation");
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error sending invitation:", error);
  //     return false;
  //   }
  // };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (action === "Add") {
      if (activeTab === "search" && selectedSearchResult) {
        try {
          setIsSending(true);
          const response = await fetch(`${Server_url}/team_members/invite_member`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              owner_email: user.user_email,
              member_name: formData.member_name,
              member_profile_img: formData.member_profile_img,
              member_role: formData.member_role,
              member_email: formData.member_email,
              member_phone: formData.member_phone,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const memberData = {
              ...data,
              member_email: data.team_member_email,
              member_phone: data.team_member_phone,
            };
            onSave(memberData);
          } else {
            const errorData = await response.json();
            console.error("Failed to add pending member:", errorData.error);
            showRejectToast({ message: errorData.error || "Failed to add team member" });
          }
          setIsSending(false);
        } catch (error) {
          console.error("Error adding pending team member:", error);
          showRejectToast({ message: "Error adding team member. Please try again." });
          setIsSending(false);
        }
      } else {
        // Use the same invite_member route for manual addition
        try {
          setIsSending(true);
          const response = await fetch(`${Server_url}/team_members/invite_member`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              owner_email: user.user_email,
              member_name: formData.member_name,
              member_profile_img: formData.member_profile_img,
              member_role: formData.member_role,
              member_email: formData.member_email,
              member_phone: formData.member_phone,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const memberData = {
              ...data,
              member_email: data.team_member_email,
              member_phone: data.team_member_phone,
            };
            onSave(memberData);
          } else {
            const errorData = await response.json();
            console.error("Failed to add member:", errorData.error);
            showRejectToast({ message: errorData.error || "Failed to add team member" });
          }
          setIsSending(false);
        } catch (error) {
          console.error("Error adding team member:", error);
          showRejectToast({ message: "Error adding team member. Please try again." });
          setIsSending(false);
        }
      }
    } else if (action === "Edit") {
      // Handle updating an existing member
      try {
        setIsSending(true);
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
              member_email: formData.member_email,
              member_phone: formData.member_phone,
            }),
          }
        );

        if (response.ok) {
          onSave(formData);
        } else {
          console.error("Failed to update member");
        }
        setIsSending(false);
      } catch (error) {
        console.error("Error updating team member:", error);
        setIsSending(false);
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

  // Render the tab for manual entry
  const renderManualTab = () => (
    <form className="user-form">
      <div className="form-group">
        <label className="form-label">
          Name:
          <input
            type="text"
            name="member_name"
            className="form-input"
            placeholder="Enter team member's name"
            value={formData.member_name}
            onChange={handleChange}
          />
          {formErrors.member_name && (
            <div className="error-message">{formErrors.member_name}</div>
          )}
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">
          Email:
          <input
            type="email"
            name="member_email"
            className="form-input"
            placeholder="Enter team member's email"
            value={formData.member_email}
            onChange={handleChange}
          />
          {formErrors.member_email && (
            <div className="error-message">{formErrors.member_email}</div>
          )}
        </label>
        <div className="info-message">An invitation email will be sent to this address</div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Phone Number:
          <input
            type="tel"
            name="member_phone"
            className="form-input"
            placeholder="Enter team member's phone"
            value={formData.member_phone}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">
          Role:
          <input
            type="text"
            name="member_role"
            className="form-input"
            placeholder="Enter team member's role"
            value={formData.member_role}
            onChange={handleChange}
          />
          {formErrors.member_role && (
            <div className="error-message">{formErrors.member_role}</div>
          )}
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Profile Picture:</label>
        <div className="profile-pic-selection">
          <div
            className={`profile-option ${formData.member_profile_img === profile_pic_user1 ? "selected" : ""}`}
            onClick={() => handleProfilePicChange(profile_pic_user1)}
          >
            <img src={profile_pic_user1} alt="User 1" />
          </div>
          <div
            className={`profile-option ${formData.member_profile_img === profile_pic_user2 ? "selected" : ""}`}
            onClick={() => handleProfilePicChange(profile_pic_user2)}
          >
            <img src={profile_pic_user2} alt="User 2" />
          </div>
          <div
            className={`profile-option ${formData.member_profile_img === profile_pic_user3 ? "selected" : ""}`}
            onClick={() => handleProfilePicChange(profile_pic_user3)}
          >
            <img src={profile_pic_user3} alt="User 3" />
          </div>
          <div
            className={`profile-option ${formData.member_profile_img === profile_pic_user4 ? "selected" : ""}`}
            onClick={() => handleProfilePicChange(profile_pic_user4)}
          >
            <img src={profile_pic_user4} alt="User 4" />
          </div>
        </div>
      </div>
    </form>
  );

  // Render the tab for search
  const renderSearchTab = () => (
    <div className="search-tab">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, business..."
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        {isSearching && <div className="search-spinner"></div>}
      </div>

      {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
        <div className="search-hint">Enter at least 3 characters to search</div>
      )}

      <div className="search_result_wrapper">
        <div className="search-results">
          {Array.isArray(searchResults) && searchResults.length === 0 && searchQuery.trim().length >= 3 && !isSearching ? (
            <div className="no-results">No photographers found</div>
          ) : (
            Array.isArray(searchResults) && searchResults.map((result) => (
              <div
                key={result.user_email}
                className={`search-result-item ${selectedSearchResult?.user_email === result.user_email ? 'selected' : ''}`}
                onClick={() => handleSelectSearchResult(result)}
              >
                <div className="result-avatar">
                  <img src={`${Server_url}/owner/profile-image/${result.user_email}` || profile_pic_user1} alt={result.user_name} />
                </div>
                <div className="result-info">
                  <div className="result-name">{result.user_name}</div>
                  <div className="result-email">{result.user_email}</div>
                  {result.business_name && <div className="result-business">{result.business_name}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="selectedResult_actionButton_wrpper">
        {selectedSearchResult && (
          <div className="selected-result-details">
            <h4>Selected Photographer</h4>
            <div className="result-details-content">
              <div className="result-avatar large">
                <img src={`${Server_url}/owner/profile-image/${selectedSearchResult.user_email}` || profile_pic_user1} alt={selectedSearchResult.user_name} />
              </div>
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedSearchResult.user_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedSearchResult.user_email}</span>
                </div>
                {selectedSearchResult.business_name && (
                  <div className="detail-item">
                    <span className="detail-label">Business:</span>
                    <span className="detail-value">{selectedSearchResult.business_name}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">
                    Assign Role:
                    <input
                      type="text"
                      name="member_role"
                      className="form-input"
                      placeholder="Enter team member's role"
                      value={formData.member_role}
                      onChange={handleChange}
                    />
                    {formErrors.member_role && (
                      <div className="error-message">{formErrors.member_role}</div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="popup-actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          {action !== "View" && (
            <button
              className="btn btn-save"
              onClick={handleSubmit}
              disabled={action === "Add" & activeTab === "search" & !selectedSearchResult || isSending}
            >
              {isSending ? (
                <span className="loading-spinner-button"></span>
              ) : (
                action === "Add" && activeTab === "search" && selectedSearchResult ? "Send Invitation" : "Save"
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <div
      className="popup-overlay"
      id="TeamOverview_pop_menu"
      onClick={handleOverlayClick}
    >
      <div className="popup-content">
        <h3 className="popup-title">{action} Team Member</h3>
        {action !== "View" ? (
          <>
            {action === "Add" && (
              <div className="tab-container">
                <div
                  className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Add Manually
                </div>
                <div
                  className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  Search Photographers
                </div>
              </div>
            )}

            <div className="tab-content">
              {activeTab === 'manual' && renderManualTab()}
              {activeTab === 'search' && renderSearchTab()}
            </div>
          </>
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
                    <strong>Email:</strong>
                  </td>
                  <td>{formData.member_email || "Not provided"}</td>
                </tr>
                <tr>
                  <td className="label">
                    <strong>Phone:</strong>
                  </td>
                  <td>{formData.member_phone || "Not provided"}</td>
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

        {activeTab === "manual" && <div className="popup-actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          {action !== "View" && (
            <button
              className="btn btn-save"
              onClick={handleSubmit}
              disabled={(action === "Add" && activeTab === "search" && !selectedSearchResult) || isSending}
            >
              {isSending ? (
                <span className="loading-spinner-button"></span>
              ) : (
                action === "Add" ? "Send Invitation" : "Save"
              )}
            </button>
          )}
        </div>}
      </div>
    </div>
  );
};

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
                <label>Email</label>
                <p>{member.member_email || member.team_member_email || "Not provided"}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{member.member_phone || member.team_member_phone || "Not provided"}</p>
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
                <label>Status</label>
                <p>{member.member_status}</p>
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
  const isPending = member.member_status === "Pending";
  const isRejected = member.member_status === "Rejected";
  const emailDisplay = member.member_email || member.team_member_email || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownActive && !event.target.closest('.more-options-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownActive, setActiveDropdown]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  return (
    <div className={`member-card ${isPending ? 'pending-member' : ''} ${isRejected ? 'rejected-member' : ''}`}>
      <div className="status-indicator">
        {isPending ? (
          <span className="pending"></span>
        ) : isRejected ? (
          <span className="rejected"></span>
        ) : (
          <span className={member.member_status === "Active" ? "available" : "assigned"}></span>
        )}
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
              {/* Conditionally render Edit button only if status is not Pending or Rejected */}
              {!isPending && !isRejected && (
                <>
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
                </>
              )}
              <button
                className="dropdown-item delete-btn"
                onClick={() => {
                  setShowConfirmation(true);
                }}
              >
                <img src={Remove_icon} alt="Remove" />
                <span style={{ textWrap: "nowrap" }}>
                  {isPending
                    ? "Cancel Invitation"
                    : isRejected
                      ? "Remove Member"
                      : "Delete"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-image">
          <img
            src={emailDisplay ? `${Server_url}/owner/profile-image/${emailDisplay}` : member.member_profile_img}
            alt={member.member_name}
            onError={(e) => {
              e.target.src = member.member_profile_img || profile_pic_user1;
            }}
          />
        </div>
        <h3>{member.member_name}</h3>
        <p className="email" style={{ maxWidth: "100%", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{emailDisplay || "No email provided"}</p>
        {isPending && <div className="pending-badge">Invitation Pending</div>}
        {isRejected && <div className="rejected-badge">Invitation Rejected</div>}
      </div>
      <div className="divider"></div>
      <button
        className={`details-btn ${isPending
          ? 'pending'
          : isRejected
            ? 'rejected'
            : member.member_status === "Available"
              ? "available"
              : "assigned"
          }`}
        onClick={() => {
          setShowDetailPopup(true);
        }}
        disabled={isPending || isRejected}
      >
        {isPending
          ? "Awaiting Response"
          : isRejected
            ? "Rejected"
            : "Details"}
      </button>

      {showDetailPopup && (
        <DetailPopup
          member={member}
          onClose={() => setShowDetailPopup(false)}
        />
      )}
      {showConfirmation && (
        <ConfirmMessage
          message_title="Remove Member"
          message="Are you sure you want to remove this member?"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            onRemove(member.member_id, member.owner_email);
            setShowConfirmation(false);
          }}
        />
      )}
    </div>
  );
};

const TeamOverview = () => {
  const user = useSelector((state) => state.user);
  const [teamData, setTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check and remove rejected members older than 5 days
  const cleanupRejectedMembers = (members) => {
    const currentTime = new Date().getTime();
    const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

    return members.filter(member => {
      // Skip if not rejected
      if (member.member_status !== "Rejected") return true;

      // Check if rejection_date exists and is older than 5 days
      if (member.rejection_date) {
        const rejectionDate = new Date(member.rejection_date).getTime();
        return (currentTime - rejectionDate) < fiveDaysInMilliseconds;
      }

      return true;
    });
  };

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);

      // Fetch all members
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

      // Normalize fields
      const processedMembersData = membersData.map(member => ({
        ...member,
        member_email: member.team_member_email || member.member_email || "",
        member_phone: member.team_member_phone || member.member_phone || "",
      }));

      // Fetch assigned members status
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

      // Build a map of assigned member IDs and event details
      const assignedMembersMap = new Map();

      if (Array.isArray(statusData)) {
        statusData.forEach(item => {
          if (Array.isArray(item.assigned_team_member)) {
            item.assigned_team_member.forEach(memberId => {
              if (memberId !== null && memberId !== undefined) {
                assignedMembersMap.set(memberId, {
                  event_request_type: item.event_request_type || "Unknown",
                  event_detail: item.event_detail || "Unknown",
                });
              }
            });
          }
        });
      }

      // Update member statuses based on assignment (by member_id)
      const updatedTeamData = processedMembersData.map(member => {
        if (member.member_status === "Pending" || member.member_status === "Rejected") {
          return member;
        }

        const assignment = assignedMembersMap.get(member.member_id); // ✅ Use member_id now

        return {
          ...member,
          member_status: assignment ? "Available" : "Active",
          member_event_assignment: assignment
            ? `${assignment.event_request_type} - ${assignment.event_detail}`
            : "Not Assigned",
        };
      });

      // Cleanup rejected members older than 5 days (your custom logic)
      const filteredTeamData = cleanupRejectedMembers(updatedTeamData);

      setTeamData(filteredTeamData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamData([]);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    socket.on(`user_confirmation_updated_team_member`, () => {
      const fetchTeamMembers = async () => {
        try {
          setIsLoading(true);

          const membersResponse = await fetch(`${Server_url}/team_members/get_members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: user.user_email }),
          });

          const membersData = await membersResponse.json();

          // Map the data to include member_email from team_member_email if available
          const processedMembersData = membersData.map(member => ({
            ...member,
            member_email: member.team_member_email || member.member_email || "",
            member_phone: member.team_member_phone || member.member_phone || "",
          }));

          // Fetch assigned members status
          const statusResponse = await fetch(`${Server_url}/team_members/get_all_members_status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: user.user_email }),
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
          }

          // Update team members' status based on assignment
          const updatedTeamData = processedMembersData.map(member => {
            if (member.member_status === "Pending" || member.member_status === "Rejected") {
              return member;
            }

            const assignment = assignedMembersMap.get(member.member_name);

            return {
              ...member,
              member_status: assignment ? "Available" : "Active",
              member_event_assignment: assignment
                ? `${assignment.event_request_type} - ${assignment.event_detail}`
                : "Not Assigned",
            };
          });

          // Filter out rejected members older than 5 days
          const filteredTeamData = cleanupRejectedMembers(updatedTeamData);

          setTeamData(filteredTeamData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching team members:", error);
          setTeamData([]);
          setIsLoading(false);
        }
      };

      fetchTeamMembers();
    });

    // Cleanup on unmount (optional but good practice)
    return () => {
      socket.off(`user_confirmation_updated_team_member`);
    };
  }, [user.user_email]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);

        const membersResponse = await fetch(`${Server_url}/team_members/get_members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: user.user_email }),
        });

        const membersData = await membersResponse.json();

        // Map the data to include member_email from team_member_email if available
        const processedMembersData = membersData.map(member => ({
          ...member,
          member_email: member.team_member_email || member.member_email || "",
          member_phone: member.team_member_phone || member.member_phone || "",
        }));

        // Fetch assigned members status
        const statusResponse = await fetch(`${Server_url}/team_members/get_all_members_status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: user.user_email }),
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
        }

        // Update team members' status based on assignment
        const updatedTeamData = processedMembersData.map(member => {
          if (member.member_status === "Pending" || member.member_status === "Rejected") {
            return member;
          }

          const assignment = assignedMembersMap.get(member.member_name);

          return {
            ...member,
            member_status: assignment ? "Available" : "Active",
            member_event_assignment: assignment
              ? `${assignment.event_request_type} - ${assignment.event_detail}`
              : "Not Assigned",
          };
        });

        // Filter out rejected members older than 5 days
        const filteredTeamData = cleanupRejectedMembers(updatedTeamData);

        setTeamData(filteredTeamData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setTeamData([]);
        setIsLoading(false);
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

  const getActiveMembersCount = () => {
    return teamData.filter(member => member.member_status === "Active").length;
  };

  const getPendingMembersCount = () => {
    return teamData.filter(member => member.member_status === "Pending").length;
  };

  const getRejectedMembersCount = () => {
    return teamData.filter(member => member.member_status === "Rejected").length;
  };

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
            <div className="count">{isLoading ? "..." : teamData.length}</div>
          </div>
          <img src={ilasstion_2} alt="ilasstion_2" />

        </div>
        <div className="stat-card active-members">
          <div className="data-container">
            <h2>Active Member</h2>
            <div className="count">{isLoading ? "..." : getActiveMembersCount()}</div>
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
              {getPendingMembersCount() > 0 && (
                <span className="legend-item">
                  <span className="dot pending"></span> Pending
                </span>
              )}
              {getRejectedMembersCount() > 0 && (
                <span className="legend-item">
                  <span className="dot rejected"></span> Rejected
                </span>
              )}
            </div>
          </div>
          <button className={`add-member-btn_top ${teamData.length === 0 ? 'assigned' : 'available'}`} onClick={handleAddUser}>
            <span>Add Member</span>
            <span className="plus-icon">+</span>
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading team members...</p>
          </div>
        ) : teamData.length === 0 ? (
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
