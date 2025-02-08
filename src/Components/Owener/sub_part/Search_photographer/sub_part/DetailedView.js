import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./DetailedView.css";
import camera_icon from './test_img_equipment/camera.png'
import drone_icon from './test_img_equipment/drone.png'
import tripod_icon from './test_img_equipment/Tripod.png'
import lens_icon from './test_img_equipment/lens.png'
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

  const getFilteredData = () => {
    if (!allData) return [];
    
    let filtered = [...allData];

    if (type === "packages") {
      filtered = filtered.filter(item =>
        item.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (type === "equipments") {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.equipment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.equipment_company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priceRange.min !== "") {
      filtered = filtered.filter(item => 
        (type === "packages" ? item.price : item.equipment_price_per_day) >= Number(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(item => 
        (type === "packages" ? item.price : item.equipment_price_per_day) <= Number(priceRange.max)
      );
    }

    if (type === "equipments" && selectedType) {
      filtered = filtered.filter(item => 
        item.equipment_type.toLowerCase() === selectedType.toLowerCase()
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
      case 'tripod':
        return tripod_icon;
      case 'drone':
        return drone_icon;
      case 'lens':
        return lens_icon;
      case 'camera':
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
    console.log('showSelectedCard:', showSelectedCard);
    console.log('selectedData:', selectedData);
  }, [showSelectedCard, selectedData]);

  return (
    <div className="all_user_data_list" id="owner_DetailedView_container" >
      <h1>{type === "packages" ? "Packages" : "Equipments"}</h1>

      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${type === "packages" ? "packages" : "equipment"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <div className="price-filter">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="price-input"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
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

          <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>
        </div>
      </div>

      {type === "packages" && (
        <div className="package_list_container" id="owner_package_list_container_all" >
          {filteredData.length === 0 ? (
            <div className="no-results">No packages found</div>
          ) : (
            <div className="package-grid">
              {filteredData.map((item) => (
                <div 
                  key={item.id} 
                  className="package-card"
                  style={{ backgroundColor: item.card_color + '15' }}
                  onClick={() => {
                    setSelectedData(item);
                    setShowSelectedCard(true);
                  }}
                >
                  <div className="package-card-title">{item.package_name}</div>
                  <div className="package-details">
                    <div className="services-list">
                      <strong>Services:</strong>
                      <ul>
                        {item.service.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p className="price"><strong>Price:</strong> Rs.{item.price} / Day</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {type === "equipments" && (
        <div className="owner_list_container">
          {filteredData.length === 0 ? (
            <div className="no-results">No equipment found</div>
          ) : (
            <div className="equipment-grid">
              {filteredData.map((item) => (
                <div 
                  key={item.equipment_id} 
                  className="package-card"
                  onClick={() => {
                    setSelectedData(item);
                    setShowSelectedCard(true);
                  }}
                >
                  <div className="equipment-header">
                    <img 
                      src={getEquipmentIcon(item.equipment_type)} 
                      alt={item.equipment_type}
                      className="equipment-icon"
                    />
                    <div className="equipment-card-title">{item.name}</div>
                  </div>
                  <div className="package-details">
                    <p><strong>Company:</strong> {item.equipment_company}</p>
                    <p><strong>Type:</strong> {item.equipment_type}</p>
                    <p><strong>Description:</strong> {item.equipment_description}</p>
                    <p className="price"><strong>Price</strong> Rs.{item.equipment_price_per_day} / Day</p>
                    <p><strong>Equipment ID:</strong> {item.user_equipment_id}</p>
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
