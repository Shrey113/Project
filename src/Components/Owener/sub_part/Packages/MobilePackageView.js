import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
// const lightenColor = (color, percent) => {
//   const num = parseInt(color.replace("#", ""), 16),
//     amt = Math.round(2.55 * percent),
//     R = (num >> 16) + amt,
//     G = ((num >> 8) & 0x00ff) + amt,
//     B = (num & 0x0000ff) + amt;
//   return (
//     "#" +
//     (
//       0x1000000 +
//       (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
//       (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
//       (B < 255 ? (B < 1 ? 0 : B) : 255)
//     )
//       .toString(16)
//       .slice(1)
//   );
// };

const MobilePackageView = ({ selectedPackage, onClose, onUpdatePackage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPackage, setEditedPackage] = useState({ ...selectedPackage });

  const delete_service_by_id = (serviceIndex) => {
    setEditedPackage((prevPackage) => ({
      ...prevPackage,
      service: prevPackage.service.filter((_, idx) => idx !== serviceIndex), // Correctly filter the service array
    }));
  };
  const add_service = () => {
    setEditedPackage((prevPackage) => ({
      ...prevPackage,
      service: [...prevPackage.service, ""] // Add a new empty service
    }));
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      const success = await onUpdatePackage(editedPackage);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  // const handleInputChange = (field, value) => {
  //   setEditedPackage((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  const handleServiceEdit = (index, value) => {
    const updatedServices = [...editedPackage.service];
    updatedServices[index] = value;
    setEditedPackage((prev) => ({
      ...prev,
      service: updatedServices,
    }));
  };

  return (
    <div className="mobile_view_container" id="mobile_view_container"
    onClick={onClose}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>

      <div className="mobile-package-card" style={{
        backgroundColor: `#ffffff`, borderTop: `6px solid ${editedPackage.card_color || "#6fa8dc"}`, borderRight: "1px solid #919394",
        borderLeft: "1px solid #919394",
        borderBottom: "1px solid #919394"
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <div className="package_title">
          {/* <div
            className="first_container"
            style={{
              backgroundColor: editedPackage.card_color || "#6fa8dc",
              color: "#fff",
            }}
          ></div>
          <div
            className="second_container"
            style={{
              backgroundColor: editedPackage.card_color || "#6fa8dc",
              color: "#fff",
            }}
          >
            <div className="package_name">
              {isEditing ? (
                <input
                  type="text"
                  value={editedPackage.package_name}
                  onChange={(e) =>
                    handleInputChange("package_name", e.target.value)
                  }
                />
              ) : (
                editedPackage.package_name
              )}
            </div>
            <div className="package_price">
              {isEditing ? (
                <input
                  type="number"
                  value={editedPackage.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  style={{
                    width: "80px",
                    textAlign: "center",
                    backgroundColor: "transparent",
                    fontSize: "16px",
                    border: "1px solid black ",
                  }}
                />
              ) : (
                `₹${editedPackage.price}`
              )}
            </div>
          </div>
          <div
            className="third_container"
            style={{
              backgroundColor: editedPackage.card_color || "#6fa8dc",
              color: "#fff",
            }}
          ></div> */}
          <div className="package_name">{editedPackage.package_name || "Package Name"}</div>
        </div>

        <div className="package_pricing" style={{ color: editedPackage.card_color || "#6fa8dc" }}>
          <div className="rupee_symbol">₹</div>
          <div className="value">
            {editedPackage.price || "Price"}
          </div>
          <span>/Day</span>
        </div>

        <hr style={{ width: "96%", margin: "8px 0" }} />

        {/* <div className="package_all_details"> */}
        <div className="package_Services">
          {Array.isArray(editedPackage.service) &&
            editedPackage.service.map((srv, idx) => (
              <>
              <div
                key={idx}
                className="service-item"
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={srv}
                    onChange={(e) => handleServiceEdit(idx, e.target.value)}
                  />
                ) : (
                  srv.charAt(0).toUpperCase() + srv.slice(1).toLowerCase()
                )}
                {isEditing && idx >= 1 && (
                  <div className="delete_button" onClick={() => { delete_service_by_id(idx); }}>
                    <IoClose />
                  </div>
                )}
              </div>
              {isEditing && idx === editedPackage.service.length - 1 && editedPackage.service.length < 6 && (
                <div className="add_button" style={{ alignSelf: "center" }} onClick={add_service}>
                  Add More <IoAdd />
                </div>
              )}
              </>
            ))}
        </div>
        {/* </div> */}

        <div className="edit-actions">
          <button onClick={handleEditToggle}>
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePackageView;
