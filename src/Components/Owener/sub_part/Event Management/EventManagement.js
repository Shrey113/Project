import React, { useState, useEffect } from "react";
import "./EventManagement.css";
import axios from "axios";

import accept from "./sub_img/correct.png";
import reject from "./sub_img/remove.png";
import info from "./sub_img/letter-i.png";
import { Server_url } from "../../../../redux/AllData";
import { useSelector } from "react-redux";
import RequestDetailPopup from "./RequestDetailPopup";
import AddDetailsPop from "./AddDetailsPop";

function EventManagement() {
  const user = useSelector((state) => state.user);
  const [events, setEvents] = useState([]);

  // chage a type
  const [packageFilter] = useState("all");
  const [equipmentFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [sent_request, set_sent_request] = useState(false);
  // for popups
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [popupType, setPopupType] = useState(null);

  // All data use state
  const [receiver_equipment_data, set_receiver_equipment_data] = useState([]);
  const [receiver_package_data, set_receiver_package_data] = useState([]);
  const [sent_package_data, set_sent_package_data] = useState([]);
  const [sent_equipment_data, set_sent_equipment_data] = useState([]);

  const [selected_sent_item, set_selected_sent_item] = useState(null);

  const [show_calender_popup, set_show_calender_popup] = useState(false);
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
        event_request_type:item.event_request_type,
        sender_email:item.sender_email,
        event_location:item.location


      });
    } else if (item.event_request_type === "equipment") {
      setNewEvent({

        id: item.id,
        title: `equipment - ${item.equipment_name}`,
        start: item.start_date,
        end: item.end_date,
        description: item.requirements,
        event_request_type:item.event_request_type,
        sender_email:item.sender_email,
        event_location:item.location

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
    const get_sent_all_details = async () => {
      try {
        const response = await axios.get(
          `${Server_url}/get-sent-all-details-by/${user.user_email}`
        );
        if (!response.error) {
   

          set_sent_package_data(response.data.package);
          set_sent_equipment_data(response.data.equipment);
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

  return (
    <div id="owner-main-container-EventManagement">
      {/* Toggle Button */}
      <div className="toggle_button_con_event_management">
        <div
          className="active_button"
          style={{
            left: sent_request ? "200px" : "0px",
          }}
        ></div>

        <button onClick={() => set_sent_request(false)}>
          <span>Received Requests</span>
        </button>

        <button onClick={() => set_sent_request(true)}>
          <span>Sent Requests</span>
        </button>
      </div>

      {/* sent requests  */}
      {sent_request && (
        <div className="sent_request">
          <div className="category-selector">
            <label>Select Category: </label>
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="all">All</option>
              <option value="packages">Packages</option>
              <option value="equipment">Equipment</option>
              {/* Added 'All' option */}
            </select>
          </div>

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
                        <TRow label="Sender Email" value={selected_sent_item.sender_email} />
                        {selected_sent_item.event_request_type === "package" ? (
                          <>
                            <TRow label="Package Name" value={selected_sent_item.package_name} />
                            <TRow label="Service" value={selected_sent_item.service} />
                            <TRow label="Description" value={selected_sent_item.description} />
                            <TRow label="Price" value={`₹${selected_sent_item.price}`} />
                          </>
                        ) : selected_sent_item.event_request_type === "equipment" ? (
                          <>
                            <TRow label="Equipment Name" value={selected_sent_item.equipment_name} />
                            <TRow label="Equipment Company" value={selected_sent_item.equipment_company} />
                            <TRow label="Equipment Type" value={selected_sent_item.equipment_type} />
                            <TRow label="Description" value={selected_sent_item.equipment_description} />
                            <TRow label="Price" value={`₹${selected_sent_item.equipment_price_per_day}`} />
                            <TRow label="Days Required" value={selected_sent_item.days_required} />
                            <TRow label="Total Amount" value={`₹${selected_sent_item.total_amount}`} />
                          </>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Side: Status Display */}
                  <div className="modal-right">
                    {selected_sent_item && (
                      <div
                        className={`status-box ${selected_sent_item.event_status.toLowerCase()}`}
                      >
                        <table className="details-table">
                        <tbody>
                              <TRow label="Start Date" value={formatDate(selected_sent_item.start_date)} />
                              <TRow label="End Date" value={formatDate(selected_sent_item.end_date)} />
                              <TRow label="Location" value={selected_sent_item.location} />
                              <TRow 
                                label="Status" 
                                value={
                                  <span className={`status ${selected_sent_item.event_status.toLowerCase()}`}>
                                    {selected_sent_item.event_status}
                                  </span>
                                }
                              />
                              
                              {selected_sent_item.event_status === "Accepted" &&
                                selected_sent_item.assigned_team_member?.length > 0 && (
                                  <TRow label="Assigned Team Members" 
                                    value={
                                      <ul>
                                        {selected_sent_item.assigned_team_member.map((member, index) => (
                                          <div key={index}>✅ {member}</div>
                                        ))}
                                      </ul>
                                    } 
                                  />
                                )}
                              
                              {selected_sent_item.event_status === "Rejected" && selected_sent_item.reason && (
                                <TRow label="Reason for Rejection" value={selected_sent_item.reason} />
                              )}
                              
                              {selected_sent_item.event_status === "Pending" && (
                                <tr>
                                  <td colSpan="2">Your request is in pending mode. Please wait for approval.</td>
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
          {["all", "packages"].includes(selectedCategory) && (
            <div className="section-container">
              <h2>Package Requests</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Package Name</th>
                      <th>Service</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Receiver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sent_package_data.length > 0 ? (
                      sent_package_data.map((item, index) => (
                        <tr key={index} onClick={() => set_selected_sent_item(item)}>
                          <td>{item.id}</td>
                          <td className="package_name">{item.package_name}</td>
                          <td>{item.service}</td>
                          <td className="description">{item.description}</td>
                          <td>₹{item.price}</td>
                          <td>{item.receiver_email}</td>
                          <td className={`status ${item.event_status.toLowerCase()}`}>
                            <span>{item.event_status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">No Sent Package Requests</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        
          {["all", "equipment"].includes(selectedCategory) && (
            <div className="section-container">
              <h2>Equipment Requests</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Equipment Name</th>
                      <th>Company</th>
                      <th>Type</th>
                      <th>Days Required</th>
                      <th>Receiver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sent_equipment_data.length > 0 ? (
                      sent_equipment_data.map((item, index) => (
                        <tr key={index} onClick={() => set_selected_sent_item(item)}>
                          <td>{item.id}</td>
                          <td>{item.equipment_name}</td>
                          <td>{item.equipment_company}</td>
                          <td>{item.equipment_type}</td>
                          <td>{item.days_required}</td>
                          <td>{item.receiver_email}</td>
                          <td className={`status ${item.event_status.toLowerCase()}`}>
                            <span>{item.event_status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">No Sent Equipment Requests</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        </div>
      )}

      {/* received request section  */}
      {!sent_request && (
        <div className="received_request">
          <div className="category-selector">
            <label>Select Category: </label>
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="all">All</option>
              <option value="packages">Packages</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div id="EventManagement">
            {selectedCategory === "all" && (
              <>
                {/* All category: Show both packages and equipment requests */}
                <div className="section-container">
                  <h2>Package Requests</h2>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
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
                            (item) =>
                              packageFilter === "all" ||
                              item.event_status === packageFilter
                          )
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{item.id}</td>
                              <td>{item.sender_email}</td>
                              <td>{item.package_name}</td>
                              <td>₹{item.price}</td>
                              <td>{item.location}</td>
                              <td
                                className={`status ${item.event_status.toLowerCase()}`}
                              >
                                <span>{item.event_status}</span>
                              </td>
                              <td className="action-buttons">
                                {item.event_status.toLowerCase() ===
                                  "pending" && (
                                  <>
                                    <button
                                      className="approve-btn"
                                      onClick={() => {
                                        set_data(item);
                                      }}
                                    >
                                      <img src={accept} alt="Accept" />
                                    </button>
                                    <button
                                      className="reject-btn"
                                      onClick={() => handleRejectClick(item)}
                                    >
                                      <img src={reject} alt="Reject" />
                                    </button>
                                  </>
                                )}
                                <button
                                  className="info-btn"
                                  onClick={() => handleInfoClick(item)}
                                >
                                  <img src={info} alt="Info" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="section-container">
                  <h2>Equipment Requests</h2>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Sender Email</th>
                          <th>Equipment Name</th>
                          <th>Company</th>
                          <th>Days Required</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiver_equipment_data
                          ?.filter(
                            (item) =>
                              equipmentFilter === "all" ||
                              item.event_status === equipmentFilter
                          )
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{item.id}</td>
                              <td>{item.sender_email}</td>
                              <td>{item.equipment_name}</td>
                              <td>{item.equipment_company}</td>
                              <td>{item.days_required}</td>
                              <td>{item.location}</td>
                              <td
                                className={`status ${item.event_status.toLowerCase()}`}
                              >
                                <span>{item.event_status}</span>
                              </td>
                              <td className="action-buttons">
                                {item.event_status.toLowerCase() ===
                                  "pending" && (
                                  <>
                                    <button
                                      className="approve-btn"
                                      onClick={() => {
                                        set_data(item);
                                      }}
                                    >
                                      <img src={accept} alt="Accept" />
                                    </button>
                                    <button
                                      className="reject-btn"
                                      onClick={() => handleRejectClick(item)}
                                    >
                                      <img src={reject} alt="Reject" />
                                    </button>
                                  </>
                                )}
                                <button
                                  className="info-btn"
                                  onClick={() => handleInfoClick(item)}
                                >
                                  <img src={info} alt="Info" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {selectedCategory === "packages" && (
              <div className="section-container">
                <h2>Package Requests</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sender Email</th>
                        <th>Package Name</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiver_package_data?.filter(
                          (item) =>
                            packageFilter === "all" ||
                            item.event_status === packageFilter
                        )
                        .map((item, index) => (
                          <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.sender_email}</td>
                            <td>{item.package_name}</td>
                            <td>₹{item.price}</td>
                            <td>{item.location}</td>
                            <td
                              className={`status ${item.event_status.toLowerCase()}`}
                            >
                              <span>{item.event_status}</span>
                            </td>
                            <td className="action-buttons">
                              {item.event_status.toLowerCase() ===
                                "pending" && (
                                <>
                                  <button
                                    className="approve-btn"
                                    onClick={() => {
                                      set_data(item);
                                    }}
                                  >
                                    <img src={accept} alt="Accept" />
                                  </button>
                                  <button
                                    className="reject-btn"
                                    onClick={() => handleRejectClick(item)}
                                  >
                                    <img src={reject} alt="Reject" />
                                  </button>
                                </>
                              )}
                              <button
                                className="info-btn"
                                onClick={() => handleInfoClick(item)}
                              >
                                <img src={info} alt="Info" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedCategory === "equipment" && (
              <div className="section-container">
                <h2>Equipment Requests</h2>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sender Email</th>
                        <th>Equipment Name</th>
                        <th>Company</th>
                        <th>Days Required</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiver_equipment_data
                        ?.filter(
                          (item) =>
                            equipmentFilter === "all" ||
                            item.event_status === equipmentFilter
                        )
                        .map((item, index) => (
                          <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.sender_email}</td>
                            <td>{item.equipment_name}</td>
                            <td>{item.equipment_company}</td>
                            <td>{item.days_required}</td>
                            <td>{item.location}</td>
                            <td
                              className={`status ${item.event_status.toLowerCase()}`}
                            >
                              <span>{item.event_status}</span>
                            </td>
                            <td className="action-buttons">
                              {item.event_status.toLowerCase() ===
                                "pending" && (
                                <>
                                  <button
                                    className="approve-btn"
                                    onClick={() => {
                                      set_data(item);
                                    }}
                                  >
                                    <img src={accept} alt="Accept" />
                                  </button>
                                  <button
                                    className="reject-btn"
                                    onClick={() => handleRejectClick(item)}
                                  >
                                    <img src={reject} alt="Reject" />
                                  </button>
                                </>
                              )}
                              <button
                                className="info-btn"
                                onClick={() => handleInfoClick(item)}
                              >
                                <img src={info} alt="Info" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
