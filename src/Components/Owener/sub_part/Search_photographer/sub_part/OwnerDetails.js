import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./OwnerDetails.css";
import NoDataForEquipment from "./NoDataForEquipment.png";
import { Server_url } from "../../../../../redux/AllData";
import { IoArrowBack } from "react-icons/io5";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import SeletedCard from "./SeletedCard";
import { MdOutlineInsertLink, MdOutlineDesignServices } from "react-icons/md";

import "react-calendar/dist/Calendar.css";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaPinterest,
  FaGlobe,
} from "react-icons/fa";

import camera_icon from "./test_img_equipment/camera.png";
import drone_icon from "./test_img_equipment/drone.png";
import tripod_icon from "./test_img_equipment/Tripod.png";
import lens_icon from "./test_img_equipment/lens.png";
import { FaAngleDoubleDown } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudDownloadAlt } from "react-icons/fa";

const OwnerDetails = () => {
  const equipmentTypes = [
    { type: "Camera", icon: camera_icon },
    { type: "Drone", icon: drone_icon },
    { type: "Tripod", icon: tripod_icon },
    { type: "Lens", icon: lens_icon },
  ];

  function get_img_by_name(name) {
    if (!name) return camera_icon;
    const equipment = equipmentTypes.find(
      (equipment) => equipment.type.toLowerCase() === name.toLowerCase()
    );

    return equipment ? equipment.icon : camera_icon; // Default to Camera icon if no match
  }

  const [packagesMoreThan4, setpackagesMoreThan4] = useState(false);
  const [equipmentMoreThan4, setEquipmentMoreThan4] = useState(false);
  const [servicesMoreThan4, setServicesMoreThan4] = useState(false);

  const [showSelectedCard, setShowSelectedCard] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [is_first, set_is_true] = useState(true);

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

  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [fullViewImage, setFullViewImage] = useState("");

  useEffect(() => {
    if(fullViewImage){
      document.body.style.overflow = "hidden";
    }else{
      document.body.style.overflow = "auto";
    }
  }, [fullViewImage]);

  const handleDownload = () => {
    if (fullViewImage) {
      const link = document.createElement("a");
      link.href = fullViewImage;
      link.download = fullViewImage.split("/").pop(); // This will set the filename to the image's name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchFolderData = async (user_email) => {
      try {
        const response = await fetch(
          `${Server_url}/owner_drive/get_folder_preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user_email }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTimeout(() => {
          if (data.success) {
            setFolders(data.data);
            setActiveFolder(data.data[0]);
            setPhotos(data.data[0]?.photo_list || []);
            set_is_true(true);
          } else {
            setFolders([]);
            setPhotos([]);
          }
        }, 100);
      } catch (error) {
        console.error("Error fetching folder data:", error.message);
      }
    };

    fetchFolderData(selectedOwner.user_email);
  }, [selectedOwner.user_email]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [photos]);

  const handleTabSwitch = (folder, index) => {
    setActiveFolder(folder);
    setLoading(true);
    if (index === 0) {
      setPhotos(folder.photo_list);
      set_is_true(true);
      setLoading(false);
    } else {
      set_is_true(false);
      handleFolderPhotoFetch(folder.folder_id);
    }
  };

  const handleFolderPhotoFetch = async (folder_id) => {
    try {
      const response = await fetch(
        `${Server_url}/owner_drive/get_folder_photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id }),
        }
      );

      const data = await response.json();
      setTimeout(() => {
        setPhotos(data.photos && Array.isArray(data.photos) ? data.photos : []);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Error fetching folder photos:", error);
      setLoading(false);
    }
  };

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


  useEffect(() => {
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
    if (ownerData?.services?.length > 4) {
      setServicesMoreThan4(true);
    } else {
      setServicesMoreThan4(false);
    }
  }, [ownerData.packages, ownerData.equipment, ownerData.services]);

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
        navigate(`/Owner/search_photographer/${email}/${type}`, {
          state: { data: fetchedData, dataType: type },
        });
      } else if (type === "equipments") {
        fetchedData = await fetchEquipmentData();
        navigate(`/Owner/search_photographer/${email}/${type}`, {
          state: { data: fetchedData, dataType: type },
        });
      } else if (type === "all_photos") {
        navigate(`/Owner/search_photographer/${email}/${type}`);
      }
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

  const getSocialIcon = (link) => {
    if (link.includes("instagram"))
      return {
        icon: <FaInstagram className="social-icon instagram" />,
        label: "Instagram",
      };
    if (link.includes("facebook"))
      return {
        icon: <FaFacebook className="social-icon facebook" />,
        label: "Facebook",
      };
    if (link.includes("youtube"))
      return {
        icon: <FaYoutube className="social-icon youtube" />,
        label: "YouTube",
      };
    if (link.includes("pinterest"))
      return {
        icon: <FaPinterest className="social-icon pinterest" />,
        label: "Pinterest",
      };

    try {
      const domain = new URL(link).hostname.replace("www.", "");
      const label = domain.charAt(0).toUpperCase() + domain.slice(1);
      return {
        icon: <FaGlobe className="social-icon default" />,
        label: label || "Website",
      };
    } catch (error) {
      return {
        icon: <FaGlobe className="social-icon default" />,
        label: "Website", // Fallback in case URL parsing fails
      };
    }
  };

  return (
    <div className="owner-details-container">
      <nav className="back_with_owner_title">
        <button
          className="back-button"
          onClick={() => {
            set_owner_full_screen(false);
            navigate(`/Owner/search_photographer`);
            set_is_full_screen(true);
          }}
        >
          <IoArrowBack className="icon" />
        </button>
        <div className="owner-header">
          <h2 className="owner-title">
            Owner Details for {selectedOwner.user_name}
          </h2>
        </div>
      </nav>
      <div className="owner-info-details">
        <div className="owner-profile-container">
          <div className="owner-profile-left">
            <div className="owner_details_img_container">
              <img
                src={
                  selectedOwner?.user_profile_image_base64 ||
                  "/default-user.jpg"
                }
                alt="Owner"
                className="owner-profile-img"
              />
            </div>
            <div className="owner-status">
              <p>{selectedOwner?.user_name || "Not Available"}</p>
              <div className="all_links">
                {selectedOwner?.social_media_links?.length > 0 ? (
                  selectedOwner.social_media_links.map((link, index) => {
                    const { icon, label } = getSocialIcon(link);
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        title={label}
                      >
                        {icon}
                      </a>
                    );
                  })
                ) : (
                  <p>Not Available</p>
                )}
              </div>

            </div>
          </div>

          <div className="owner-profile-right">
            <div className="info-card">
              <div className="email_business_website">
                <div className="details_1">
                  <div className="info-card">
                    <div className="info-item">
                      <div className="icon-container">
                        <FaEnvelope className="icon" />
                      </div>
                      <div>
                        <label>Email</label>
                        <p>{selectedOwner?.user_email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-item">
                      <div className="icon-container">
                        <FaMapMarkerAlt className="icon" />
                      </div>
                      <div>
                        <label>Business Address</label>
                        <p>
                          {selectedOwner.business_address || "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="details_2">
                  <div className="info-card">
                    <div className="info-item">
                      <div className="icon-container">
                        <MdOutlineInsertLink className="icon" />
                      </div>
                      <div>
                        <label>Business Name</label>
                        <p>{selectedOwner?.business_name || "Not Available"}</p>
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
                  </div>
                </div>
              </div>
              <div className="services_in_profile">
                <div className="info-item">
                  <div
                    className="icon-container"
                    style={{ marginLeft: "20px" }}
                  >
                    <MdOutlineDesignServices className="icon" />
                  </div>
                  <div className="service-list">
                    {/* <label>Services</label> */}
                    {selectedOwner?.services ? (
                      selectedOwner.services.map((service, index) => (
                        <p className="service-item" key={index}>
                          {service}
                        </p>
                      ))
                    ) : (
                      <p>No services available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      <div
        className={`section photo_section ${
          ownerData.photo_files?.length > 3 ? "apply-gradient" : ""
        }`}
      >
        <div
          className={`see_more_text ${
            ownerData.photo_files?.length > 3 ? "show" : ""
          }`}
          onClick={() => {
            handleShowAllClick("all_photos");
          }}
        >
          <FaAngleDoubleDown />
          See More
        </div>
        {ownerData.photo_files?.length > 0 ? (
          <div className="photos-container">
            <div className="profile_preview_photos_title">
              <div className="photos-card-title">Photos</div>
              <div className="tabs">
                {folders &&
                  folders?.slice(0, 5).map((folder, index) => (
                    <h3
                      key={index}
                      className={`folder_tab ${
                        activeFolder?.folder_name === folder.folder_name
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleTabSwitch(folder, index)}
                    >
                      {folder.folder_name}
                    </h3>
                  ))}
              </div>

            </div>

            <div className="profile_preview_images">
              {loading || isLoading ? (
                <div className="photo_container">
                  <div className="photos_grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div key={n} className="photo_card">
                        <div className="skeleton-photo-card"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="photo_container">
                  {photos.length === 0 ? (
                    <p style={{ textAlign: "center" }}>No photos found.</p>
                  ) : (
                    <div className="photos_grid">
                    {photos.slice(0, 10).map((photoItem, index) => (
                      <div key={index} className="photo_card">
                        <img
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const imageSrc = is_first
                              ? photoItem.photo
                              : photoItem.file_data;
                            setFullViewImage(imageSrc);
                            console.log("This is full view", fullViewImage);
                          }}
                          src={
                            is_first ? photoItem.photo : photoItem.file_data
                          }
                          alt={photoItem.photo_name}
                          className="photo_image"
                        />
                        {is_first ? (
                          photoItem.photo_name && (
                            <div className="photo_name">
                              {photoItem.photo_name}
                            </div>
                          )
                        ) : (
                          <div className="photo_name">
                            {photoItem.file_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}
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
          <ul className="equipment-list">
            <div className="profile_preview_equipment_title">
              <div className="equipment-card-title">Equipment</div>

              {equipmentMoreThan4 && (
                <button onClick={() => handleShowAllClick("equipments")}>
                  Show All
                </button>
              )}
            </div>
            <div className="equipment_items_container">
              {ownerData.equipment.slice(0, 3).map((item, index) => (
                <li
                  key={index}
                  className="equipment_item"
                  onClick={() => handleItemClick(item, "equipment")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="photo_container_for_equipment">
                    <img
                      src={get_img_by_name(item.equipment_type)}
                      alt={item.equipment_type}
                    />
                    <p>{item.name || "Not Available"}</p>
                  </div>
                  <div className="other_details_for_equipment">
                    <div>{item.equipment_company || "Not Available"}</div>
                    <div>• {item.equipment_type || "Not Available"}</div>
                  </div>

                  <div className="equipment_price_container">
                    <p>
                      Rs. {item.equipment_price_per_day || "Not Available"} /Day
                    </p>
                  </div>
                  <div className="equipment_description">
                    <strong>Details:</strong>
                    <p>{item.equipment_description || "Not Available"}</p>
                  </div>
                  <button
                    className="book-equipment-button"
                    onClick={() => () => handleItemClick(item, "equipment")}
                  >
                    Book Equipment
                  </button>
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

      {/* Services Section  */}
      <div className="section services_section">
        {ownerData.services?.length > 0 ? (
          <ul className="services-list">
            <div className="profile_preview_services_title">
              <div className="services-card-title">Services</div>
              {servicesMoreThan4 && (
                <button onClick={() => handleShowAllClick("services")}>
                  Show All
                </button>
              )}
            </div>
            <div className="services_items_container">
              {ownerData.services.slice(0, 3).map((item, index) => (
                <li
                  key={index}
                  className="service_item"
                  onClick={() => handleItemClick(item, "services")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="container_for_services_name">
                    <p>{item.service_name || "Not Available"}</p>
                  </div>

                  <div className="services_price_container">
                    <p>Rs. {item.price_per_day || "Not Available"} /Day</p>
                  </div>
                  <div className="services_description">
                    <strong>Details:</strong>
                    <p>{item.description || "Not Available"}</p>
                  </div>

                </li>
              ))}
            </div>
          </ul>
        ) : (
          <div className="no_services">
            <p className="no-data">NO SERVICES AVAILABLE</p>
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
            ownerData.packages.slice(0, 3).map((pkg, index) => (
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
                    <div className="package_name">
                      {pkg.package_name || "Not Available"}
                    </div>
                    <div className="package_price">
                      ₹{pkg.price || "Not Available"}
                    </div>
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
                              backgroundColor:
                                idx % 2 === 0 ? lightColor : "#ffffff",
                              width: "100%",
                              padding: "8px 10px",
                            }}
                          >
                            {srv?.charAt(0)?.toUpperCase() +
                              srv?.slice(1)?.toLowerCase()}
                          </div>
                        );
                      })
                    ) : (
                      <span>No services available</span>
                    )}
                  </div>
                </div>
                <div
                  className="book-package-button"
                  onClick={() => handleItemClick(pkg, "package")}
                >
                  Book Package
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

      {/* Loading Animation */}
      {isLoading && (
        <div className="loading-container">
          <div className="skeleton-loader"></div>
        </div>
      )}

      {/* OR for the dots loader: */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}



{fullViewImage && (
        <div className="full_view_image_container">
          <img
            src={fullViewImage}
            className="full_view_image"
            alt="Full view"
          />
          <div className="button_container">
            <button className="download_button" onClick={handleDownload}>
              <FaCloudDownloadAlt
                className="close_logo"
                style={{ fontSize: "18px" }}
              />
              Download
            </button>
            <button
              className="close_button"
              onClick={() => setFullViewImage("")}
            >
              <IoCloseSharp
                className="download_logo"
                style={{ fontSize: "18px" }}
              />
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDetails;
