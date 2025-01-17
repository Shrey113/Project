import React, { useState } from "react";
import "./Packages.css";

const Packages = () => {
  const [selectedType, setSelectedType] = useState(null); // To toggle form visibility
  const [packages, setPackages] = useState([]); // To store package details
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    service: "",
    description: "",
    price: "",
  });

  const handleFormToggle = (type) => {
    setSelectedType(type);
    setFormData({ ...formData, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPackage = (e) => {
    e.preventDefault();
    setPackages([...packages, formData]);
    setSelectedType(null);
    setFormData({
      type: "",
      title: "",
      service: "",
      description: "",
      price: "",
    });
  };

  return (
    <div className="packages-container">
      <div
        className={`package-box basic-box ${
          selectedType === "basic" ? "active" : ""
        }`}
        onClick={() => handleFormToggle("basic")}
      >
        {selectedType === "basic" ? (
          <form className="package-form" onSubmit={handleAddPackage}>
            <h2>Create a Basic Package</h2>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Service:
              <input
                type="text"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
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
            <button type="submit">Add Package</button>
          </form>
        ) : (
          <div className="add-package">
            <span>+</span>
            <p>Add Basic Package</p>
          </div>
        )}
      </div>

      <div
        className={`package-box standard-box ${
          selectedType === "standard" ? "active" : ""
        }`}
        onClick={() => handleFormToggle("standard")}
      >
        {selectedType === "standard" ? (
          <form className="package-form" onSubmit={handleAddPackage}>
            <h2>Create a Standard Package</h2>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Service:
              <input
                type="text"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
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
            <button type="submit">Add Package</button>
          </form>
        ) : (
          <div className="add-package">
            <span>+</span>
            <p>Add Standard Package</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
