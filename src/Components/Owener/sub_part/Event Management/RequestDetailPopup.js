import React, { useState } from "react";
import "./RequestDetailPopup.css";
// import { Server_url } from "../../../../redux/AllData";
import {
  Server_url,
  showRejectToast,
  showWarningToast,
  showAcceptToast,
} from "../../../../redux/AllData";

import { BiSolidUserCircle } from "react-icons/bi";

const RequestDetailPopup = ({
  requestData,
  onClose,
  popupType,
  setPopupType,
  set_receiver_package_data,
  set_receiver_equipment_data,
}) => {
  const [reason, setReason] = useState("");

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
          showWarningToast({
            message: `not a good event_name ${requestData.event_name}`,
          });
        }
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showRejectToast({ message: "Something went wrong. Please try again." });
    }
  };

  // Helper function to render Package Details
  const renderPackageDetails = () => (
    <table className="details-table">
      <tbody>
        <tr>
          <td>
            <strong>ID:</strong>
          </td>
          <td>{requestData.id}</td>
        </tr>
        <tr>
          <td>
            <strong>Package Name:</strong>
          </td>
          <td>{requestData.package_name}</td>
        </tr>
        <tr>
          <td>
            <strong>Service:</strong>
          </td>
          <td>{requestData.service}</td>
        </tr>
        <tr>
          <td>
            <strong>Description:</strong>
          </td>
          <td>{requestData.description}</td>
        </tr>
        <tr>
          <td>
            <strong>Price:</strong>
          </td>
          <td>{requestData.price || "N/A"}</td>
        </tr>
        <tr>
          <td>
            <strong>Location:</strong>
          </td>
          <td>{requestData.location}</td>
        </tr>
        <tr>
          <td>
            <strong>Status:</strong>
          </td>
          <td>{requestData.event_status}</td>
        </tr>

        {requestData.event_status === "Accepted" && (
          <tr>
            <td>
              <strong>Assigned Members</strong>
            </td>
            <td>
              {requestData?.assigned_team_member.map((member, index) => (
                <li
                  style={{
                    listStyle: "none",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                  key={index}
                >
                  <BiSolidUserCircle
                    style={{
                      height: "18px",
                      width: "18px",
                      marginRight: "5px",
                    }}
                  />
                  {member}
                </li>
              ))}
            </td>
          </tr>
        )}

        {requestData.reason && (
          <tr>
            <td>
              <strong>Rejection Reason:</strong>
            </td>
            <td>{requestData.reason}</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderEquipmentDetails = () => (
    <table className="details-table">
      <tbody>
        <tr>
          <td>
            <strong>ID:</strong>
          </td>
          <td>{requestData.id}</td>
        </tr>
        <tr>
          <td>
            <strong>Equipment Name:</strong>
          </td>
          <td>{requestData.equipment_name}</td>
        </tr>
        <tr>
          <td>
            <strong>Company:</strong>
          </td>
          <td>{requestData.equipment_company}</td>
        </tr>
        <tr>
          <td>
            <strong>Type:</strong>
          </td>
          <td>{requestData.equipment_type}</td>
        </tr>
        <tr>
          <td>
            <strong>Days Required:</strong>
          </td>
          <td>{requestData.days_required}</td>
        </tr>
        <tr>
          <td>
            <strong>Description:</strong>
          </td>
          <td>{requestData.equipment_description}</td>
        </tr>
        <tr>
          <td>
            <strong>Price:</strong>
          </td>
          <td>{requestData.equipment_price_per_day || "N/A"}</td>
        </tr>
        <tr>
          <td>
            <strong>Location:</strong>
          </td>
          <td>{requestData.location}</td>
        </tr>
        <tr>
          <td>
            <strong>Status:</strong>
          </td>
          <td>{requestData.event_status}</td>
        </tr>
        {requestData.reason && (
          <tr>
            <td>
              <strong>Rejection Reason:</strong>
            </td>
            <td>{requestData.reason}</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="popup-overlay">
      {/* Info Popup */}
      {popupType === "info" && (
        <div className="popup-container">
          <div className="popup-header">
            <h2>Request Details</h2>
            <button onClick={onClose} className="close-btn">
              X
            </button>
          </div>
          <div className="popup-body">
            {requestData.package_name
              ? renderPackageDetails()
              : renderEquipmentDetails()}
            {requestData.event_status !== "Rejected" &&
              requestData.event_status !== "Accepted" && (
                <button
                  onClick={() => setPopupType("reject")}
                  className="reject-btn"
                >
                  Reject Request
                </button>
              )}
          </div>
        </div>
      )}

      {/* Reject Popup */}
      {popupType === "reject" && (
        <div className="popup-container">
          <div className="popup-header">
            <h2>Reject Request</h2>
            <button onClick={onClose} className="close-btn">
              X
            </button>
          </div>
          <div className="popup-body">
            <h3>ID: {requestData.id}</h3>
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
