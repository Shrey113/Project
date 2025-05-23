import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { IoCloseOutline, IoInformationCircleOutline } from "react-icons/io5";
import { IoInformation } from "react-icons/io5";
// import EventStatusUpdater from "./EventStatusUpdater";
import { EditableService } from "./../../../../redux/AllData.js";
// import { HiOutlineChevronUpDown } from "react-icons/hi2";
// import { add } from "date-fns";
import { IoFilter } from "react-icons/io5";
function EventManagement({ category }) {
  const user = useSelector((state) => state.user);
  const [events, setEvents] = useState([]);


  // chage a type
  const [packageFilter] = useState("all");
  const [equipmentFilter] = useState("all");
  // const [serviceFilter] = useState("all");
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

  // const [service_items, set_service_items] = useState(null);
  const [edit_service_location, set_edit_service_location] = useState("");
  const [boolean_edit_service, set_boolean_edit_service] = useState(false);

  const [show_edit_info_popup, set_show_edit_info_popup] = useState("");

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

  const [serviceDetailsPopup, setServiceDetailsPopup] = useState(null);

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
      // Check if this is part of a multi-day service event
      const serviceEvents = findRelatedServiceEvents(item);

      if (serviceEvents.length > 1) {
        // This is a multi-day event
        setNewEvent({
          id: item.id,
          title: `service - ${item.service_name}`,
          start: serviceEvents[0].start_date, // First day
          end: serviceEvents[serviceEvents.length - 1].end_date, // Last day
          description: item.requirements,
          event_request_type: item.event_request_type,
          sender_email: item.sender_email,
          event_location: item.location,
          multi_day_data: serviceEvents, // Pass all days' data
        });
      } else {
        // Single day event
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
    }

    set_show_calender_popup(true);
  }

  // Helper function to find all related service events (multi-day)
  const findRelatedServiceEvents = (item) => {
    // If receiver_service_data is not in expected format, return just this item
    if (!Array.isArray(receiver_service_data) || receiver_service_data.length === 0) {
      return [item];
    }

    // Find the array containing this item
    const relatedEvents = receiver_service_data.find(innerArray => {
      if (!Array.isArray(innerArray)) return false;

      return innerArray.some(event =>
        event.id === item.id ||
        (event.services_id === item.services_id &&
          event.sender_email === item.sender_email &&
          event.total_amount === item.total_amount &&
          Math.abs(new Date(event.time_stamp) - new Date(item.time_stamp)) < 1000 * 60 * 5) // Within 5 minutes
      );
    });

    return Array.isArray(relatedEvents) ? relatedEvents : [item];
  };

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
          // set_receiver_service_data(response.data.service);
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
    const get_service_received_request = async () => {
      try {
        const response = await fetch(`${Server_url}/owner/get_received_service_requests/${user.user_email}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch service requests');
        }
        if (response.ok) {
          const data = await response.json();
          console.log("data received for the receiver end ", data.service)
          set_receiver_service_data(data.service);
        }

      } catch (err) {
        console.error("Error fetching service details:", err);
      }
    }

    get_service_received_request();
  }, [user.user_email])

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
            // set_sent_service_data(response.data.service);
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
          // set_sent_service_data(response.data.service);
        } else {
          console.log("No data received or an error occurred");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    get_sent_all_details();
  }, [user.user_email]);

  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        const response = await fetch(`${Server_url}/get-sent-service-requests-by/${user.user_email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch service requests');
        }

        const data = await response.json();
        console.log(data.service);
        set_sent_service_data(data.service);
        console.log("set_sent_service_data..............", data.service);
        // Update state with service and event data
      } catch (err) {
        console.error('Error fetching service requests:', err);
      }
    };

    fetchServiceRequests();
  }, [user?.user_email]);

  const EmptyState = ({ title = "No data available", subtitle, icon }) => {
    return (
      <div className="empty-state">
        {icon && <div className="empty-icon">{icon}</div>}
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    );
  };


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  useEffect(() => {
    const equipment_count = receiver_equipment_data?.length;
    const package_count = receiver_package_data?.length;
    const service_count = receiver_service_data?.length;
    set_count_for_package(package_count);
    set_count_for_equipment(equipment_count);
    set_count_for_service(service_count);
  }, [receiver_equipment_data, receiver_package_data, receiver_service_data])

  const [selected_service_data, setSelected_service_data] = useState("All");
  const [isOpen_service_data, setIsOpen_service_data] = useState(false);
  const dropdownRef_service_data = useRef(null);

  const options = ["All", "Pending", "Accepted", "Rejected", "Completed", "Event Expired"];

  const handleSelect = (value) => {
    setSelected_service_data(value);
    setIsOpen_service_data(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef_service_data.current && !dropdownRef_service_data.current.contains(event.target)) {
      setIsOpen_service_data(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ActionMenu = ({ onApprove, onReject, onInfo, eventStatus }) => {
    const isFinal = eventStatus === "Accepted" || eventStatus === "Rejected" ||
      eventStatus === "Completed" || eventStatus === "Event Expired";
    return (
      <div className="action-menu">
        {!isFinal && (
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
      console.log("sender email", sender_email);
      const data = await respose.json();
      console.log("profile data", data)
      set_profile_data(data)
    } catch (e) {
      console.error("error while fetching the profile data", e)
      // showRejectToast()
    }
  }

  // Utility function to determine if an event has passed
  const isEventPassed = (endDate) => {
    if (!endDate) return false;
    const eventEndTime = new Date(endDate).getTime();
    const currentTime = new Date().getTime();
    return eventEndTime < currentTime;
  };

  // Get display status based on event status and time
  const getDisplayStatus = (item) => {
    // If event has passed (end time < current time)
    if (isEventPassed(item.end_date)) {
      if (item.event_status === "Accepted") {
        return "Completed";
      } else if (item.event_status !== "Rejected") {
        return "Event Expired";
      }
    }

    // Return original status if not passed
    return item.event_status;
  };

  // to show the confirmation status 
  const getAllMemberConfirmation = (innerArray) => {
    console.log("this is the data for confirmation... ", innerArray);

    const statuses = innerArray.map(item => item.event_status);

    if (statuses.every(status => status === "Accepted")) {
      return "Accepted";
    }

    if (statuses.some(status => status === "waiting on team")) {
      return "waiting on team";
    }
    return "Pending"
  };

  const handleFetchServiceInfo = async (item) => {
    const eventIds = item.map(event => ({ id: event.id }));
    console.log("Sending event IDs:", eventIds);

    try {
      const response = await fetch(`${Server_url}/get_info_for_sent_service_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventIds), // Send [{ id: 193 }, { id: 194 }, { id: 195 }]
      });

      const data = await response.json();
      set_show_edit_info_popup(data);
      console.log("form of data that i am getting", data)
    } catch (error) {
      console.error("Error fetching event info:", error);
    }
  }

  // after assigning team members 
  const handleServiceInfoClick = (innerArray) => {
    console.log("getting data..........", innerArray)

    const ids = innerArray.map((items) => {
      return items.id
    })

    fetch(`${Server_url}/owner/service_and_team_member_details_fetcing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"  // Specify the content type as JSON
      },
      body: JSON.stringify({ ids })  // Send ids as a JSON object
    })
      .then(response => response.json())  // Parse the response as JSON
      .then(data => {
        console.log("Response from server:", data);
        setServiceDetailsPopup(data.data);
      })
      .catch(error => {
        console.error("Error sending request:", error);
      });
  }

  // for edit of service location and location link 
  const handleEditClick = async (item) => {
    console.log("edit button clicked", item);

    // Extract only the id from each item
    const eventIds = item.map(event => ({ id: event.id }));
    console.log("Sending event IDs:", eventIds);

    try {
      const response = await fetch(`${Server_url}/get_info_for_sent_service_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventIds), // Send [{ id: 193 }, { id: 194 }, { id: 195 }]
      });

      const data = await response.json();
      set_edit_service_location(data);
      set_boolean_edit_service(true);
    } catch (error) {
      console.error("Error fetching event info:", error);
    }
  };


  // Function to refresh data after status updates
  const refreshReceivedData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${Server_url}/owner/get-equipment-details-by/${user.user_email}`
      );
      if (response.data) {
        set_receiver_package_data(response.data.package);
        set_receiver_equipment_data(response.data.equipment);
        // set_receiver_service_data(response.data.service);
      }
    } catch (error) {
      console.error("Error refreshing event data:", error);
    }
  }, [user.user_email]);

  // Function to get status class for CSS styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'event expired':
        return 'event_expired';
      default:
        return status.toLowerCase().replace(/\s+/g, '_');
    }
  };

  // Add the EventStatusUpdater component to handle background status updates
  useEffect(() => {
    // Initial check for past events when component mounts
    const checkInitialPastEvents = async () => {
      try {
        await axios.get(`${Server_url}/team_members/check-past-events/${user.user_email}`);
        refreshReceivedData();
      } catch (error) {
        console.error("Error checking past events on mount:", error);
      }
    };

    checkInitialPastEvents();
  }, [user.user_email, refreshReceivedData]);

  return (
    <div id="owner-main-container-EventManagement">
      {/* Include the status updater component */}
      {/* <EventStatusUpdater user_email={user.user_email} updateReceivedData={refreshReceivedData} /> */}

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
                  <span className={`status ${selected_sent_item?.event_status === "Waiting on Team" ? "status-waiting-on-team" : selected_sent_item?.event_status === "Accepted" ? "status-accepted" : selected_sent_item?.event_status === "Rejected" ? "status-rejected" : "status-pending"}`}>
                    {selected_sent_item?.event_status || "Pending"}
                  </span>
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

                        {selected_sent_item.event_request_type === "Event" ? (
                          <>
                            <TRow
                              label="Event Name"
                              value={selected_sent_item.event_name}
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

                <button className="close-button" onClick={() => set_selected_sent_item(null)} >
                  Close
                </button>
              </div>
            </div>
          )}

          {Array.isArray(show_edit_info_popup) && show_edit_info_popup.length > 0 && (
            <div className="details-modal-overlay" onClick={() => set_show_edit_info_popup(null)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>

                <h3 className="modal-header">Request Details</h3>
                {show_edit_info_popup.map((innerArray, index) => (
                  <div key={index}>
                    <div className="modal-header-container">
                      <span className={`status ${innerArray.event_status === "Waiting on Team"
                        ? "status-waiting-on-team"
                        : innerArray.event_status === "Accepted"
                          ? "status-accepted"
                          : innerArray.event_status === "Rejected"
                            ? "status-rejected"
                            : "status-pending"
                        }`}>
                        {innerArray.event_status || "Pending"}
                      </span>
                    </div>

                    <div className="modal-content-container">
                      {/* Left Side */}
                      <div className="modal-left">
                        <table className="details-table">
                          <tbody>
                            <TRow label="Sender Email" value={innerArray.sender_email} />

                            {innerArray.event_request_type === "Event" ? (
                              <>
                                <TRow label="Event Name" value={innerArray.event_name} />
                                <TRow label="Service" value={innerArray.service} />
                                <TRow label="Requirement" value={innerArray.requirements} />
                                <TRow label="Price" value={`₹${innerArray.price}`} />
                              </>
                            ) : innerArray.event_request_type === "equipment" ? (
                              <>
                                <TRow label="Equipment Name" value={innerArray.equipment_name} />
                                <TRow label="Equipment Company" value={innerArray.equipment_company} />
                                <TRow label="Equipment Type" value={innerArray.equipment_type} />
                                <TRow label="Requirement" value={innerArray.requirements} />
                                <TRow label="Price" value={`₹${innerArray.equipment_price_per_day}`} />
                                <TRow label="Days Required" value={innerArray.days_required} />
                                <TRow label="Total Amount" value={`₹${innerArray.total_amount}`} />
                              </>
                            ) : innerArray.event_request_type === "service" ? (
                              <>
                                <TRow label="Service Name" value={innerArray.service_name} />
                                <TRow label="Price" value={`₹${innerArray.service_price_per_day}`} />
                                {innerArray.requirements && <TRow label="Requirement" value={innerArray.requirements} />}
                              </>
                            ) : null}
                          </tbody>
                        </table>
                      </div>

                      {/* Right Side */}
                      <div className="modal-right">
                        <div className={`status-box ${innerArray.event_status?.toLowerCase()}`}>
                          <table className="details-table">
                            <tbody>
                              <TRow label="Start Date" value={formatDate(innerArray.start_date)} />
                              <TRow label="End Date" value={formatDate(innerArray.end_date)} />
                              <TRow label="Location" value={innerArray.location} />

                              {innerArray.event_status === "Accepted" &&
                                Array.isArray(innerArray.assigned_team_member) &&
                                innerArray.assigned_team_member.length > 0 && (
                                  <TRow
                                    label="Assigned Team Members"
                                    value={
                                      <ul>
                                        {innerArray.assigned_team_member.map((member, idx) => (
                                          <div key={idx}>{member}</div>
                                        ))}
                                      </ul>
                                    }
                                  />
                                )}

                              {innerArray.event_status === "Rejected" &&
                                innerArray.reason && (
                                  <TRow label="Reason for Rejection" value={innerArray.reason} />
                                )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}

                <button className="close-button" onClick={() => set_show_edit_info_popup(null)}>
                  Close
                </button>
              </div>
            </div>
          )}

          <div id="EventManagement">
            {["All Events"].includes(category) && (
              <div className="section-container">
                <div className="table-container">
                  {sent_package_data.length > 0 ? (
                    <table className="sent_package_table">
                      <thead>
                        <tr>
                          <th style={{ width: "10px" }}>NO.</th>
                          <th>Package Name</th>
                          <th>Service</th>
                          <th>Requirements</th>
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
                            <td className="description">{item.requirements}</td>
                            <td>₹{item.price}</td>
                            <td>{item.receiver_email}</td>
                            <td className={`status ${getStatusClass(getDisplayStatus(item))}`}>
                              <span>{getDisplayStatus(item)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data-message">No Sent Event Requests</p>
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
                            <td className={`status ${getStatusClass(getDisplayStatus(item))}`}>
                              <span>{getDisplayStatus(item)}</span>
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
                  {Array.isArray(sent_service_data) && sent_service_data.flat().length > 0 ? (
                    <table className="sent_service_table">
                      <thead>
                        <tr>
                          <th>NO.</th>
                          <th>Service Name</th>
                          <th>Price</th>
                          <th>Days</th>
                          <th>Receiver</th>
                          <th>Status</th>
                          <th>Action</th>
                          {/* <th>multiday_id</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {sent_service_data.map((innerArray, index) => {
                          // Use the first item in the inner array for field values
                          const item = innerArray[0] || {};
                          return (
                            <tr
                              key={index}
                              onClick={() => handleFetchServiceInfo(sent_service_data[index])}
                            >
                              <td>{index + 1}</td>
                              <td>{item.service_name || 'N/A'}</td>
                              <td>₹{item.total_amount || '0'}</td>
                              <td>{item.days_required || 'N/A'}</td>
                              <td>{item.receiver_email || 'N/A'}</td>
                              <td className={`status ${getStatusClass(getAllMemberConfirmation(innerArray))}`}>
                                <span>{getAllMemberConfirmation(innerArray)}</span>
                              </td>
                              <td className="sent_button_edit" onClick={(e) => { e.stopPropagation() }} style={{ minHeight: "100% ", padding: "12px 15px" }}>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(sent_service_data[index])
                                }}>Edit</button>
                              </td>
                            </tr>
                          );
                        })}
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
            {category === "All Events" && (
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
                              <td style={{ maxWidth: "240px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
                              <td className={`status ${getStatusClass(getDisplayStatus(item))}`}>
                                <span>{getDisplayStatus(item)}</span>
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
                                          eventStatus={getDisplayStatus(item)}
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
                                    {getDisplayStatus(item).toLowerCase() === "pending" && (
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
                    <p className="no-data-message">No Event Requests Available</p>
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
                              <td style={{ maxWidth: "180px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.equipment_name}</td>
                              <td>{item.equipment_company}</td>
                              <td>{item.days_required}</td>
                              <td style={{ maxWidth: "240px", overflow: "hidden", textWrap: "nowrap", textOverflow: "ellipsis" }}>{item.location}</td>
                              <td className={`status ${getStatusClass(getDisplayStatus(item))}`}>
                                <span>{getDisplayStatus(item)}</span>
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
                                          eventStatus={getDisplayStatus(item)}
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
                                    {getDisplayStatus(item).toLowerCase() === "pending" && (
                                      <>
                                        <button className="approve-btn" onClick={() => { fetchProfileData(item.sender_email); set_data(item) }}>
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
                    <p className="no-data-message">No Equipment Requests Available</p>
                  )}
                </div>
              </div>
            )}


            {category === "Service" && (
              <div className="section-container">
                {category === "Service" && (
                  <div className="service-filter-container">
                    <div className="dropdown" ref={dropdownRef_service_data}>
                      <button className="dropdown-toggle" onClick={() => setIsOpen_service_data(!isOpen_service_data)}>
                        <IoFilter /> <span>{selected_service_data}</span>
                      </button>
                      {isOpen_service_data && (
                        <div className="dropdown-menu">
                          {options.map((option) => (
                            <div
                              key={option}
                              className={`dropdown-item ${option === selected_service_data ? "selected" : ""}`}
                              onClick={() => handleSelect(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="table-container">
                  {receiver_service_data?.length > 0 ? (
                    <>
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
                            .filter(
                              (innerArray) =>
                                Array.isArray(innerArray) &&
                                innerArray.length > 0 &&
                                (selected_service_data === "All" ||
                                  getDisplayStatus(innerArray[0]) === selected_service_data)
                            )
                            .map((innerArray, index) => {
                              const item = innerArray[0]; // Use the first item
                              return (
                                <tr key={item.id || index}>
                                  <td>{index + 1}</td>
                                  <td>{item.sender_email || 'N/A'}</td>
                                  <td>{item.service_name || 'N/A'}</td>
                                  <td>{item.days_required || 'N/A'}</td>
                                  <td
                                    style={{
                                      maxWidth: "240px",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {item.location || 'N/A'}
                                  </td>
                                  <td className={`status ${getStatusClass(getAllMemberConfirmation(innerArray))}`}>
                                    <span>{getAllMemberConfirmation(innerArray)}</span>
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
                                              eventStatus={getDisplayStatus(item)}
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
                                        {getDisplayStatus(item).toLowerCase() === "pending" && (
                                          <>
                                            <button className="approve-btn" onClick={() => set_data(item)}>
                                              Approve
                                            </button>
                                            <button className="reject-btn" onClick={() => handleRejectClick(item)}>
                                              <IoCloseOutline style={{ height: "20px", width: "20px" }} />
                                            </button>
                                          </>
                                        )}
                                        <button className="info-btn" onClick={() => handleServiceInfoClick(innerArray)}>
                                          <IoInformation style={{ height: "20px", width: "20px" }} />
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>

                      </table>

                      {/* Show fallback message when filtered results are empty */}
                      {receiver_service_data.filter(
                        (item) =>
                          selected_service_data === "All" ||
                          getDisplayStatus(item) === selected_service_data
                      ).length === 0 && (
                          <EmptyState
                            title={
                              <>
                                No <span className="highlight">{selected_service_data.toLowerCase()}</span> service available
                              </>
                            }
                            subtitle="Try selecting a different filter or check back later."
                            icon={<IoInformationCircleOutline size={48} color="#888" />}
                          />
                        )}
                    </>
                  ) : (
                    <p className="no-data-message">No Service Requests Available</p>
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
      {boolean_edit_service &&
        (<EditableService editableData={edit_service_location} set_boolean_edit_service={set_boolean_edit_service} />)
      }
      
      {/* Service Details Popup */}
      {serviceDetailsPopup && (
        <div className="service-details-popup-overlay" onClick={() => setServiceDetailsPopup(null)}>
          <div className="service-details-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="service-details-popup-header">
              <h2>Service Request Details</h2>
              <button className="close-btn" onClick={() => setServiceDetailsPopup(null)}>
                <IoCloseOutline />
              </button>
            </div>
            
            {/* Main service info */}
            {serviceDetailsPopup.length > 0 && (
              <div className="service-main-info">
                <div className="service-info-row">
                  <div className="service-info-item">
                    <span className="info-label">Service Name:</span>
                    <span className="info-value">{serviceDetailsPopup[0].event_data.service_name}</span>
                  </div>
                  <div className="service-info-item">
                    <span className="info-label">Total Amount:</span>
                    <span className="info-value">₹{serviceDetailsPopup[0].event_data.total_amount}</span>
                  </div>
                </div>
                <div className="service-info-row">
                  <div className="service-info-item">
                    <span className="info-label">Sender:</span>
                    <span className="info-value">{serviceDetailsPopup[0].event_data.sender_email}</span>
                  </div>
                  <div className="service-info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{serviceDetailsPopup[0].event_data.days_required} days</span>
                  </div>
                </div>
                <div className="service-info-row">
                  <div className="service-info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{serviceDetailsPopup[0].event_data.location}</span>
                  </div>
                  <div className="service-info-item">
                    <span className="info-label">Status:</span>
                    <span className={`info-value status ${serviceDetailsPopup[0].event_data.event_status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {serviceDetailsPopup[0].event_data.event_status}
                    </span>
                  </div>
                </div>
                {serviceDetailsPopup[0].event_data.requirements && (
                  <div className="service-info-row full-width">
                    <div className="service-info-item">
                      <span className="info-label">Requirements:</span>
                      <span className="info-value">{serviceDetailsPopup[0].event_data.requirements}</span>
                    </div>
                  </div>
                )}
                <div className="service-info-row full-width">
                  <div className="service-info-item">
                    <span className="info-label">Location Link:</span>
                    <a 
                      href={serviceDetailsPopup[0].event_data.location_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="location-link"
                    >
                      {serviceDetailsPopup[0].event_data.location_link}
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Day-by-day breakdown */}
            <div className="day-breakdown">
              <h3>Day-by-Day Schedule & Team Assignments</h3>
              <div className="days-container">
                {serviceDetailsPopup.map((dayData, index) => (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span className="day-number">Day {dayData.event_data.day_number}</span>
                      <span className="day-date">
                        {formatDate(dayData.event_data.start_date)} - {formatDate(dayData.event_data.end_date)}
                      </span>
                    </div>
                    <div className="team-member-details">
                      <div className="team-member-row">
                        <span className="team-label">Team Member:</span>
                        <span className="team-value">{dayData.team_member_details.member_name}</span>
                      </div>
                      <div className="team-member-row">
                        <span className="team-label">Email:</span>
                        <span className="team-value">{dayData.team_member_details.team_member_email}</span>
                      </div>
                      <div className="team-member-row">
                        <span className="team-label">Role:</span>
                        <span className="team-value">{dayData.event_team_members.role_in_event}</span>
                      </div>
                      <div className="team-member-row">
                        <span className="team-label">Status:</span>
                        <span className={`team-value status ${dayData.event_team_members.confirmation_status?.toLowerCase()}`}>
                          {dayData.event_team_members.confirmation_status}
                        </span>
                      </div>
                      {dayData.event_team_members.price_in_event && (
                        <div className="team-member-row">
                          <span className="team-label">Price:</span>
                          <span className="team-value">₹{dayData.event_team_members.price_in_event}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EventManagement;
