import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Search_photographer.css";
import OwnerList from "./sub_part/Owners_List";
import { Server_url , showRejectToast, showWarningToast} from "../../../../redux/AllData";
import { TfiLocationPin } from "react-icons/tfi";
import { BiLoaderAlt } from "react-icons/bi";
import { TbLocationCancel } from "react-icons/tb";

import delhi from './all_data/delhi.png'
import bombay from './all_data/bombay.png'
import bangalore from './all_data/banglore.png'
import hyderabad from './all_data/hyderabad.png'
import chennai from './all_data/chennai.png'
import kolkata from './all_data/kolkata.png'
import pune from './all_data/pune.png'
import jaipur from './all_data/jaipur.png'
import lucknow from './all_data/lucknow.png'
import goa from './all_data/goa.png'
import chandigarh from './all_data/chandigarh.png'
import bhopal from './all_data/bhopal.png'
import indore from './all_data/indore.png'
import nagpur from './all_data/nagpur.png'
import visakhapatnam from './all_data/visakhapatnam.png'
import patna from './all_data/patna.png'
import dehradun from './all_data/dehradun.png'
import coimbatore from './all_data/coimbatore.png'
import mysore from './all_data/mysore.png'
import guwahati from './all_data/guwahati.png'
import bhubaneswar from './all_data/bhubaneswar.png'
import shimla from './all_data/shimla.png'
import shillong from './all_data/shillong.png'






const locations = [
  // Major Cities in India
  { name: 'Delhi NCR', value: 'delhi-ncr', image: delhi },
  { name: 'Mumbai', value: 'mumbai', image: bombay },
  { name: 'Bangalore', value: 'bangalore', image: bangalore },
  { name: 'Hyderabad', value: 'hyderabad', image: hyderabad },
  { name: 'Chennai', value: 'chennai', image: chennai },
  { name: 'Kolkata', value: 'kolkata', image: kolkata },
  { name: 'Pune', value: 'pune', image: pune },
  { name: 'Jaipur', value: 'jaipur', image: jaipur },
  { name: 'Lucknow', value: 'lucknow', image: lucknow },
  { name: 'Goa', value: 'goa', image: goa },
  { name: 'Chandigarh', value: 'chandigarh', image: chandigarh },
  { name: 'Bhopal', value: 'bhopal', image: bhopal },
  { name: 'Indore', value: 'indore', image: indore },
  { name: 'Nagpur', value: 'nagpur', image: nagpur },
  { name: 'Visakhapatnam', value: 'visakhapatnam', image: visakhapatnam },
  { name: 'Patna', value: 'patna', image: patna },
  { name: 'Dehradun', value: 'dehradun', image: dehradun },
  { name: 'Coimbatore', value: 'coimbatore', image: coimbatore },
  { name: 'Mysore', value: 'mysore', image: mysore },
  { name: 'Guwahati', value: 'guwahati', image: guwahati },
  { name: 'Bhubaneswar', value: 'bhubaneswar', image: bhubaneswar },
  { name: 'Shimla', value: 'shimla', image: shimla },
  { name: 'Shillong', value: 'shillong', image: shillong },

  // // Major Cities in Gujarat
  // { name: 'Ahmedabad', value: 'ahmedabad', image: ahmedabad },
  // { name: 'Surat', value: 'surat', image: surat },
  // { name: 'Vadodara', value: 'vadodara', image: vadodara },
  // { name: 'Rajkot', value: 'rajkot', image: rajkot },
  // { name: 'Bhavnagar', value: 'bhavnagar', image: bhavnagar },
  // { name: 'Jamnagar', value: 'jamnagar', image: jamnagar },
  // { name: 'Gandhinagar', value: 'gandhinagar', image: gandhinagar },
  // { name: 'Junagadh', value: 'junagadh', image: junagadh },
  // { name: 'Anand', value: 'anand', image: anand },
  // { name: 'Navsari', value: 'navsari', image: navsari },
  // { name: 'Mehsana', value: 'mehsana', image: mehsana },
  // { name: 'Morbi', value: 'morbi', image: morbi },
  // { name: 'Nadiad', value: 'nadiad', image: nadiad },
  // { name: 'Gandhidham', value: 'gandhidham', image: gandhidham },
  // { name: 'Bhuj', value: 'bhuj', image: bhuj },
  // { name: 'Palanpur', value: 'palanpur', image: palanpur },
  // { name: 'Valsad', value: 'valsad', image: valsad },
  // { name: 'Bharuch', value: 'bharuch', image: bharuch },
  // { name: 'Dahod', value: 'dahod', image: dahod },
  // { name: 'Porbandar', value: 'porbandar', image: porbandar }
];



