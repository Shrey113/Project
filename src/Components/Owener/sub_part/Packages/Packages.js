import React, { useState, useEffect } from "react";

import default_image from "./Images/default_image.png";
import "./sub_parts/DefaultPage.css";
import "./Packages_responsive.css";
// import "./Packages.css";
import "./packages_2.css";
import { useSelector } from "react-redux";
import MobilePackageView from "./MobilePackageView";
import { Server_url, showAcceptToast, showRejectToast, showWarningToast } from "./../../../../redux/AllData";
import { IoClose, IoAdd } from "react-icons/io5";
// import { FiEdit } from "react-icons/fi";
// import { MdDeleteOutline } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";


const Packages = () => {
  const user = useSelector((state) => state.user);
  const [formVisible, setFormVisible] = useState(false);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    package_name: "",
    service: [],
    description: "",
    price: "",
    card_color: "#ff6f61",
  });


  // const [isEditable, setIsEditable] = useState(false);
  const [mobile_view, setMobile_view] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPackageName, setSelectedPackageName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMobileView(window.innerWidth <= 768);
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [newService, setNewService] = useState("");

  const themeOptions = [
    {
      name: "Standard",
      headerBg: "#F4B400",
      cardBg: "#FFF8E1",
      textColor: "#000000",
      buttonBg: "#F4B400",
      buttonText: "#FFFFFF",
    },
    {
      name: "Professional",
      headerBg: "#E91E63",
      cardBg: "#FCE4EC",
      textColor: "#000000",
      buttonBg: "#E91E63",
      buttonText: "#FFFFFF",
    },
    {
      name: "Business",
      headerBg: "#2196F3",
      cardBg: "#E3F2FD",
      textColor: "#000000",
      buttonBg: "#2196F3",
      buttonText: "#FFFFFF",
    },
  ];

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${Server_url}/api/fetch_packages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_email: user.user_email }),
        });
        if (response.ok) {
          const data = await response.json();
          setTimeout(() => {
            setPackages(data || []);
            setIsLoading(false);
          }, 100);
        } else {
          console.error("Failed to fetch packages");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [user.user_email]);

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "package_name" || name === "description" || name === "price") {
      if (name === "package_name") {
        let updatedValue = value.slice(0, 21);
        setFormData({ ...formData, [name]: updatedValue });
      }
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServiceChange = (e) => {
    setNewService(e.target.value);
  };

  const handleRemoveService = (index) => {
    const updatedServices = formData.service.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      service: updatedServices,
    });
  };

  const handleAddService = () => {
    if (formData.service.length < 6) {
      setFormData({
        ...formData,
        service: [...formData.service, newService],
      });
      setNewService("");
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${Server_url}/api/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, user_email: user.user_email }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          package_name: "",
          service: [],
          card_color: "#ff6f61",
          description: "",
          price: "",
          user_email: user.user_email,
        });
        setPackages([...packages, data.results]);
        setFormVisible(false);
        showAcceptToast({ message: data.message || "Package added successfully!" })
        console.log(data.results);
      } else {
        const errorData = await response.json();
        console.error("Error adding package:", errorData);
        showRejectToast({ message: errorData.error || "Failed to add package" })
      }
    } catch (err) {
      console.error("Error connecting to the server:", err);
      showRejectToast({ message: "Failed to add package" })
    }
  };

  const handleEditChange = (index, field, value) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      )
    );
  };

  const handleEditToggle = async (index) => {
    const selectedPackage = packages[index];

    // If already in edit mode and clicking save
    if (selectedPackage.isEditing) {
      // Validate package name
      if (!selectedPackage.package_name.trim()) {
        showWarningToast({ message: "Package name cannot be empty" })
        return;
      }

      // Check if any service is empty
      if (
        !Array.isArray(selectedPackage.service) ||
        selectedPackage.service.some((s) => !s.trim())
      ) {
        showWarningToast({ message: "Server input cannot be empty" })
        return;
      }

      let filteredServices = Array.isArray(selectedPackage.service)
        ? selectedPackage.service.filter((s) => s.trim() !== "")
        : [];

      const updatedPackageData = {
        id: selectedPackage.id,
        package_name: selectedPackage.package_name.trim(),
        service: JSON.stringify(filteredServices),
        description: selectedPackage.description,
        price: selectedPackage.price,
        card_color: selectedPackage.card_color,
        user_email: user.user_email,
      };

      try {
        const response = await fetch(`${Server_url}/api/update_package`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPackageData),
        });

        if (response.ok) {
          const data = await response.json();

          // Update local state with the saved data
          setPackages((prevPackages) =>
            prevPackages.map((pkg, i) =>
              i === index ? { ...pkg, isEditing: false } : pkg
            )
          );
          showAcceptToast({ message: data.message || "Package updated successfully! 2" })
        } else {
          const errorData = await response.json();
          showRejectToast({ message: errorData.error || "Failed to update package" })
        }
      } catch (err) {
        console.error("Error connecting to the server:", err);
        showRejectToast({ message: "Failed to update package" })
      }
    } else {
      // Entering edit mode
      setPackages((prevPackages) =>
        prevPackages.map((pkg, i) =>
          i === index ? { ...pkg, isEditing: true } : pkg
        )
      );
    }
  };

  const handleServiceEdit = (packageIndex, serviceIndex, value) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg, i) =>
        i === packageIndex
          ? {
            ...pkg,
            service: pkg.service.map((srv, idx) =>
              idx === serviceIndex ? value : srv
            ),
          }
          : pkg
      )
    );
  };

  const handleMobileViewToggle = (pkg) => {
    setMobile_view(true);
    setSelectedPackage(pkg);
  };

  const handleCloseMobileView = () => {
    setMobile_view(false);
    setSelectedPackage(null);
  };

  const handleMobilePackageUpdate = async (updatedPackage) => {
    // Validate package name
    if (!updatedPackage.package_name.trim()) {
      showWarningToast({ message: "Package name cannot be empty" })
      return false;
    }

    const updatedPackageData = {
      id: updatedPackage.id,
      package_name: updatedPackage.package_name.trim(),
      service: Array.isArray(updatedPackage.service)
        ? JSON.stringify(updatedPackage.service)
        : updatedPackage.service,
      description: updatedPackage.description,
      price: updatedPackage.price,
      card_color: updatedPackage.card_color,
      user_email: user.user_email,
    };

    try {
      const response = await fetch(`${Server_url}/api/update_package`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPackageData),
      });

      if (response.ok) {
        const data = await response.json();

        // Update the packages state with the new data
        setPackages((prevPackages) =>
          prevPackages.map((pkg) =>
            pkg.id === updatedPackage.id
              ? { ...updatedPackage, isEditing: false }
              : pkg
          )
        );
        showAcceptToast({ message: data.message || "Package updated successfully!" })
        return true;
      } else {
        const errorData = await response.json();
        showRejectToast({ message: errorData.error || "Failed to update package" })
        return false;
      }
    } catch (err) {
      console.error("Error connecting to the server:", err);
      showRejectToast({ message: "Failed to update package" })
      return false;
    }
  };

  const handleDeleteClick = (packageId, package_name) => {
    setSelectedPackage(packageId);
    setSelectedPackageName(package_name);
    setShowConfirm(true);
    // setIsEditable(false);
  };

  const add_service = (packageIndex) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg, i) =>
        i === packageIndex
          ? {
            ...pkg,
            service: [...pkg.service, ""],
          }
          : pkg
      )
    );
  };


  const delete_serveice_by_id = (packageIndex, serviceIndex) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg, i) =>
        i === packageIndex
          ? {
            ...pkg,
            service: pkg.service.filter((_, idx) => idx !== serviceIndex), // Filter out the service at the given index
          }
          : pkg
      )
    );
  };

  const confirmDelete = async () => {
    if (!selectedPackage) {
      console.log("no selected package");
      return;
    }

    try {
      const response = await fetch(
        `${Server_url}/api/packages/${selectedPackage}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPackages((prevPackages) =>
          prevPackages.filter((pkg) => pkg.id !== selectedPackage)
        );
        setShowConfirm(false);
      } else {
        showRejectToast({ message: data.message });
        console.error("Error deleting package:", data.message);
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const PackageCardSkeleton = () => (
    <div className="package-card skeleton">
      <div className="package_title">
        <div className="first_container skeleton-bg"></div>
        <div className="second_container skeleton-bg">
          <div className="package_name skeleton-text"></div>
          <div className="package_price skeleton-text"></div>
        </div>
        <div className="third_container skeleton-bg"></div>
      </div>
      <div className="package_all_details">
        <div className="package_Services">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="service-item skeleton-text"></div>
          ))}
        </div>
      </div>
      <div className="actions_button">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  // const darkenColor = (color, percent) => {
  //   let num = parseInt(color.slice(1), 16),
  //     amt = Math.round(2.55 * percent), // Increase darkening effect
  //     r = (num >> 16) - amt,
  //     g = ((num >> 8) & 0x00ff) - amt,
  //     b = (num & 0x0000ff) - amt;

  //   return `rgb(${Math.max(r, 0)}, ${Math.max(g, 0)}, ${Math.max(b, 0)})`;
  // };

  const cardColor = formData.card_color || "#6fa8dc";
  // const darkerTextColor = darkenColor(cardColor, 20);

  // const editForPackage = (index) => {
  //   setIsEditable((prevIndex) => (prevIndex === index ? null : index));
  // };

  return (
    <div className="owner-packages-container">

      {isLoading ? (
        <div className="package-cards-container">
          <div className="packages-header">
            <h1>Your Packages</h1>

          </div>
          <div className="packages-grid">
            {Array(3).fill(0).map((_, index) => (
              <PackageCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {packages.length === 0 && !formVisible && (
            <div className="default-page">
              <img src={default_image} alt="default" />
              <div className="text_content">
                <div className="text_content_header">
                  <h1>Manage Your Packages with Ease</h1>
                  <p>
                    Easily create, manage, and organize your packages. Add, remove,
                    or view package details seamlessly in just a few clicks.
                  </p>
                </div>
                <div className="text_content_body">
                  <h1>Get Started</h1>
                  <p>
                    Begin by clicking the button below to create your first package
                    and explore the features.
                  </p>
                </div>
                <div className="button_container">
                  <button onClick={() => handleFormToggle()}>
                    Add New Package
                  </button>
                </div>
              </div>
            </div>
          )}

          {packages.length > 0 && !formVisible && (
            <div className="package-cards-container">
              <div className="packages-header">
                <div className="tooltip-container" onClick={() => handleFormToggle()}>
                  <button
                    className="add-package-button"

                  >
                    Create New Package
                  </button>
                </div>
              </div>
              {!isMobileView ? (
                <div className="packages-grid">
                  {packages.map((pkg, index) => (
                    <div
                      key={index}
                      className="package-card"
                      style={{
                        backgroundColor: `#ffffff`, borderTop: `6px solid ${pkg.card_color || "#6fa8dc"}`, borderRight: "1px solid #919394",
                        borderLeft: "1px solid #919394",
                        borderBottom: "1px solid #919394"
                      }}
                    >
                      <div className="package_title">
                        <div className="package_name">{pkg.package_name || "Package Name"}</div>
                        {/* <FiEdit style={{ cursor: "pointer" }} onClick={() => editForPackage(index)} /> */}
                        <MdDeleteOutline onClick={() => handleDeleteClick(pkg.id, pkg.package_name)} style={{ cursor: "pointer" }} />
                      </div>

                      <div className="package_pricing" style={{ color: pkg.card_color || "#6fa8dc" }}>
                        <div className="rupee_symbol">₹</div>
                        <div className="value">
                          {pkg.price || "Price"}
                        </div>
                        <span>/Day</span>
                      </div>

                      <hr style={{ width: "96%", margin: "8px 0" }} />

                      <div className="package_Services">
                        {Array.isArray(pkg.service) && pkg.service.length > 0 ? (
                          pkg.service.map((srv, idx) => (
                            <>
                              <div key={idx} className="service_item"
                              >
                                {pkg.isEditing ? (
                                  <div className="services">
                                    <input

                                      type="text"
                                      value={srv}
                                      onChange={(e) =>
                                        handleServiceEdit(
                                          index,
                                          idx,
                                          e.target.value
                                        )
                                      }
                                    />
                                    {idx >= 1 && (
                                      <div className="delete_button" onClick={() => { delete_serveice_by_id(index, idx); }}>
                                        <IoClose />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="key" style={{ backgroundColor: pkg.card_color, color: "#fff" }}>{idx + 1}</div>
                                    <div className="individual_services" >
                                      {srv}
                                    </div>
                                  </>
                                )}
                              </div>
                              {pkg.isEditing && idx === pkg.service.length - 1 && pkg.service.length < 6 && (
                                <div className="add_button" style={{ alignSelf: "center" }} onClick={() => add_service(index)}>
                                  Add More <IoAdd />
                                </div>
                              )}
                            </>
                          ))
                        ) : (
                          <span>No services available</span>
                        )}
                      </div>
                      <button onClick={() => handleEditToggle(index)}>
                        <RiEditLine />
                        {pkg.isEditing ? "Save" : "Edit"}
                      </button>

                      {/* {isEditable === index &&
                        <div className="actions_button">
                          <button onClick={() => handleEditToggle(index)}>
                            <RiEditLine />
                            {pkg.isEditing ? "Save" : "Edit"}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(pkg.id, pkg.package_name)}
                          >
                            <MdDeleteOutline />
                            Delete
                          </button>
                        </div>
                      } */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="packages-grid-for-mobile">
                  {packages.map((pkg, index) => (
                    <div
                      key={index}
                      className="package-card"
                      style={{ backgroundColor: pkg.card_color || "#6fa8dc", borderTop: `6px solid ${formData.card_color || "#6fa8dc"}`, }}
                    >
                      <div className="package-card-header">
                        <h3 className="package-title">{pkg.package_name}</h3>
                        <div
                          className="package-card-i-button"
                          onClick={() => handleMobileViewToggle(pkg)}
                        >
                          i
                        </div>
                      </div>
                      <div className="package-card-body">
                        <div classpackages_sectionName="price-tag">
                          {pkg.isEditing ? (
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={(e) =>
                                handleEditChange(index, "price", e.target.value)
                              }
                              style={{
                                width: "80px",
                                padding: "5px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                              }}
                            />
                          ) : (
                            <>
                              <span className="currency">₹</span>
                              <span className="amount">{pkg.price}</span>
                              <span className="period">/Day</span>
                            </>
                          )}
                        </div>
                        <div className="description-container">
                          <p className="package-description">{pkg.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {showConfirm && (
                <div className="modal">
                  <div className="modal_content">
                    <h2>Confirm Delete</h2>
                    <p>Are you sure you want to delete <span style={{ backgroundColor: "lightgrey", padding: "2px 6px" }}>{selectedPackageName}</span> ?</p>

                    <div className="delete_confirmation">
                      <button
                        onClick={confirmDelete}
                        style={{ backgroundColor: "red", color: "white" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        style={{ backgroundColor: "gray", color: "white" }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {formVisible && (
        <div className="package-form-modal">
          <form className="package-form" onSubmit={handleAddPackage}>
            <h2>Create Package</h2>
            <div className="form_lables_input">
              <div className="two_input_field">
                <label>
                  Package Name:
                  <input type="text" name="package_name" value={formData.package_name} maxLength={20} onChange={handleChange} required />
                </label>
                <label>
                  Price/Day:
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </label>
              </div>
              <label>
                Selected Services
                <div className="all_services">
                  {formData.service.length > 0 ? formData.service.map((service, index) => (
                    <div
                      key={index}
                      className="service-item"
                    >
                      <span
                        style={{
                          display: "flex",
                          gap: "6px",
                          backgroundColor: "white",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        {service}{" "}
                        <span
                          style={{ color: "#333", cursor: "pointer" }}
                          onClick={() => {
                            handleRemoveService(index);
                          }}
                        >
                          x
                        </span>
                      </span>
                    </div>
                  )) : <div className="no_services_available">No services Selected</div>}
                </div>
                <div className="service-input">
                  <input
                    type="text"
                    value={newService}
                    onChange={handleServiceChange}
                    placeholder="Enter service title"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    disabled={!newService.trim()}
                  >
                    Add Service
                  </button>
                </div>
              </label>

              <label>
                Descriptio
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  cols="30"
                  rows="8"
                  style={{ resize: "none" }}
                  placeholder="Enter Description "

                ></textarea>
              </label>

              <label>
                Select Theme
                <div className="color-palette">
                  {themeOptions.map((theme, index) => (
                    <div
                      key={index}
                      className={`theme-option ${formData.card_color === theme.headerBg ? "selected" : ""
                        }`}
                      onClick={() =>
                        setFormData({ ...formData, card_color: theme.headerBg })
                      }
                    >
                      <div className="theme-preview">
                        <div
                          className="theme-preview-header"
                          style={{ backgroundColor: theme.headerBg }}
                        />
                        <div
                          className="theme-preview-body"
                          style={{ backgroundColor: theme.cardBg }}
                        >
                          <span></span>
                          <span>- -</span>
                          <span>- -</span>
                          <span></span>
                        </div>
                      </div>
                      <span className="theme-name">{theme.name}</span>
                    </div>
                  ))}
                </div>
              </label>
            </div>
            <div className="form-buttons">
              <button type="submit">Add Package</button>
              <button type="button" onClick={() => handleFormToggle()}>
                Cancel
              </button>
            </div>
          </form>

          {/* preview section */}
          {/* preview section */}
          {/* preview section */}
          {/* preview section */}

          <div className="preview-section">
            <h2>Preview Your Package</h2>
            <div
              className="package-card"
              style={{
                backgroundColor: "#ffffff",
                borderTop: `6px solid ${formData.card_color || "#6fa8dc"}`,
                borderRight: "1px solid #919394",
                borderLeft: "1px solid #919394",
                borderBottom: "1px solid #919394"
              }}
            >
              <div className="package_title">
                <div className="package_name">{formData.package_name || "Package Name"}</div>
              </div>
              <div className="package_pricing" style={{ color: formData.card_color || "#6fa8dc" }}>
                <div className="rupee_symbol">₹</div>
                <div className="value">
                  {formData.price || "Price"}
                </div>
                <span>/day</span>
              </div>

              <hr style={{ width: "96%", margin: "8px 0" }} />

              <div className="package_Services">
                {Array.isArray(formData.service) && formData.service.length > 0 ? (
                  formData.service.map((srv, idx) =>
                    <div key={idx} className="service_item">
                      <div className="key" style={{ backgroundColor: cardColor, color: "#ffffff" }}>{idx + 1}</div>
                      <div className="individual_services" >
                        {srv}
                      </div>
                    </div>)
                ) : (
                  <span>No services available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mobile_view && selectedPackage && (
        <MobilePackageView
          selectedPackage={selectedPackage}
          onClose={handleCloseMobileView}
          onUpdatePackage={handleMobilePackageUpdate}
        />
      )}
    </div>
  );
};

export default Packages;
