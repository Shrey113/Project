import React, { useState } from "react";
import "./RequestDetailPopup.css";
import { Server_url, showRejectToast, showWarningToast, showAcceptToast } from "../../../../redux/AllData";

const RequestDetailPopup = ({
  requestData,
  onClose,
  popupType,
  setPopupType,
  set_receiver_package_data,
  set_receiver_equipment_data,
}) => {
  const [reason, setReason] = useState("");

  useState(() => {
    console.log("requestData", requestData)
  }, [requestData])

  // Function to handle rejection and update database
  const handleReject = async () => {
    if (reason.trim() === "") {
      showRejectToast({ message: "Please provide a reason for rejection." });
      return;
    }

    try {
      const response = await fetch(`${Server_url}/request-update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestData.id,
          event_status: "Rejected",
          reason,
          sender_email: requestData.sender_email,
        }),
      });

      if (!response.ok) {
        console.log("response message ", response.message);
        throw new Error("Failed to update request status.");
      }

      const data = await response.json();
      if (data.status) {
        showAcceptToast({ message: "Request rejected successfully" });
        setPopupType(null);
        onClose();

        if (requestData.event_name === "equipment") {
          set_receiver_equipment_data((prevData) =>
            prevData.map((item) =>
              item.id === data.id
                ? { ...item, event_status: "Rejected", reason: data.reason }
                : item
            )
          );
        } else if (requestData.event_name === "package") {
          set_receiver_package_data((prevData) =>
            prevData.map((item) =>
              item.id === data.id
                ? { ...item, event_status: "Rejected", reason: data.reason }
                : item
            )
          );
        } else {
          showWarningToast({ message: `not a good event_name ${requestData.event_name}` });
        }
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showRejectToast({ message: "Something went wrong. Please try again." });
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Helper function to render Package Details
  const renderPackageDetails = () => (
    <table className="details-table">
      <tbody>
        {/* <tr><td><strong>ID:</strong></td><td>{requestData.id}</td></tr> */}
        <tr><td><strong>Package Name:</strong></td><td>{requestData.package_name}</td></tr>
        <tr><td><strong>Service:</strong></td><td>{requestData.service}</td></tr>
        {requestData.event_status !== "Rejected" && requestData.requirements && requestData.requirements.trim() !== "" && (
          <tr><td><strong>Requirement:</strong></td><td>{requestData.requirements}</td></tr>
        )}
        <tr><td><strong>Total:</strong></td><td>{requestData.total_amount || "N/A"}</td></tr>
        <tr><td><strong>Location:</strong></td><td>{requestData.location}</td></tr>
        <tr><td><strong>Status:</strong></td><td>{requestData.event_status}</td></tr>

        {requestData.event_status !== "Rejected" && (
          <tr>
            <td><strong>Assigned Team Member:</strong></td>
            <td>
              {Array.isArray(requestData.assigned_team_member) ? (
                requestData.assigned_team_member.map((team_member, index) => (
                  <span key={index}>{team_member}{index !== requestData.assigned_team_member.length - 1 ? ', ' : ''}</span>
                ))
              ) : (
                "Not Assigned"
              )}
            </td>
          </tr>
        )}
        <tr><td><strong>Start Date:</strong></td><td>{formatDate(requestData.start_date)}</td></tr>
        <tr><td><strong>End Date:</strong></td><td>{formatDate(requestData.end_date)}</td></tr>
        {requestData.reason && <tr><td><strong>Rejection Reason:</strong></td><td>{requestData.reason}</td></tr>}
      </tbody>
    </table>
  );

  const renderEquipmentDetails = () => (
    <table className="details-table">
      <tbody>
        {/* <tr><td><strong>ID:</strong></td><td>{requestData.id}</td></tr> */}
        <tr><td><strong>Equipment Name:</strong></td><td>{requestData.equipment_name}</td></tr>
        <tr><td><strong>Company:</strong></td><td>{requestData.equipment_company}</td></tr>
        <tr><td><strong>Type:</strong></td><td>{requestData.equipment_type}</td></tr>
        <tr><td><strong>Days Required:</strong></td><td>{requestData.days_required}</td></tr>
        {requestData.event_status !== "Rejected" && requestData.requirements && requestData.requirements.trim() !== "" && (
          <tr><td><strong>Requirement:</strong></td><td>{requestData.requirements}</td></tr>
        )}
        <tr><td><strong>Price:</strong></td><td>{requestData.equipment_price_per_day || "N/A"}</td></tr>
        <tr><td><strong>Location:</strong></td><td>{requestData.location}</td></tr>
        <tr><td><strong>Status:</strong></td><td>{requestData.event_status}</td></tr>
        <tr><td><strong>Start Date:</strong></td><td>{formatDate(requestData.start_date)}</td></tr>
        <tr><td><strong>End Date:</strong></td><td>{formatDate(requestData.end_date)}</td></tr>
        {requestData.reason && <tr><td><strong>Rejection Reason:</strong></td><td>{requestData.reason}</td></tr>}
      </tbody>
    </table>
  );

  const renderServiceDetails = () => (
    <table className="details-table">
      <tbody>
        <tr><td><strong>Service Name:</strong></td><td>{requestData.service_name}</td></tr>
        {requestData.event_status !== "Rejected" && requestData.requirements && requestData.requirements.trim() !== "" && (
          <tr><td><strong>Requirement:</strong></td><td>{requestData.requirements}</td></tr>
        )}
        {requestData.assigned_team_member && (
          <tr>
            <td><strong>Assigned Team Member:</strong></td>
            <td>
              {Array.isArray(requestData.assigned_team_member) ? (
                requestData.assigned_team_member.map((team_member, index) => (
                  <span key={index}>{team_member}{index !== requestData.assigned_team_member.length - 1 ? ', ' : ''}</span>
                ))
              ) : (
                "Not Assigned"
              )}
            </td>
          </tr>
        )}
        <tr><td><strong>Price:</strong></td><td>{requestData.service_price_per_day || "N/A"}</td></tr>
        <tr><td><strong>Location:</strong></td><td>{requestData.location}</td></tr>
        <tr><td><strong>Status:</strong></td><td>{requestData.event_status}</td></tr>
        <tr><td><strong>Days Required:</strong></td><td>{requestData.days_required}</td></tr>
        <tr><td><strong>Start Date:</strong></td><td>{formatDate(requestData.start_date)}</td></tr>
        <tr><td><strong>End Date:</strong></td><td>{formatDate(requestData.end_date)}</td></tr>
        {requestData.reason && <tr><td><strong>Rejection Reason:</strong></td><td>{requestData.reason}</td></tr>}
      </tbody>
    </table>
  )

  const handleClose = () => {
    if (popupType === "reject" && reason) {
      showWarningToast({ message: "It will not be rejected." });
    }
    onClose();
  };


  return (
    <div className="popup-overlay" onClick={handleClose}>
      {/* Info Popup */}
      {popupType === "info" && (
        <div className="popup-container" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h2>Request Details</h2>
            <button onClick={onClose} className="close-btn">
              X
            </button>
          </div>
          <div className="popup-body">
            {requestData.package_name && renderPackageDetails()}
            {requestData.equipment_name && renderEquipmentDetails()}
            {requestData.service_name && renderServiceDetails()}
            {requestData.event_status !== "Rejected" && requestData.event_status !== "Accepted" && (
              <button
                onClick={() => setPopupType("reject")}
                className="reject-btn"
                style={{ marginTop: "20px" }}
              >
                Reject Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reject Popup */}
      {popupType === "reject" && (
        <div className="popup-container" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h2>Reject Request</h2>
            <button onClick={onClose} className="close-btn">
              X
            </button>
          </div>
          <div className="popup-body">
            {/* <h3>ID: {requestData.id}</h3> */}
            <p>
              <strong>
                {requestData.package_name ? "Package Name" : "Equipment Name"}:
              </strong>{" "}
              {requestData.package_name || requestData.equipment_name}
            </p>
            <p>
              <strong>Reason for Rejection:</strong>
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason here"
            />
            <div className="popup-actions">
              <button onClick={handleReject} className="reject-btn">
                Reject
              </button>
              <button onClick={onClose} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetailPopup;
