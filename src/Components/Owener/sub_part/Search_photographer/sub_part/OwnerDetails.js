import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./OwnerDetails.css";
import NoDataForEquipment from "./NoDataForEquipment.png";
import { Server_url } from "../../../../../redux/AllData";

const OwnerDetails = () => {
  const [packagesMoreThan4, setpackagesMoreThan4] = useState(false);
  const [equipmentMoreThan4, setEquipmentMoreThan4] = useState(false);

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
  const set_owner_full_screen = (value) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        isOwnerFullScreen: value,
      },
    });
  };

  const ownerData = location.state?.ownerData;
  const selectedOwner = location.state?.selectedOwner;
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

  if (!ownerData || !selectedOwner) {
    return <p>Loading owner details...</p>;
  }

  return (
    <div className="owner-details-container">
      <div className="owner-info-details">
        <button
          className="back-button"
          onClick={() => {
            set_owner_full_screen(false);
            navigate(`/Owner/search_photographer`);
            set_is_full_screen(true);
          }}
        >
          Back
        </button>
        <h2 className="owner-title">
          Owner Details for {selectedOwner.user_name}
        </h2>
        <div className="owner_details_img_container">
          <img
            src={
              selectedOwner?.user_profile_image_base64 || "/default-user.jpg"
            }
            alt="Owner"
            className="owner-profile-img"
          />
        </div>

        <p>
          <strong>Name:</strong> {selectedOwner?.user_name || "Not Available"}
        </p>
        <p>
          <strong>Email:</strong> {selectedOwner?.user_email}
        </p>
        <p>
          <strong>Business Address:</strong>{" "}
          {selectedOwner.business_address || "Not Available"}
        </p>
      </div>

      {/* Equipment Section */}
      <div className="section equipment_section">
        {ownerData.equipment?.length > 0 ? (
          <ul className="equipment-list">
            <div className="profile_preview_equipment_title">
              <h3>Equipment</h3>
            </div>
            <div className="equipment_items_container">
              {ownerData.equipment.slice(0, 4).map((item, index) => (
                <li key={index} className="equipment_item">
                  <p>
                    <strong>Name:</strong> {item.name || "Not Available"}
                  </p>
                  <p>
                    <strong>Company:</strong>{" "}
                    {item.equipment_company || "Not Available"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {item.equipment_type || "Not Available"}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {item.equipment_description || "Not Available"}
                  </p>
                  <p>
                    <strong>Price per Day:</strong> $
                    {item.equipment_price_per_day || "Not Available"}
                  </p>
                </li>
              ))}
            </div>

            {equipmentMoreThan4 && (
              <button onClick={() => handleShowAllClick("equipments")}>
                show all
              </button>
            )}
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
        {ownerData.packages?.length > 0 ? (
          <ul className="packages-list">
            <div className="profile_preview_packages_title">
              <h3>Packages</h3>
            </div>
            <div className="package_items_container">
              {ownerData.packages.slice(0, 4).map((pkg, index) => (
                <li
                  key={pkg.id || index}
                  className="package_item"
                  style={{ backgroundColor: pkg.card_color || "#f0f0f0" }}
                >
                  <p>
                    <strong>Package Name:</strong>{" "}
                    {pkg.package_name || "Not Available"}
                  </p>
                  <p>
                    <strong>Service:</strong> {pkg.service || "Not Available"}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {pkg.description || "Not Available"}
                  </p>
                  <p>
                    <strong>Price:</strong> ${pkg.price || "Not Available"}
                  </p>
                  <p>
                    <strong>User Email:</strong>{" "}
                    {pkg.user_email || "Not Available"}
                  </p>
                </li>
              ))}
            </div>
            {packagesMoreThan4 && (
              <button onClick={() => handleShowAllClick("packages")}>
                show all
              </button>
            )}
          </ul>
        ) : (
          <div className="no_equipments">
            <img src={NoDataForEquipment} alt="" />
            <p className="no-data">NO PACKAGES AVAILABLE</p>
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="section photo_section">
        {ownerData.photo_files?.length > 0 ? (
          <div className="photos-container" style={{ flexDirection: "column" }}>
            <div className="profile_preview_photos_title">
              <h3>Photos</h3>
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
    </div>
  );
};

export default OwnerDetails;
