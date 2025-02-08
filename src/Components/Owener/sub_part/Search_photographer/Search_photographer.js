import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Search_photographer.css";
import OwnerList from "./sub_part/Owners_List";
import { Server_url , showRejectToast, showWarningToast} from "../../../../redux/AllData";
import { TfiLocationPin } from "react-icons/tfi";
import { BiLoaderAlt } from "react-icons/bi";


import banglore from './all_data/banglore.png'
import chennai from './all_data/chennai.png'
import goa from './all_data/goa.png'
import hyderabad from './all_data/hyderabad.png'
import jaipur from './all_data/jaipur.png'
import delhi from './all_data/delhi.png'
import pune from './all_data/delhi.png'
import lucknow from './all_data/banglore.png'
import bombay from './all_data/bombay.png' 
import kolkata from './all_data/chennai.png'


const locations = [
  {
    id: 1,
    name: 'Delhi NCR',
    value: 'delhi-ncr',
    image: delhi
  },
  {
    id: 2,
    name: 'Mumbai',
    value: 'mumbai',
    image: bombay
  },
  {
    id: 3,
    name: 'Bangalore',
    value: 'bangalore',
    image: banglore
  },
  {
    id: 4,
    name: 'Hyderabad',
    value: 'hyderabad',
    image: hyderabad
  },
  {
    id: 5,
    name: 'Chennai',
    value: 'chennai',
    image: chennai
  },
  {
    id: 6,
    name: 'Goa',
    value: 'goa',
    image: goa
  },
  {
    id: 7,
    name: 'Jaipur',
    value: 'jaipur',
    image: jaipur
  },
  {
    id: 8,
    name: 'Pune',
    value: 'pune',
    image: pune
  },
  {
    id: 9,
    name: 'Kolkata',
    value: 'kolkata',
    image: kolkata
  },
  {
    id: 10,
    name: 'Lucknow',
    value: 'lucknow',
    image: lucknow
  }
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
          showRejectToast({ message: "Please enable location to use location filters" });
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
    if (!isLocationPermissionGranted && value !== 'all') {
      showWarningToast({ message: "Please enable location access to use location filters" });
      return;
    }

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
                <BiLoaderAlt className="loading-spinner" />
              </div>
              <div className="location-details">
                <span className="location-name">Loading location...</span>
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

          {/* Modified locations mapping - use displayedLocations instead of locations.slice(0, 4) */}
          {displayedLocations.map((location) => (
            <div
              key={location.id}
              className={`location-circle ${selectedLocation === location.value ? 'selected' : ''}`}
              onClick={() => handleLocationSelect(location.value)}
              style={{
                opacity: selectedLocation && selectedLocation !== location.value ? 0.55 : 1,
                cursor: isLocationPermissionGranted ? 'pointer' : 'not-allowed',
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
                cursor: isLocationPermissionGranted ? 'pointer' : 'not-allowed',
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