function Search_photographer() {
  const user = useSelector((state) => state.user);
  const user_email = user.user_email;
  const [all_owner_data, set_all_owner_Data] = useState();
  // const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState({
    owners: [],
    packages: [],
    equipment: [],
  });

  // Add new state for location data
  const [locationData, setLocationData] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState('all');

  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);

  // Add new state for popup
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Add new state for displayed locations
  const [displayedLocations, setDisplayedLocations] = useState(locations.slice(0, 4));

  // const[is_show_message_one_time, set_is_show_message_one_time] = useState(false);

  useEffect(() => {
    const getCityName = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        console.log("Reverse Geocoding Data:", data);
        setLocationData(data);
   
          // showAcceptToast({ message: `Location accessed successfully! ${data.address.state_district || data.address.state}` });

        setIsLocationLoading(false);
      } catch (error) {
        console.error("Error fetching city:", error);
        showRejectToast({ message: "Error fetching city" });
        setIsLocationLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getCityName(latitude, longitude);
          setIsLocationPermissionGranted(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          showRejectToast({ message: "Please enable system location to use location filters" });
          // showNeutralToast("GO > Settings > Location > Enable Location");
        },
        { enableHighAccuracy: true }
      );
    } else {
      showWarningToast({ message: "Your browser doesn't support geolocation" });
    }
  }, []);



  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredUsers({ owners: [], packages: [], equipment: [] });
        setIsLoading(false);
        return;
      }

      const fetchData = async () => {
        try {
          const response = await fetch(
            `${Server_url}/owner/search?term=${searchTerm}&searchFields=name,email`
          );
          const data = await response.json();
          console.log("Search response:", data);

          setFilteredUsers({
            owners: Array.isArray(data.owners) 
              ? data.owners.filter((owner) => owner.user_email !== user_email)
              : [],
            packages: Array.isArray(data.packages) ? data.packages : [],
            equipment: Array.isArray(data.equipment)
              ? data.equipment.filter((equip) => equip.user_email !== user_email)
              : [],
          });
        } catch (err) {
          console.error("Error fetching data:", err);
          setFilteredUsers({ owners: [], packages: [], equipment: [] });
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, user_email]);

  useEffect(() => {
    // setLoading(true);
    const fetchOwners = async () => {
      try {
        const response = await fetch(`${Server_url}/api/owners`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_email: user.user_email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch owners");
        }

        const data = await response.json();
        set_all_owner_Data(data.result); 
      } catch (error) {
        console.error("Error fetching owner data:", error);
      }
    };
    fetchOwners();
  }, [user.user_email]);

  const handleLocationSelect = (value) => {
    // If selecting from popup, update the displayed locations
    const selectedLocationObj = locations.find(loc => loc.value === value);
    if (selectedLocationObj) {
      const newDisplayedLocations = [
        selectedLocationObj,
        ...locations.filter(loc => loc.value !== value).slice(0, 3)
      ];
      setDisplayedLocations(newDisplayedLocations);
    }
    
    setSelectedLocation(prev => prev === value ? null : value);
  };

  // Modify the Others button click handler
  const handleOthersClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling
    setShowLocationPopup(true);
  };

  // Add click handler to close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLocationPopup && !e.target.closest('.location-popup-content')) {
        setShowLocationPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLocationPopup]);

  return (
    <div className="owner-search-main-container">
      {/* Navbar */}
      <nav className="photographer-navbar">
        {/* Search Bar */}
        <div className="search-container-nav">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </nav>

      {/* Location Scroll List */}
      <div className="locations-scroll-container">
        <div className="locations-list">
          <div
            className={`all-locations-btn ${selectedLocation === 'all' ? 'selected' : ''}`}
            onClick={() => handleLocationSelect('all')}
            style={{
              opacity: selectedLocation && selectedLocation !== 'all' ? 0.55 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            All
          </div>

          {/* Location loader or location data */}
          {!locationData ? (
            <div className="location-circle current-location">
              <div className="location-image-wrapper current-location-wrapper">
                {isLocationPermissionGranted ? (
                  <BiLoaderAlt className="loading-spinner" />
                ) : (
                  <TbLocationCancel />
                )}
              </div>
              <div className="location-details">
                {isLocationPermissionGranted ? (
                  <span className="location-name">Loading location...</span>
                ) : (
                  <span className="location-name">not granted</span>
                )}
              </div>
            </div>

          ) : (
            <div
              className={`location-circle current-location ${selectedLocation}`}
              onClick={() => handleLocationSelect(locationData.address.city||  locationData.address.state_district || 
                locationData.address.state)}
           
            >
              <div className="location-image-wrapper current-location-wrapper">
                <TfiLocationPin />
              </div>
              <div className="location-details">
                <span className="location-name">
                  {isLocationLoading ? 'Loading...' : 
                    `${locationData.address.city || 
                      locationData.address.state_district || 
                      locationData.address.state}`
                  }
                </span>
              </div>
            </div>
          )}

          {displayedLocations.map((location) => (
            <div
              key={location.id}
              className={`location-circle ${selectedLocation === location.value ? 'selected' : ''}`}
              onClick={() => handleLocationSelect(location.value)}
              style={{
                opacity: selectedLocation && selectedLocation !== location.value ? 0.55 : 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >

              <div className="location-image-wrapper">
                <img
                  src={location.image}
                  alt={location.name}
                  className="location-image"
                />
              </div>
              <div className="location-details">
                <span className="location-name">{location.name}</span>
              </div>
            </div>
          ))}

          {/* Show Others button if more locations exist */}
          {locations.length > 4 && (
            <div
              className="location-circle"
              onClick={handleOthersClick}
              style={{
                opacity: selectedLocation ? 0.55 : 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >

              <div className="location-image-wrapper">
                <div className="others-count">+{locations.length - 4}</div>
              </div>
              <div className="location-details">
                <span className="location-name">Others</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add the popup menu */}
      {showLocationPopup && (
        <div className="location-popup-overlay">
          <div className="location-popup-content">
            <div className="popup-header">
              <h3>All Locations</h3>
              <button 
                className="close-popup"
                onClick={() => setShowLocationPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-locations-grid">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`location-circle popup-location ${
                    selectedLocation === location.value ? 'selected' : ''
                  }`}
                  onClick={() => {
                    handleLocationSelect(location.value);
                    setShowLocationPopup(false);
                  }}
                >
                  <div className="location-image-wrapper">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="location-image"
                    />
                  </div>
                  <div className="location-details">
                    <span className="location-name">{location.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="sections-container">
        <OwnerList
          owners={searchTerm.trim() ? null : all_owner_data}
          filteredUsers={filteredUsers}
          isLoading={isLoading}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
}

export default Search_photographer;
