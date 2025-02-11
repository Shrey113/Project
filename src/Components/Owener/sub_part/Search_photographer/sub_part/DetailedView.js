import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./DetailedView.css";
import camera_icon from "./test_img_equipment/camera.png";
import drone_icon from "./test_img_equipment/drone.png";
import tripod_icon from "./test_img_equipment/Tripod.png";
import lens_icon from "./test_img_equipment/lens.png";
import SeletedCard from "./SeletedCard";

function DetailedView() {
  const location = useLocation();
  const allData = location.state?.data;
  const type = location.state?.dataType;
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [showSelectedCard, setShowSelectedCard] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  useEffect(() => {
    console.log("data from another side ", allData);
    console.log("data from another side ", type);
  });
  const getFilteredData = () => {
    if (!allData) return [];

    let filtered = [...allData];

    if (type === "packages") {
      filtered = filtered?.filter(
        (item) =>
          item.package_name
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery?.toLowerCase())
      );
    } else if (type === "equipments") {
      filtered = filtered?.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          item.equipment_type
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase()) ||
          item.equipment_company
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase())
      );
    }

    if (priceRange.min !== "") {
      filtered = filtered.filter(
        (item) =>
          (type === "packages" ? item.price : item.equipment_price_per_day) >=
          Number(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(
        (item) =>
          (type === "packages" ? item.price : item.equipment_price_per_day) <=
          Number(priceRange.max)
      );
    }

    if (type === "equipments" && selectedType) {
      filtered = filtered.filter(
        (item) =>
          item.equipment_type?.toLowerCase() === selectedType?.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      const priceA = type === "packages" ? a.price : a.equipment_price_per_day;
      const priceB = type === "packages" ? b.price : b.equipment_price_per_day;
      const nameA = type === "packages" ? a.package_name : a.name;
      const nameB = type === "packages" ? b.package_name : b.name;

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        default:
          return nameA.localeCompare(nameB);
      }
    });

    return filtered;
  };

  const filteredData = getFilteredData();

  const getEquipmentIcon = (equipmentType) => {
    switch (equipmentType?.toLowerCase()) {
      case "tripod":
        return tripod_icon;
      case "drone":
        return drone_icon;
      case "lens":
        return lens_icon;
      case "camera":
      default:
        return camera_icon;
    }
  };

  function clearFilters() {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedType("");
    setSortBy("name");
  }

  // Add console.log to debug state changes
  useEffect(() => {
    console.log("showSelectedCard:", showSelectedCard);
    console.log("selectedData:", selectedData);
  }, [showSelectedCard, selectedData]);

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
    <div className="all_user_data_list" id="owner_DetailedView_container">
      <h1>{type === "packages" ? "Packages" : "Equipments"}</h1>

      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${
              type === "packages" ? "packages" : "equipment"
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <div className="price-filter">
            <input
              type="text"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: e.target.value })
              }
              className="price-input"
            />
            <span>To </span>
            <input
              type="text"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: e.target.value })
              }
              className="price-input"
            />
          </div>

          {type === "equipments" && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="type-select"
            >
              <option value="">All Types</option>
              <option value="camera">Camera</option>
              <option value="lens">Lens</option>
              <option value="tripod">Tripod</option>
              <option value="drone">Drone</option>
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      </div>

      {type === "packages" && (
        <div
          className="package_list_container"
          id="owner_package_list_container_all"
        >
          {filteredData.length === 0 ? (
            <div className="no-results">No packages found</div>
          ) : (
            <div className="package-grid">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="package-card"
                  style={{ backgroundColor: "#ffffff", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedData(item);
                    setShowSelectedCard(true);
                  }}
                >
                  <div className="package_title">
                    <div
                      className="first_container"
                      style={{
                        backgroundColor: item.card_color || "#6fa8dc",
                        color: "#fff",
                      }}
                    ></div>
                    <div
                      className="second_container"
                      style={{
                        backgroundColor: item.card_color || "#6fa8dc",
                        color: "#fff",
                      }}
                    >
                      <div className="package_name">
                        {item.package_name || "Not Available"}
                      </div>
                      <div className="package_price">
                        ₹{item.price || "Not Available"}
                      </div>
                    </div>
                    <div
                      className="third_container"
                      style={{
                        backgroundColor: item.card_color || "#6fa8dc",
                        color: "#fff",
                      }}
                    ></div>
                  </div>
                  <div className="package_all_details">
                    <div className="package_Services">
                      {Array.isArray(item.service) &&
                      item.service.length > 0 ? (
                        item.service.map((srv, idx) => {
                          const baseColor = item.card_color || "#6fa8dc";
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {type === "equipments" && (
        <div className="equipment_list_container">
          {filteredData.length === 0 ? (
            <div className="no-results">No equipment found</div>
          ) : (
            <div className="equipment-grid">
              {filteredData.map((item) => (
                <div
                  key={item.equipment_id}
                  className="equipment_item"
                  onClick={() => {
                    setSelectedData(item);
                    setShowSelectedCard(true);
                  }}
                >
                  <div className="photo_container_for_equipment">
                    <img
                      src={getEquipmentIcon(item.equipment_type)}
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
                    <p>{item.equipment_description || "Not Available"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSelectedCard && selectedData && (
        <SeletedCard
          type={type}
          onClose={() => {
            setShowSelectedCard(false);
            setSelectedData(null);
          }}
          selectedData={selectedData}
        />
      )}
    </div>
  );
}

export default DetailedView;
