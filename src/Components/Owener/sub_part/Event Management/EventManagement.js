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
<<<<<<< HEAD
import PaginatedTable from "./PaginatedTable";
=======
// import { HiOutlineChevronUpDown } from "react-icons/hi2";
// import { add } from "date-fns";
>>>>>>> 452b3f66cae3e93cc47b17d3f00b07b232f22c99
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

  const [profile_data, set_profile_data] = useState();

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
        <td
          style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              userSelect: 'text',
            }}
          >
            {value}
          </span>
        </td>
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

  const ActionMenu = ({ onApprove, onReject, onInfo, status }) => {
    return (
      <div className="action-menu">
        {status === "Pending" && (
          <>
            <button onClick={onApprove} className="action-menu-btn approve">
              <span className="icon">✓</span>
              <span className="text">Approve</span>
            </button>
            <button onClick={onReject} className="action-menu-btn reject">
              <span className="icon">✕</span>
              <span className="text">Reject</span>
            </button>
          </>
        )}
        <button onClick={onInfo} className="action-menu-btn info">
          <span className="icon">ℹ</span>
          <span className="text">View Details</span>
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
  useEffect(() => {
    if (popupType || show_calender_popup || selected_sent_item) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [popupType, show_calender_popup, selected_sent_item]);

  const handleClose = () => {
    set_selected_sent_item(false)
  }

  useEffect(() => {
    const updateNotificationIsSeen = async (notification_type) => {
      try {
        const response = await fetch(`${Server_url}/owner/update-Notification-is-seen/${notification_type}`);
        await response.json();
      } catch (error) {
        console.error("Failed to update notification:", error);
      }
    };
    if (category === "Packages") {
      updateNotificationIsSeen("package")
    } else if (category === "Equipment") {
      updateNotificationIsSeen("equipment")
    } else if (category === "Service") {
      updateNotificationIsSeen("service")
    }
  })
  const fetchProfileData = async (sender_email) => {
    try {
      const respose = await fetch(`${Server_url}/owner/fetch_profile_in_equipment/${sender_email}`,)
      const data = await respose.json();
      set_profile_data(data)
    } catch (e) {
      console.error("error while fetching the profile data", e)
      // showRejectToast()
    }
  }

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
            <div className="details-modal-overlay" onClick={handleClose}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header-container">
                  <h3 className="modal-header">Request Details</h3>
                  {selected_sent_item?.event_status?.toLowerCase() === 'waiting on team' ? (
                    <span className="waiting-status">
                       Team Confirmation
                    </span>
                  ) : (
                    <span className={`status ${selected_sent_item?.event_status?.toLowerCase()}`}>
                      {selected_sent_item?.event_status || "Pending"}
                    </span>
                  )}
                </div>
                <div className="modal-content-container">
                  {/* Left Side: Main Request Details */}
                  <div className="modal-left">
                    <table className="details-table">
                      <tbody>
                        {/* <TRow label="ID" value={selected_sent_item.id} /> */}
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
                              label="Requirement"
                              value={selected_sent_item.requirements}
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
                              label="Requirement"
                              value={selected_sent_item.requirements}
                            />
                            {/* <TRow
                              label="Description"
                              value={selected_sent_item.description}
                            /> */}
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
                            <TRow
                              label="Requirement"
                              value={selected_sent_item.requirements}
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
                            {/* <TRow
                              label="Status"
                              value={
                                <span
                                  className={`status ${selected_sent_item.event_status?.toLowerCase()}`}
                                >
                                  {selected_sent_item.event_status}
                                </span>
                              }
                            /> */}

                            {selected_sent_item.event_status === "Accepted" &&
                              selected_sent_item.assigned_team_member?.length >
                              0 && (
                                <TRow
                                  label="Assigned Team Members"
                                  value={
                                    <ul>
                                      {selected_sent_item.assigned_team_member.map(
                                        (member, index) => (
                                          <div key={index}>{member}</div>
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

                            {/* {selected_sent_item.event_status === "Pending" && (
                              <tr>
                                <td colSpan="2">
                                  Your request is in pending mode. Please wait
                                  for approval.
                                </td>
                              </tr>
                            )} */}
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
                    <PaginatedTable
                      data={sent_package_data}
                      columns={[
                        { header: 'NO.', style: { width: "10px" } },
                        { header: 'Package Name' },
                        { header: 'Service' },
                        { header: 'Requirements' },
                        { header: 'Price' },
                        { header: 'Receiver' },
                        { header: 'Status' }
                      ]}
                      renderRow={(item, index) => (
                        <tr key={index} onClick={() => set_selected_sent_item(item)}>
                          <td>{index + 1}</td>
                          <td className="package_name">{item.package_name}</td>
                          <td>{item.service}</td>
                          <td className="description">{item.requirements}</td>
                          <td>₹{item.price}</td>
                          <td>{item.receiver_email}</td>
                          <td className={`status ${item.event_status?.toLowerCase()}`}>
                            <span>{item.event_status}</span>
                          </td>
                        </tr>
                      )}
                      emptyMessage="No Sent Package Requests"
                    />
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
                    <PaginatedTable
                      data={sent_equipment_data}
                      columns={[
                        { header: 'No.' },
                        { header: 'Equipment Name' },
                        { header: 'Company' },
                        { header: 'Type' },
                        { header: 'Days' },
                        { header: 'Receiver' },
                        { header: 'Status' }
                      ]}
                      renderRow={(item, index) => (
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
                      )}
                      emptyMessage="No Sent Equipment Requests"
                    />
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
                    <PaginatedTable
                      data={sent_service_data}
                      columns={[
                        { header: 'NO.' },
                        { header: 'Service Name' },
                        { header: 'Price' },
                        { header: 'Days' },
                        { header: 'Receiver' },
                        { header: 'Status' }
                      ]}
                      renderRow={(item, index) => (
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
                      )}
                      emptyMessage="No Sent Service Requests"
                    />
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
                    <PaginatedTable
                      data={receiver_package_data?.filter(
                        (item) => packageFilter === "all" || item.event_status === packageFilter
                      )}
                      columns={[
                        { header: 'NO.' },
                        { header: 'Sender Email' },
                        { header: 'Package Name' },
                        { header: 'Price' },
                        { header: 'Location' },
                        { header: 'Status' },
                        { header: 'Action' }
                      ]}
                      renderRow={(item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.sender_email}</td>
                          <td>{item.package_name}</td>
                          <td>₹{item.price}</td>
                          <td style={{ maxWidth: "180px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
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
                                >
                                  <span className="dots-icon">⋮</span>
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
                                      status={item.event_status}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="action-buttons-wrapper">
                                {item.event_status?.toLowerCase() === "pending" && (
                                  <>
                                    <button className="approve-btn" onClick={() => set_data(item)}>
                                      Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                      <IoCloseOutline className="action-icon" />
                                    </button>
                                  </>
                                )}
                                <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                  <IoInformation className="action-icon" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      emptyMessage="No Package Data Available"
                    />
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
                    <PaginatedTable
                      data={receiver_equipment_data?.filter(
                        (item) => equipmentFilter === "all" || item.event_status === equipmentFilter
                      )}
                      columns={[
                        { header: 'NO.', style: { width: "100px" } },
                        { header: 'Sender Email' },
                        { header: 'Equipment Name' },
                        { header: 'Company' },
                        { header: 'Days' },
                        { header: 'Location' },
                        { header: 'Status' },
                        { header: 'Action' }
                      ]}
                      renderRow={(item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.sender_email}</td>
                          <td style={{ maxWidth: "180px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.equipment_name}</td>
                          <td style={{ maxWidth: "120px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.equipment_company}</td>
                          <td>{item.days_required}</td>
                          <td style={{ maxWidth: "240px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
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
                                >
                                  <span className="dots-icon">⋮</span>
                                </button>
                                {isMenuOpen === item.id && (
                                  <div ref={menuRef}>
                                    <ActionMenu
                                      onApprove={() => {
                                        fetchProfileData(item.sender_email);
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
                                      status={item.event_status}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="action-buttons-wrapper">
                                {item.event_status?.toLowerCase() === "pending" && (
                                  <>
                                    <button className="approve-btn" onClick={() => { fetchProfileData(item.sender_email); set_data(item) }}>
                                      Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                      <IoCloseOutline className="action-icon" />
                                    </button>
                                  </>
                                )}
                                <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                  <IoInformation className="action-icon" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      emptyMessage="No Equipment Data Available"
                    />
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
<<<<<<< HEAD
                    <PaginatedTable
                      data={receiver_service_data?.filter(
                        (item) => serviceFilter === "all" || item.event_status === serviceFilter
                      )}
                      columns={[
                        { header: 'NO.' },
                        { header: 'Sender Email' },
                        { header: 'Service Name' },
                        { header: 'Days' },
                        { header: 'Location' },
                        { header: 'Status' },
                        { header: 'Action' }
                      ]}
                      renderRow={(item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.sender_email}</td>
                          <td style={{ maxWidth: "170px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.service_name}</td>
                          <td>{item.days_required}</td>
                          <td style={{ maxWidth: "170px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
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
                                >
                                  <span className="dots-icon">⋮</span>
                                </button>
                                {isMenuOpen === item.id && (
                                  <div ref={menuRef}>
                                    <ActionMenu
                                      onApprove={() => {
                                        set_data(item);
                                        setIsMenuOpen(null);
=======
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
                              <td style={{ maxWidth: "240px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
                              {item.event_status?.toLowerCase() === 'waiting on team' ? (
                                <td className="waiting-status">
                                  <span>
                                    Team Confirmation
                                  </span>
                                </td>
                              ) : (
                                <td className={`status ${item.event_status.toLowerCase()}`}>
                                  <span>{item.event_status}</span>
                                </td>
                              )}
                              
                              <td className="action-buttons">
                                {window.innerWidth <= 660 ? (
                                  <div style={{ position: "relative" }}>
                                    <button
                                      className="mobile-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(isMenuOpen === item.id ? null : item.id);
>>>>>>> 452b3f66cae3e93cc47b17d3f00b07b232f22c99
                                      }}
                                      onReject={() => {
                                        handleRejectClick(item);
                                        setIsMenuOpen(null);
                                      }}
                                      onInfo={() => {
                                        handleInfoClick(item);
                                        setIsMenuOpen(null);
                                      }}
                                      status={item.event_status}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="action-buttons-wrapper">
                                {item.event_status.toLowerCase() === "pending" && (
                                  <>
                                    <button className="approve-btn" onClick={() => set_data(item)}>
                                      Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                      <IoCloseOutline className="action-icon" />
                                    </button>
                                  </>
                                )}
                                <button className="info-btn" onClick={() => handleInfoClick(item)}>
                                  <IoInformation className="action-icon" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      emptyMessage="No Service Data Available"
                    />
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
                profile_data={profile_data}
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
