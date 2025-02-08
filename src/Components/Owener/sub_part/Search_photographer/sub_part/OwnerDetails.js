import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./OwnerDetails.css";
import NoDataForEquipment from "./NoDataForEquipment.png";
import { Server_url } from "../../../../../redux/AllData";
import { IoArrowBack } from "react-icons/io5";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import SeletedCard from "./SeletedCard";
import { MdOutlineInsertLink, MdOutlineDesignServices } from "react-icons/md";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { isWithinInterval, parseISO } from 'date-fns';

import camera_icon from './test_img_equipment/camera.png'
import drone_icon from './test_img_equipment/drone.png'
import tripod_icon from './test_img_equipment/Tripod.png'
import lens_icon from './test_img_equipment/lens.png'



const OwnerDetails = () => {
  const equipmentTypes = [
    { type: "Camera", icon: camera_icon },
    { type: "Drone", icon: drone_icon },
    { type: "Tripod", icon: tripod_icon },
    { type: "Lens", icon: lens_icon },
  ];


  const [packagesMoreThan4, setpackagesMoreThan4] = useState(false);
  const [equipmentMoreThan4, setEquipmentMoreThan4] = useState(false);

  const [showSelectedCard, setShowSelectedCard] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [value] = useState(new Date());

  const [events, setEvents] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const set_is_full_screen = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        is_full_screen: value,
      },
    });
  };
  const ownerData = location.state?.ownerData;
  const selectedOwner = location.state?.selectedOwner;

  const set_owner_full_screen = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        isOwnerFullScreen: value,
      },
    });
  };
  // const events = [

  // ];


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${Server_url}/calendar/events_by_user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_email: selectedOwner.user_email }),
        });

        const data = await response.json();

        if (response.ok) {
          // setEvents(data);
          const formated_data = data?.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          setEvents(formated_data);
          console.log(formated_data);

        } else {
          console.log(data.error || 'An error occurred while fetching events');
        }
      } catch (err) {
        console.log('Failed to fetch events: ' + err.message);
      }
    };

    if (selectedOwner.user_email) {
      fetchEvents();
    }
  }, [selectedOwner.user_email]);


  const getTileClassName = ({ date }) => {
    const event = events.find(event =>
      isWithinInterval(date, {
        start: event.start instanceof Date ? event.start : parseISO(event.start),
        end: event.end instanceof Date ? event.end : parseISO(event.end)
      })
    );
    return event ? `has-event event-${event?.title?.toLowerCase()?.replace(/\s+/g, '-')}` : '';
  };

  const getTileStyle = ({ date }) => {
    const event = events.find(event =>
      isWithinInterval(date, {
        start: event.start instanceof Date ? event.start : parseISO(event.start),
        end: event.end instanceof Date ? event.end : parseISO(event.end)
      })
    );
    return event ? {
      backgroundColor: event.color,
      color: '#000000',
      fontWeight: 'bold'
    } : null;
  };

  useEffect(() => {
    console.log('showSelectedCard:', showSelectedCard);
    console.log('selectedData:', selectedData);
  }, [showSelectedCard, selectedData]);




  useEffect(() => {
    // console.log(
    //   "Data in owner details owner data.........................",
    //   ownerData
    // );
    // console.log(
    //   "Data in owner details selected owner.........................",
    //   selectedOwner
    // );

    if (ownerData?.packages?.length > 4) {
      setpackagesMoreThan4(true);
    } else {
      setpackagesMoreThan4(false);
    }
    if (ownerData?.equipment?.length > 4) {
      setEquipmentMoreThan4(true);
    } else {
      setEquipmentMoreThan4(false);
    }
  }, [ownerData.packages, ownerData.equipment]);

  const fetchPackagesData = async () => {
    const email = selectedOwner?.user_email;
    if (!email) return;

    try {
      const response = await fetch(`${Server_url}/api/packages/${email}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchEquipmentData = async () => {
    const email = selectedOwner?.user_email;
    if (!email) return;

    try {
      const response = await fetch(`${Server_url}/api/equipment/${email}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };
  const handleShowAllClick = async (type) => {
    const email = selectedOwner?.user_email;

    if (email) {
      let fetchedData;

      if (type === "packages") {
        fetchedData = await fetchPackagesData();
      } else if (type === "equipments") {
        fetchedData = await fetchEquipmentData();
      }

      navigate(`/Owner/search_photographer/${email}/${type}`, {
        state: { data: fetchedData, dataType: type },
      });
    }
  };

  useEffect(() => {
    const handleBackEvent = (event) => {
      dispatch({
        type: "SET_USER_Owner",
        payload: {
          is_full_screen: true,
        },
      });

      dispatch({
        type: "SET_USER_Owner",
        payload: {
          isOwnerFullScreen: false,
        },
      });
      navigate(`/Owner/search_photographer`);
    };

    window.addEventListener("popstate", handleBackEvent);

    return () => {
      window.removeEventListener("popstate", handleBackEvent);
    };
  }, [navigate, dispatch]);

  const handleItemClick = (item, type) => {
    setSelectedData(item);
    setSelectedType(type);
    setShowSelectedCard(true);
  };

  if (!ownerData || !selectedOwner) {
    return <p>Loading owner details...</p>;
  }

  const lightenColor = (color, percent) => {
    let num = parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      r = (num >> 16) + amt,
      g = ((num >> 8) & 0x00ff) + amt,
      b = (num & 0x0000ff) + amt;

    return `#${(
      0x1000000 +
      (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 1 ? 0 : b) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };


  return (
    <div className="owner-details-container">
      <div className="owner-info-details">
        <div className="owner-header">
          <button
            className="back-button"
            onClick={() => {
              set_owner_full_screen(false);
              navigate(`/Owner/search_photographer`);
              set_is_full_screen(true);
            }}
          >
            <IoArrowBack className="icon" /> Back
          </button>
          <h2 className="owner-title">
            Owner Details for {selectedOwner.user_name}
          </h2>
        </div>

        <div className="owner-profile-container">
          <div className="owner-profile-left">
            <div className="owner_details_img_container">
              <img
                src={
                  selectedOwner?.user_profile_image_base64 || "/default-user.jpg"
                }
                alt="Owner"
                className="owner-profile-img"
              />
            </div>
            <div className="owner-status">
              <span className="status-badge">Active</span>
              <span className="rating">
                <FaStar className="icon star" />
                4.8/5.0
              </span>
            </div>
          </div>

          <div className="owner-profile-right">
            <div className="info-card">
              <div className="info-item">
                <div className="icon-container">
                  <FaUser className="icon" />
                </div>
                <div>
                  <label>Name</label>
                  <p>{selectedOwner?.user_name || "Not Available"}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-container">
                  <FaEnvelope className="icon" />
                </div>
                <div>
                  <label>Email</label>
                  <p>{selectedOwner?.user_email}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-container">
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div>
                  <label>Business Address</label>
                  <p>{selectedOwner.business_address || "Not Available"}</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-item">
                <div className="icon-container">
                  <MdOutlineInsertLink className="icon" />
                </div>
                <div>
                  <label>Website</label>
                  <p>{selectedOwner?.website || "Not Available"}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon-container">
                  <MdOutlineDesignServices className="icon" />
                </div>
                <div>
                  <label>Services</label>
                  {selectedOwner?.services ? (
                    selectedOwner.services.map((service, index) => (
                      <p className="service-item" key={index}>{service}</p>
                    ))
                  ) : (
                    <p>No services available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="info-card">
              <div className="calendar-wrapper">
                <div className="calendar-title">
                  <label>Availability - {value.toLocaleString('default', { month: 'long' })}</label>
                </div>
                <Calendar
                  value={value}
                  tileClassName={getTileClassName}
                  tileStyle={getTileStyle}
                  formatShortWeekday={(locale, date) =>
                    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][date.getDay()]
                  }
                  className="modern-calendar"
                  minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                  maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)}
                  showNavigation={false}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="section photo_section">
        {ownerData.photo_files?.length > 0 ? (
          <div className="photos-container" style={{ flexDirection: "column" }}>
            <div className="profile_preview_photos_title">
              <div className="photos-card-title">Photos</div>
              {packagesMoreThan4 && (
                <button onClick={() => { }}>
                  Show All
                </button>
              )}
            </div>
            <div className="profile_preview_images">
              {ownerData.photo_files.map((photo, index) => (
                <img
                  key={index}
                  src={photo.photo}
                  alt="Owner Work"
                  className="photo-thumbnail"
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no_equipments">
            <img src={NoDataForEquipment} alt="" />
            <p className="no-data">NO PHOTOS AVAILABLE</p>
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="section equipment_section">
        {ownerData.equipment?.length > 0 ? (
          <ul className="equipment-list" >
            <div className="profile_preview_equipment_title">
              <div className="equipment-card-title">Equipment</div>

              {equipmentMoreThan4 && (
                <button onClick={() => handleShowAllClick("equipments")}>
                  Show All
                </button>
              )}
            </div>
            <div className="equipment_items_container" >
              {ownerData.equipment.slice(0, 4).map((item, index) => (
                <li
                  key={index}
                  className="equipment_item"
                  onClick={() => handleItemClick(item, 'equipment')}
                  style={{ cursor: 'pointer'}}
                >
                  <div className="photo_container_for_equipment">
                    <img src={equipmentTypes.find(type => type.type === item.equipment_type)?.icon} alt="Equipment" />
                    <p>
                      <strong>Name:</strong> {item.name || "Not Available"}
                    </p>
                  </div>
                  <div className="other_details_for_equipment">
                    <p>
                      <strong>Company:</strong>{" "}
                      {item.equipment_company || "Not Available"}
                    </p>
                    <p>
                    <strong>Type:</strong>{" "}
                    {item.equipment_type || "Not Available"}
                  </p>
                  </div>

                  
                  
                  
                  <p>
                    <strong>Price per Day:</strong> $
                    {item.equipment_price_per_day || "Not Available"}
                  </p>
                </li>
              ))}
            </div>


          </ul>
        ) : (
          <div className="no_equipments">
            <img src={NoDataForEquipment} alt="" />
            <p className="no-data">NO EQUIPMENTS AVAILABLE</p>
          </div>
        )}
      </div>

      {/* Packages Section */}
      <div className="section packages_section">
        <div className="profile_preview_packages_title">
          <div className="packages-card-title">Packages</div>
          {packagesMoreThan4 && (
            <button onClick={() => handleShowAllClick("packages")}>
              Show All
            </button>
          )}

        </div>
        <div className="packages-grid">

          {ownerData.packages?.length > 0 ? (
            ownerData.packages.slice(0, 4).map((pkg, index) => (
              <div
                key={pkg.id || index}
                className="package-card"
                style={{ backgroundColor: "#ffffff", cursor: "pointer" }}
                onClick={() => handleItemClick(pkg, "package")}
              >
                <div className="package_title">
                  <div
                    className="first_container"
                    style={{
                      backgroundColor: pkg.card_color || "#6fa8dc",
                      color: "#fff",
                    }}
                  ></div>
                  <div
                    className="second_container"
                    style={{
                      backgroundColor: pkg.card_color || "#6fa8dc",
                      color: "#fff",
                    }}
                  >
                    <div className="package_name">{pkg.package_name || "Not Available"}</div>
                    <div className="package_price">₹{pkg.price || "Not Available"}</div>
                  </div>
                  <div
                    className="third_container"
                    style={{
                      backgroundColor: pkg.card_color || "#6fa8dc",
                      color: "#fff",
                    }}
                  ></div>
                </div>

                <div className="package_all_details">
                  <div className="package_Services">
                    {Array.isArray(pkg.service) && pkg.service.length > 0 ? (
                      pkg.service.map((srv, idx) => {
                        const baseColor = pkg.card_color || "#6fa8dc";
                        const lightColor = lightenColor(baseColor, 20);

                        return (
                          <div
                            key={idx}
                            className="service-item"
                            style={{
                              backgroundColor: idx % 2 === 0 ? lightColor : "#ffffff",
                              width: "100%",
                              padding: "8px 10px",
                            }}
                          >
                            {srv?.charAt(0)?.toUpperCase() + srv?.slice(1)?.toLowerCase()}
                          </div>
                        );
                      })
                    ) : (
                      <span>No services available</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no_equipments">
              <img src={NoDataForEquipment} alt="" />
              <p className="no-data">NO PACKAGES AVAILABLE</p>
            </div>
          )}
        </div>
      </div>



      {showSelectedCard && selectedData && (
        <SeletedCard
          type={selectedType}
          onClose={() => {
            setShowSelectedCard(false);
            setSelectedData(null);
            setSelectedType(null);
          }}
          selectedOwner={selectedOwner}
          selectedData={selectedData}
        />
      )}

    </div>
  );
};

export default OwnerDetails;
