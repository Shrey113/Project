import React, { useState, useEffect } from "react";
import "./Packages.css";
import default_image from "./Images/default_image.png";
import "./sub_parts/DefaultPage.css";
import "./Packages_responsive.css";
import { Server_url } from "./../../../../redux/AllData";
import { useSelector } from "react-redux";
import MobilePackageView from './MobilePackageView';

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

  const [mobile_view, setMobile_view] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);  

  const [selectedPackage, setSelectedPackage] = useState(null);

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
      buttonText: "#FFFFFF"
    },
    {
      name: "Professional",
      headerBg: "#E91E63",
      cardBg: "#FCE4EC",
      textColor: "#000000",
      buttonBg: "#E91E63",
      buttonText: "#FFFFFF"
    },
    {
      name: "Business",
      headerBg: "#2196F3",
      cardBg: "#E3F2FD",
      textColor: "#000000",
      buttonBg: "#2196F3",
      buttonText: "#FFFFFF"
    }
  ];

  useEffect(() => {
    const fetchPackages = async () => {
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
          setPackages(data || []);
          console.log("Client side response", data);
        } else {
          console.error("Failed to fetch packages");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
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
        alert("Package added successfully");

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
        alert(data.message);
        console.log(data.results);
      } else {
        const errorData = await response.json();
        console.error("Error adding package:", errorData);
        alert(errorData.error);
      }
    } catch (err) {
      console.error("Error connecting to the server:", err);
      alert("Failed to add package");
    }
  };

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const handleEditChange = (packageIndex, field, value) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg, i) =>
        i === packageIndex
          ? {
              ...pkg,
              [field]: field === "price" ? parseFloat(value) : value,
            }
          : pkg
      )
    );
  };

  const handleEditToggle = async (index) => {
    const selectedPackage = packages[index];

    // If already in edit mode and clicking save
    if (selectedPackage.isEditing) {
      // Validate package name
      if (!selectedPackage.package_name.trim()) {
        alert("Package name cannot be empty");
        return;
      }

      const updatedPackageData = {
        id: selectedPackage.id,
        package_name: selectedPackage.package_name.trim(),
        service: Array.isArray(selectedPackage.service)
          ? JSON.stringify(selectedPackage.service)
          : selectedPackage.service,
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

          // Refresh packages from server
          // fetchPackages();

          alert(data.message || "Package updated successfully!");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to update package");
        }
      } catch (err) {
        console.error("Error connecting to the server:", err);
        alert("Failed to update package");
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

  // const handleUpdatePackage = (updatedPackage) => {
  //   // Update the package in your main packages array
  //   const updatedPackages = packages.map(pkg => 
  //     pkg.id === updatedPackage.id ? updatedPackage : pkg
  //   );
  //   setPackages(updatedPackages);
    
  //   // Here you can also make API call to update the package in backend
  //   // updatePackageInBackend(updatedPackage);
  // };

  const handleMobilePackageUpdate = async (updatedPackage) => {
    // Validate package name
    if (!updatedPackage.package_name.trim()) {
      alert("Package name cannot be empty");
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
        setPackages(prevPackages =>
          prevPackages.map(pkg =>
            pkg.id === updatedPackage.id ? { ...updatedPackage, isEditing: false } : pkg
          )
        );

        alert(data.message || "Package updated successfully!");
        return true;
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update package");
        return false;
      }
    } catch (err) {
      console.error("Error connecting to the server:", err);
      alert("Failed to update package");
      return false;
    }
  };

  return (
    <div className="packages-container">
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
            <h1>Your Packages</h1>
          </div>
          {!isMobileView ? (
          <div className="packages-grid">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="package-card"
                style={{ backgroundColor: `#ffffff` }}
              >
                {/* <div className="pckid">{pkg.id}</div> */}
                <div className="package_title">
                  <div
                    className="first_container"
                    style={{
                      backgroundColor: pkg.card_color || "#6fa8dc", // Apply color to heading
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
                      {pkg.isEditing ? (
                        <input
                          style={{ height: "100%" }}
                          type="text"
                          value={pkg.package_name}
                          onChange={(e) =>
                            handleEditChange(
                              index,
                              "package_name",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        pkg.package_name
                      )}
                    </div>
                    <div className="package_price">₹{pkg.price}</div>
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
                      pkg.service.map((srv, idx) => (
                        <div
                          key={idx}
                          className="service-item"
                          style={{
                            backgroundColor:
                              idx % 2 === 0
                                ? lightenColor(pkg.card_color, 20)
                                : "#ffffff",
                            width: "100%",
                            padding: "8px 10px",
                          }}
                        >
                          {pkg.isEditing ? (
                            <input
                              style={{
                                height: "30px",
                                border: "none",
                                backgroundColor:
                                  idx % 2 === 0
                                    ? lightenColor(pkg.card_color, 20)
                                    : "#ffffff",
                                boxShadow:
                                  "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                                padding: "10px",
                              }}
                              type="text"
                              value={srv}
                              onChange={(e) =>
                                handleServiceEdit(index, idx, e.target.value)
                              }
                            />
                          ) : (
                            srv.charAt(0).toUpperCase() +
                            srv.slice(1).toLowerCase()
                          )}
                        </div>
                      ))
                    ) : (
                      <span>No services available</span>
                    )}
                  </div>
                </div>

                <div className="edit-actions">
                  <button onClick={() => handleEditToggle(index)}>
                    {pkg.isEditing ? "Save" : "Edit"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="packages-grid-for-mobile" >
              {packages.map((pkg, index) => (
                <div key={index} className="package-card" style={{backgroundColor: pkg.card_color || "#6fa8dc"}} >
                  <div className="package-card-header" >
                    <h3 className="package-title">{pkg.package_name}</h3>
                    <div 
                      className="package-card-i-button" 
                      onClick={() => handleMobileViewToggle(pkg)}
                    >
                      i
                    </div>
                  </div>
                  <div className="package-card-body">
                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="amount">{pkg.price}</span>
                      <span className="period">/Day</span>
                    </div>
                    <div className="description-container">
                      <p className="package-description">{pkg.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="tooltip-container">
            <button
              className="add-package-button"
              onClick={() => handleFormToggle()}
            >
              +
            </button>
            <span className="tooltip-text">Create New Package</span>
          </div>
        </div>
      )}

      {formVisible && (
        <div className="package-form-modal">
          <form className="package-form" onSubmit={handleAddPackage}>
            <h2>Create Package</h2>
            <div className="form_lables_input">
              <div className="two_input_field">
                <label>
                  Package Name:
                  <input type="text" name="package_name" value={formData.package_name} onChange={handleChange} required />
              </label>
              <label>
                Price/Day:
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </label>
              </div>
              <label>
                Service:
                <div
                  className="all_services"
                  style={{
                    height: "fit-content",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: "10px",
                    borderRadius: "8px",
                    padding: "5px",
                    lineHeight: -1,
                  }}
                >
                  {formData.service.map((service, index) => (
                    <div
                      key={index}
                      className="service-item"
                      style={{
                        height: "fit-content",
                        padding: "5px",
                        borderRadius: "5px",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
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
                  ))}
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
                Description:
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  cols="30"
                  rows="8"
                  style={{
                    maxHeight: "150px",
                    width: "100%",
                    resize: "vertical",
                    border: "1px solid #ddd",
                    padding: "5px 6px",
                  }}
                  placeholder="Enter Description "
                ></textarea>
              </label>

              <label>
                Select Theme:
                <div className="color-palette">
                  {themeOptions.map((theme, index) => (
                    <div 
                      key={index}
                      className={`theme-option ${formData.card_color === theme.headerBg ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, card_color: theme.headerBg })}
                    >
                      <div className="theme-preview">
                        <div  className="theme-preview-header" style={{ backgroundColor: theme.headerBg }}/>
                        <div  className="theme-preview-body" style={{ backgroundColor: theme.cardBg }}>
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
              style={{ backgroundColor: `#ffffff` }}
            >
              <div className="package_title">
                <div
                  className="first_container"
                  style={{
                    backgroundColor: formData.card_color || "#6fa8dc",
                    color: "#fff",
                  }}
                ></div>
                <div
                  className="second_container"
                  style={{
                    backgroundColor: formData.card_color || "#6fa8dc",
                    color: "#fff",
                  }}
                >
                  <div className="package_name">
                    {formData.package_name || "Package Name"}
                  </div>
                  <div className="package_price">
                    ₹{formData.price || "Price"}/Day
                  </div>
                </div>
                <div
                  className="third_container"
                  style={{
                    backgroundColor: formData.card_color || "#6fa8dc",
                    color: "#fff",
                  }}
                ></div>
              </div>

              <div className="package_all_details">
                <div className="package_Services">
                  {Array.isArray(formData.service) &&
                  formData.service.length > 0 ? (
                    formData.service.map((srv, idx) => (
                      <div
                        key={idx}
                        className="service-item"
                        style={{
                          backgroundColor:
                            idx % 2 === 0
                              ? lightenColor(formData.card_color, 20)
                              : "#ffffff",
                          width: "100%",
                          padding: "8px 10px",
                        }}
                      >
                        {srv.charAt(0).toUpperCase() +
                          srv.slice(1).toLowerCase()}
                      </div>
                    ))
                  ) : (
                    <span>No services available</span>
                  )}
                </div>
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
