import React, { useState } from "react";
import "./RequestDetailPopup.css";
import { Server_url } from "../../../../redux/AllData";

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
      alert("Please provide a reason for rejection.");
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
        }),
      });

      if (!response.ok) {
        console.log("response message ", response.message);
        throw new Error("Failed to update request status.");
      }

      const data = await response.json();
      if (data.status) {
        alert("Request rejected successfully");
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
          alert(`not a good event_name ${requestData.event_name}`);
        }
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // Helper function to render Package Details
  const renderPackageDetails = () => (
    <>
      <h3>ID: {requestData.id}</h3>
      <p>
        <strong>Package Name:</strong> {requestData.package_name}
      </p>
      <p>
        <strong>Service:</strong> {requestData.service}
      </p>
      <p>
        <strong>Description:</strong> {requestData.description}
      </p>
      <p>
        <strong>Price:</strong> {requestData.price || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {requestData.location}
      </p>
      <p>
        <strong>Status:</strong> {requestData.event_status}
      </p>

      {requestData.reason && (
        <p>
          <strong>Rejection Reason:</strong> {requestData.reason}
        </p>
      )}
    </>
  );

  const renderEquipmentDetails = () => (
    <>
      <h3>ID: {requestData.id}</h3>
      <p>
        <strong>Equipment Name:</strong> {requestData.equipment_name}
      </p>
      <p>
        <strong>Company:</strong> {requestData.equipment_company}
      </p>
      <p>
        <strong>Type:</strong> {requestData.equipment_type}
      </p>
      <p>
        <strong>Days Required:</strong> {requestData.days_required}
      </p>
      <p>
        <strong>Description:</strong> {requestData.equipment_description}
      </p>
      <p>
        <strong>Price:</strong> {requestData.equipment_price_per_day || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {requestData.location}
      </p>
      <p>
        <strong>Status:</strong> {requestData.event_status}
      </p>
      <p>
        <strong>Rejection Reason:</strong> {requestData.reason}
      </p>
    </>
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

            {requestData.event_status !== "Rejected" && (
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
