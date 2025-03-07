import React, { useState, useEffect, useRef } from "react";
import "./EventManagement.css";
import "./EventManagement_Responsive.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
// import accept from "./sub_img/correct.png";
// import reject from "./sub_img/remove.png";
// import info from "./sub_img/letter-i.png";
import { Server_url } from "../../../../redux/AllData";
import { useSelector } from "react-redux";
import RequestDetailPopup from "./RequestDetailPopup";
import AddDetailsPop from "./AddDetailsPop";
import socket from "../../../../redux/socket";
import { IoCloseOutline } from "react-icons/io5";
import { IoInformation } from "react-icons/io5";
// import { HiOutlineChevronUpDown } from "react-icons/hi2";
// import { add } from "date-fns";

function EventManagement({ category }) {
  const user = useSelector((state) => state.user);
  const [events, setEvents] = useState([]);

  // chage a type
  const [packageFilter] = useState("all");
  const [equipmentFilter] = useState("all");
  const [serviceFilter] = useState("all");
  // const [selectedCategory, setSelectedCategory] = useState("packages");

  const [sent_request, set_sent_request] = useState(false);
  // for popups
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [popupType, setPopupType] = useState(null);

  // All data use state
  const [receiver_equipment_data, set_receiver_equipment_data] = useState([]);
  const [receiver_service_data, set_receiver_service_data] = useState([]);
  const [receiver_package_data, set_receiver_package_data] = useState([]);
  const [sent_package_data, set_sent_package_data] = useState([]);
  const [sent_equipment_data, set_sent_equipment_data] = useState([]);
  const [sent_service_data, set_sent_service_data] = useState([]);

  const [selected_sent_item, set_selected_sent_item] = useState(null);

  const [show_calender_popup, set_show_calender_popup] = useState(false);

  const [count_for_package, set_count_for_package] = useState(0);
  const [count_for_equipment, set_count_for_equipment] = useState(0);
  const [count_for_service, set_count_for_service] = useState(0);

  const location = useLocation();
  // for calender
  const [newEvent, setNewEvent] = useState({
    id: events.length,
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    backgroundColor: "#6366F1",
    titleError: "",
    event_request_type: "",
    sender_email: "",
    event_location: "",
  });

  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const menuRef = useRef(null);

  const TRow = ({ label, value }) => {
    return (
      <tr>
        <td>
          <strong>{label}</strong>
        </td>
        <td>{value}</td>
      </tr>
    );
  };

  function set_data(item) {
    if (item.event_request_type === "package") {
      setNewEvent({
        id: item.id,
        title: `package - ${item.package_name}`,
        start: item.start_date,
        end: item.end_date,
        description: item.requirements,
        event_request_type: item.event_request_type,
        sender_email: item.sender_email,
        event_location: item.location,
      });
    } else if (item.event_request_type === "equipment") {
      setNewEvent({
        id: item.id,
        title: `equipment - ${item.equipment_name}`,
        start: item.start_date,
        end: item.end_date,
        description: item.requirements,
        event_request_type: item.event_request_type,
        sender_email: item.sender_email,
        event_location: item.location,
      });
    } else if (item.event_request_type === "service") {
      setNewEvent({
        id: item.id,
        title: `service - ${item.service_name}`,
        start: item.start_date,
        end: item.end_date,
        description: item.requirements,
        event_request_type: item.event_request_type,
        sender_email: item.sender_email,
        event_location: item.location,
      });
    }

    set_show_calender_popup(true);
  }
  const handleInfoClick = (request) => {
    setSelectedRequest(request);
    setPopupType("info");
  };
  const handleRejectClick = (item) => {
    setSelectedRequest(item);
    setPopupType("reject");
  };

  const handleClosePopup = () => {
    setPopupType(null);
    setSelectedRequest(null);
  };

  useEffect(() => {
    const get_owner_equipment_details = async () => {
      try {
        const response = await axios.get(
          `${Server_url}/owner/get-equipment-details-by/${user.user_email}`
        );
        if (response.data) {
          set_receiver_package_data(response.data.package);
          set_receiver_equipment_data(response.data.equipment);
          set_receiver_service_data(response.data.service);
        } else {
          console.log("No data received or an error occurred");
        }
      } catch (error) {
        console.error("Error fetching equipment details:", error);
      }
    };

    get_owner_equipment_details();
  }, [user.user_email]);

  useEffect(() => {
    if (socket) {
      // Add connection/disconnection handlers
      const onConnect = () => {
        console.log("Socket connected");
      };

      const onDisconnect = () => {
        console.log("Socket disconnected");
      };

      // Add notification handler
      const onNotification = async (data) => {
        // alert("data");
        console.log("Received notification:", data);
        try {
          const response = await axios.get(
            `${Server_url}/get-sent-all-details-by/${user.user_email}`
          );
          if (!response.error) {
            set_sent_package_data(response.data.package);
            set_sent_equipment_data(response.data.equipment);
            set_sent_service_data(response.data.service);
          } else {
            console.log("No data received or an error occurred");
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
        }
      };

      // Set up event listeners
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on(
        `new_event_request_notification_${user.user_email}`,
        onNotification
      );

      // Cleanup function
      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off(
          `new_event_request_notification_${user.user_email}`,
          onNotification
        );
      };
    }
  }, [user.user_email]);

  useEffect(() => {
    const get_sent_all_details = async () => {
      try {
        const response = await axios.get(
          `${Server_url}/get-sent-all-details-by/${user.user_email}`
        );
        if (!response.error) {
          set_sent_package_data(response.data.package);
          set_sent_equipment_data(response.data.equipment);
          set_sent_service_data(response.data.service);
        } else {
          console.log("No data received or an error occurred");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    get_sent_all_details();
  }, [user.user_email]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // const add_filter = (name) => {
  //   return (
  //     <span
  //       style={{
  //         display: "flex",
  //         gap: "2px",
  //       }}
  //     >
  //       <div>{name}</div>{" "}
  //       <div
  //         style={{
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <HiOutlineChevronUpDown />
  //       </div>
  //     </span>
  //   );
  // };

  useEffect(() => {
    const equipment_count = receiver_equipment_data?.length;
    const package_count = receiver_package_data?.length;
    const service_count = receiver_service_data?.length;
    set_count_for_package(package_count);
    set_count_for_equipment(equipment_count);
    set_count_for_service(service_count);
  }, [receiver_equipment_data, receiver_package_data, receiver_service_data])

  const ActionMenu = ({ onApprove, onReject, onInfo }) => {
    return (
      <div className="action-menu">
        <button onClick={onApprove} className="action-menu-btn approve">
          <span className="icon">✓</span>
          <span className="text">Approve</span>
        </button>
        <button onClick={onReject} className="action-menu-btn reject">
          <span className="icon">✕</span>
          <span className="text">Reject</span>
        </button>
        <button onClick={onInfo} className="action-menu-btn info">
          <span className="icon">ℹ</span>
          <span className="text">Info</span>
        </button>
      </div>
    );
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id="owner-main-container-EventManagement">

      {/* received request count  */}
      <div className="requests_count">
        <div className="received_request_total_count">
          <div className="heading_for_total_requests">Total Request</div>
          <div className="numbers_of_total_request">{count_for_package + count_for_equipment + count_for_service}</div>
        </div>
        <div className="received_request_count">
          <div className="total_packages">{location.pathname === "/Owner/Event/packages" ? "Package Requests" : location.pathname === "/Owner/Event/equipment" ? "Equipment Request" : "Service Request"}</div>
          <div className="numbers_of_package_request">{location.pathname === "/Owner/Event/packages" ? count_for_package : location.pathname === "/Owner/Event/equipment" ? count_for_equipment : location.pathname === "/Owner/Event/services" ? count_for_service : null}</div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="heading_container_event_management">
        <div className="event_mangement_heading">{category}</div>
        <div className="toggle_button_con_event_management">
          <div
            className="active_button"
            style={{
              left: sent_request ? "110px" : "0px",
            }}
          ></div>

          <button onClick={() => set_sent_request(false)}>
            <span>Received </span>
          </button>

          <button onClick={() => set_sent_request(true)}>
            <span>Sent</span>
          </button>
        </div>
      </div>

      {/* sent requests  */}
      {sent_request && (
        <div className="sent_request">
          {selected_sent_item && (
            <div className="details-modal-overlay">
              <div className="details-modal">
                <h3 className="modal-header">Request Details</h3>

                <div className="modal-content-container">
                  {/* Left Side: Main Request Details */}
                  <div className="modal-left">
                    <table className="details-table">
                      <tbody>
                        <TRow label="ID" value={selected_sent_item.id} />
                        <TRow
                          label="Sender Email"
                          value={selected_sent_item.sender_email}
                        />

                        {selected_sent_item.event_request_type === "package" ? (
                          <>
                            <TRow
                              label="Package Name"
                              value={selected_sent_item.package_name}
                            />
                            <TRow
                              label="Service"
                              value={selected_sent_item.service}
                            />
                            <TRow
                              label="Description"
                              value={selected_sent_item.description}
                            />
                            <TRow
                              label="Price"
                              value={`₹${selected_sent_item.price}`}
                            />
                          </>
                        ) : selected_sent_item.event_request_type ===
                          "equipment" ? (
                          <>
                            <TRow
                              label="Equipment Name"
                              value={selected_sent_item.equipment_name}
                            />
                            <TRow
                              label="Equipment Company"
                              value={selected_sent_item.equipment_company}
                            />
                            <TRow
                              label="Equipment Type"
                              value={selected_sent_item.equipment_type}
                            />
                            <TRow
                              label="Description"
                              value={selected_sent_item.equipment_description}
                            />
                            <TRow
                              label="Price"
                              value={`₹${selected_sent_item.equipment_price_per_day}`}
                            />
                            <TRow
                              label="Days Required"
                              value={selected_sent_item.days_required}
                            />
                            <TRow
                              label="Total Amount"
                              value={`₹${selected_sent_item.total_amount}`}
                            />
                          </>
                        ) : selected_sent_item.event_request_type === "service" ? (
                          <>
                            <TRow
                              label="Service Name"
                              value={selected_sent_item.service_name}
                            />
                            <TRow
                              label="Price"
                              value={`₹${selected_sent_item.total_amount}`}
                            />
                          </>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Side: Status Display */}
                  <div className="modal-right">
                    {selected_sent_item && (
                      <div
                        className={`status-box ${selected_sent_item.event_status?.toLowerCase()}`}
                      >
                        <table className="details-table">
                          <tbody>
                            <TRow
                              label="Start Date"
                              value={formatDate(selected_sent_item.start_date)}
                            />
                            <TRow
                              label="End Date"
                              value={formatDate(selected_sent_item.end_date)}
                            />
                            <TRow
                              label="Location"
                              value={selected_sent_item.location}
                            />
                            <TRow
                              label="Status"
                              value={
                                <span
                                  className={`status ${selected_sent_item.event_status?.toLowerCase()}`}
                                >
                                  {selected_sent_item.event_status}
                                </span>
                              }
                            />

                            {selected_sent_item.event_status === "Accepted" &&
                              selected_sent_item.assigned_team_member?.length >
                              0 && (
                                <TRow
                                  label="Assigned Team Members"
                                  value={
                                    <ul>
                                      {selected_sent_item.assigned_team_member.map(
                                        (member, index) => (
                                          <div key={index}>✅ {member}</div>
                                        )
                                      )}
                                    </ul>
                                  }
                                />
                              )}

                            {selected_sent_item.event_status === "Rejected" &&
                              selected_sent_item.reason && (
                                <TRow
                                  label="Reason for Rejection"
                                  value={selected_sent_item.reason}
                                />
                              )}

                            {selected_sent_item.event_status === "Pending" && (
                              <tr>
                                <td colSpan="2">
                                  Your request is in pending mode. Please wait
                                  for approval.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="close-button"
                  onClick={() => set_selected_sent_item(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div id="EventManagement">
            {["Packages"].includes(category) && (
              <div className="section-container">
                <div className="table-container">
                  {sent_package_data.length > 0 ? (
                    <table className="sent_package_table">
                      <thead>
                        <tr>
                          <th style={{ width: "10px" }}>NO.</th>
                          <th>Package Name</th>
                          <th>Service</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Receiver</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sent_package_data.map((item, index) => (
                          <tr key={index} onClick={() => set_selected_sent_item(item)}>
                            <td>{index + 1}</td>
                            <td className="package_name">{item.package_name}</td>
                            <td>{item.service}</td>
                            <td className="description">{item.description}</td>
                            <td>₹{item.price}</td>
                            <td>{item.receiver_email}</td>
                            <td className={`status ${item.event_status?.toLowerCase()}`}>
                              <span>{item.event_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Sent Package Requests</p>
                  )}
                </div>
              </div>
            )}


            {["Equipment"].includes(category) && (
              <div className="section-container">
                <div className="table-container">
                  {sent_equipment_data.length > 0 ? (
                    <table className="sent_equipment_table">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Equipment Name</th>
                          <th>Company</th>
                          <th>Type</th>
                          <th>Days</th>
                          <th>Receiver</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sent_equipment_data.map((item, index) => (
                          <tr key={index} onClick={() => set_selected_sent_item(item)}>
                            <td>{index + 1}</td>
                            <td>{item.equipment_name}</td>
                            <td>{item.equipment_company}</td>
                            <td>{item.equipment_type}</td>
                            <td>{item.days_required}</td>
                            <td>{item.receiver_email}</td>
                            <td className={`status ${item.event_status?.toLowerCase()}`}>
                              <span>{item.event_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Sent Equipment Requests</p>
                  )}
                </div>
              </div>
            )}

            {["Service"].includes(category) && (
              <div className="section-container">
                <div className="table-container">
                  {sent_service_data.length > 0 ? (
                    <table className="sent_service_table">
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>Service Name</th>
                          <th>Price</th>
                          <th>Days</th>
                          <th>Receiver</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sent_service_data.map((item, index) => (
                          <tr key={index} onClick={() => set_selected_sent_item(item)}>
                            <td>{index + 1}</td>
                            <td>{item.service_name}</td>
                            <td>₹{item.total_amount}</td>
                            <td>{item.days_required}</td>
                            <td>{item.receiver_email}</td>
                            <td className={`status ${item.event_status?.toLowerCase()}`}>
                              <span>{item.event_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Sent Service Requests</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* received request section  */}
      {!sent_request && (
        <div className="received_request">
          <div id="EventManagement">
            {category === "Packages" && (
              <div className="section-container">
                <div className="table-container">
                  {receiver_package_data?.filter(
                    (item) => packageFilter === "all" || item.event_status === packageFilter
                  ).length > 0 ? (
                    <table className="received_package_table">
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>Sender Email</th>
                          <th>Package Name</th>
                          <th>Price</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiver_package_data
                          ?.filter(
                            (item) => packageFilter === "all" || item.event_status === packageFilter
                          )
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.sender_email}</td>
                              <td>{item.package_name}</td>
                              <td>₹{item.price}</td>
                              <td>{item.location}</td>
                              <td className={`status ${item.event_status?.toLowerCase()}`}>
                                <span>{item.event_status}</span>
                              </td>
                              <td className="action-buttons">
                                {window.innerWidth <= 660 ? (
                                  <div style={{ position: "relative" }}>
                                    <button
                                      className="mobile-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(isMenuOpen === item.id ? null : item.id);
                                      }}
                                      style={{
                                        fontSize: "20px",
                                        padding: "4px 12px",
                                        borderRadius: "4px",
                                        background: "transparent",
                                        border: "1px solid #ddd",
                                      }}
                                    >
                                      ⋮
                                    </button>
                                    {isMenuOpen === item.id && (
                                      <div ref={menuRef}>
                                        <ActionMenu
                                          onApprove={() => {
                                            set_data(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onReject={() => {
                                            handleRejectClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onInfo={() => {
                                            handleInfoClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {item.event_status?.toLowerCase() === "pending" && (
                                      <>
                                        <button className="approve-btn" onClick={() => set_data(item)}>
                                          Approve
                                        </button>
                                        <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                          <IoCloseOutline style={{ height: "20px", width: "20px" }} />
                                        </button>
                                      </>
                                    )}
                                    <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                      <IoInformation style={{ height: "20px", width: "20px" }} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Data Available</p>
                  )}
                </div>
              </div>
            )}


            {category === "Equipment" && (
              <div className="section-container">
                <div className="table-container">
                  {receiver_equipment_data?.filter(
                    (item) => equipmentFilter === "all" || item.event_status === equipmentFilter
                  ).length > 0 ? (
                    <table className="received_equipment_table">
                      <thead>
                        <tr>
                          <th style={{ width: "100px" }}>NO.</th>
                          <th>Sender Email</th>
                          <th>Equipment Name</th>
                          <th>Company</th>
                          <th>Days</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiver_equipment_data
                          ?.filter(
                            (item) => equipmentFilter === "all" || item.event_status === equipmentFilter
                          )
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.sender_email}</td>
                              <td>{item.equipment_name}</td>
                              <td>{item.equipment_company}</td>
                              <td>{item.days_required}</td>
                              <td>{item.location}</td>
                              <td className={`status ${item.event_status?.toLowerCase()}`}>
                                <span>{item.event_status}</span>
                              </td>
                              <td className="action-buttons">
                                {window.innerWidth <= 660 ? (
                                  <div style={{ position: "relative" }}>
                                    <button
                                      className="mobile-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(isMenuOpen === item.id ? null : item.id);
                                      }}
                                      style={{
                                        fontSize: "20px",
                                        padding: "4px 12px",
                                        borderRadius: "4px",
                                        background: "transparent",
                                        border: "1px solid #ddd",
                                      }}
                                    >
                                      ⋮
                                    </button>
                                    {isMenuOpen === item.id && (
                                      <div ref={menuRef}>
                                        <ActionMenu
                                          onApprove={() => {
                                            set_data(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onReject={() => {
                                            handleRejectClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onInfo={() => {
                                            handleInfoClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {item.event_status?.toLowerCase() === "pending" && (
                                      <>
                                        <button className="approve-btn" onClick={() => set_data(item)}>
                                          Approve
                                        </button>
                                        <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                          <IoCloseOutline style={{ height: "20px", width: "20px" }} />
                                        </button>
                                      </>
                                    )}
                                    <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                      <IoInformation style={{ height: "20px", width: "20px" }} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Data Available</p>
                  )}
                </div>
              </div>
            )}


            {category === "Service" && (
              <div className="section-container">
                <div className="table-container">
                  {receiver_service_data?.filter(
                    (item) => serviceFilter === "all" || item.event_status === serviceFilter
                  ).length > 0 ? (
                    <table className="received_service_table">
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>Sender Email</th>
                          <th>Service Name</th>
                          <th>Days</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiver_service_data
                          ?.filter(
                            (item) =>
                              serviceFilter === "all" || item.event_status === serviceFilter
                          )
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.sender_email}</td>
                              <td>{item.service_name}</td>
                              <td>{item.days_required}</td>
                              <td>{item.location}</td>
                              <td className={`status ${item.event_status.toLowerCase()}`}>
                                <span>{item.event_status}</span>
                              </td>
                              <td className="action-buttons">
                                {window.innerWidth <= 660 ? (
                                  <div style={{ position: "relative" }}>
                                    <button
                                      className="mobile-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(isMenuOpen === item.id ? null : item.id);
                                      }}
                                      style={{
                                        fontSize: "20px",
                                        padding: "4px 12px",
                                        borderRadius: "4px",
                                        background: "transparent",
                                        border: "1px solid #ddd",
                                      }}
                                    >
                                      ⋮
                                    </button>
                                    {isMenuOpen === item.id && (
                                      <div ref={menuRef}>
                                        <ActionMenu
                                          onApprove={() => {
                                            set_data(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onReject={() => {
                                            handleRejectClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                          onInfo={() => {
                                            handleInfoClick(item);
                                            setIsMenuOpen(null);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {item.event_status.toLowerCase() === "pending" && (
                                      <>
                                        <button className="approve-btn" onClick={() => set_data(item)}>
                                          Approve
                                        </button>
                                        <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                          <IoCloseOutline style={{ height: "20px", width: "20px" }} />
                                        </button>
                                      </>
                                    )}
                                    <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                      <IoInformation style={{ height: "20px", width: "20px" }} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Data Available</p>
                  )}
                </div>
              </div>
            )}


            {show_calender_popup && (
              <AddDetailsPop
                setShowEventModal={set_show_calender_popup}
                setNewEvent={setNewEvent}
                newEvent={newEvent}
                events={events}
                setEvents={setEvents}
                set_receiver_package_data={set_receiver_package_data}
                set_receiver_equipment_data={set_receiver_equipment_data}
                set_receiver_service_data={set_receiver_service_data}
              />
            )}
          </div>
        </div>
      )}

      {popupType && (
        <RequestDetailPopup
          requestData={selectedRequest}
          popupType={popupType}
          setPopupType={setPopupType}
          onClose={handleClosePopup}
          set_receiver_package_data={set_receiver_package_data}
          set_receiver_equipment_data={set_receiver_equipment_data}
        />
      )}
    </div>
  );
}
export default EventManagement;
