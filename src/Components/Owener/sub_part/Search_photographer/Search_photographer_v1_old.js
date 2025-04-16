import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Search_photographer.css";
import OwnerList from "./sub_part/Owners_List";
import { Server_url, showWarningToast } from "../../../../redux/AllData";
import { TfiLocationPin } from "react-icons/tfi";
import { BiLoaderAlt } from "react-icons/bi";
import { TbLocationCancel } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

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

//  small daata
import ahd from "./small_data/ahd.png";
import bang from  "./small_data/bang.png"
import chd from  "./small_data/chd.png"
import chen from  "./small_data/chen.png"
import hyd from  "./small_data/hyd.png"
import koch from  "./small_data/koch.png"
import kolk from  "./small_data/kolk.png"
import mumbai from  "./small_data/mumbai.png"
import ncr from  "./small_data/ncr.png"
import pune_2 from  "./small_data/pune.png"

const popularCities = [
  { name: "Mumbai", icon: mumbai },
  { name: "Delhi-NCR", icon: ncr },
  { name: "Bengaluru", icon: bang },
  { name: "Hyderabad", icon: hyd },
  { name: "Ahmedabad", icon: ahd},
  { name: "Chandigarh", icon: chd },
  { name: "Chennai", icon: chen },
  { name: "Pune", icon:pune_2},
  { name: "Kolkata", icon: kolk },
  { name: "Kochi", icon: koch }
];

const otherCities = [
  "Aalo", "Addanki", "Agar Malwa", "Ahmedgarh", "Akbarpur", "Alakode", "Alibaug",
  "Abohar", "Adilabad", "Agartala", "Ahore", "Akividu", "Alangudi", "Aligarh",
  "Abu Road", "Adimali", "Agiripalli", "Aizawl", "Akluj", "Alangulam", "Alipurduar",
  "Achampet", "Adipur", "Agra", "Ajmer", "Akola", "Alappuzha", "Almora",
  "Acharapakkam", "Adoni", "Ahilyanagar (Ahmednagar)", "Akalatara", "Akot", "Alathur", "Alisar (Rajasthan)"
];

// Larger cities array
const locations = [
  // Major Cities in India
  { name: 'Delhi', value: 'delhi-ncr', image: delhi },
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
];

function Search_photographer({ searchTerm, setSearchTerm }) {
  const user = useSelector((state) => state.user);
  const user_email = user.user_email;
  const [all_owner_data, set_all_owner_Data] = useState();
  const [filteredUsers, setFilteredUsers] = useState({
    owners: [],
    packages: [],
    equipment: [],
  });
  const [locationData, setLocationData] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [set_disable_opacity] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showAllOtherCities, setShowAllOtherCities] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [visibleLocations, setVisibleLocations] = useState([]);

  // Handle city search
  const filteredOtherCities = otherCities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  // Toggle city selector popup
  const toggleCitySelector = () => {
    setShowCitySelector(!showCitySelector);
  };

  // Close city selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCitySelector && !e.target.closest('.city-selector') && !e.target.closest('.location-toggle-button')) {
        setShowCitySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCitySelector]);

  // Toggle show/hide all other cities
  const toggleOtherCities = () => {
    setShowAllOtherCities(!showAllOtherCities);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedLocation(city);
    setShowCitySelector(false);
  };

  // Detect current location
  const detectLocation = () => {
    setIsLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsLocationPermissionGranted(true);
          getCityName(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocationPermissionGranted(false);
          setLocationData(null);
          setIsLocationLoading(false);
          showWarningToast({ message: "Couldn't access your location" });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      showWarningToast({ message: "Your browser doesn't support geolocation" });
      setIsLocationPermissionGranted(false);
      setLocationData(null);
      setIsLocationLoading(false);
    }
  };

  const getCityName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      const cityName =
        data.address?.state_district ||
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state ||
        (data.display_name ? data.display_name.split(',')[0] : null) ||
        "Unknown location";

      console.log("City Name from location:", cityName);
      setLocationData(cityName);
      handleCitySelect(cityName);
    } catch (error) {
      console.error("Error fetching city:", error);
      setLocationData(null);
    } finally {
      setIsLocationLoading(false);
    }
  };

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

  return (
    <div className="owner-search-main-container">
      {/* Location Selector Button */}
      <div className="location-selector-container">
        <button 
          className="location-toggle-button" 
          onClick={toggleCitySelector}
        >
          {selectedLocation === 'all' ? 'Select Location' : selectedLocation}
        </button>
        
        {/* City Selector Popup */}
        {showCitySelector && (
          <div className="city-selector-overlay">
            <div className="city-selector">
              <div className="city-selector-header">
                <h2>Select City</h2>
                <button 
                  className="close-city-selector" 
                  onClick={() => setShowCitySelector(false)}
                >
                  <IoMdClose />
                </button>
              </div>
              
              <input 
                className="search-input" 
                placeholder="Search for your city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)} 
              />
              
              <div className="detect-location" onClick={detectLocation}>
                <TfiLocationPin /> Detect my location
                {isLocationLoading && <BiLoaderAlt className="loading-spinner" />}
              </div>

              <div className="section">
                <h2>Popular Cities</h2>
                <div className="popular-cities">
                  {popularCities.map((city) => (
                    <div 
                      className={`city-icon ${selectedLocation === city.name ? 'selected' : ''}`}
                      key={city.name}
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <div className="icon">
                        <img src={city.icon} alt={city.name} />
                      </div>
                      <div>{city.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h2>Other Cities</h2>
                <div className="other-cities">
                  {(showAllOtherCities ? filteredOtherCities : filteredOtherCities.slice(0, 20)).map((city) => (
                    <div 
                      className={`city-name ${selectedLocation === city ? 'selected' : ''}`}
                      key={city}
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>

              <div 
                className="toggle-cities-btn"
                onClick={toggleOtherCities}
              >
                {showAllOtherCities ? "Hide All Cities" : "View All Cities"}
              </div>
            </div>
          </div>
        )}
      </div>

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
