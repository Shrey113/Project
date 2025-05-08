import React, { useState, useEffect } from "react";
// import "./Owners_List.css";
import "./Owners_List_2.css";
import user1 from "./../../../sub_part/profile_pic/user1.jpg";
import { Server_url } from "./../../../../../redux/AllData";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { MdCamera } from "react-icons/md";

const SkeletonCard = () => (
  <div className="owner-card skeleton">
    <div className="image_container skeleton-image">
      <div className="skeleton-animation"></div>

    </div>
    <div className="owner-info">
      <div className="skeleton-text skeleton-animation"></div>
      <div className="skeleton-text skeleton-animation"></div>
      <div className="skeleton-text skeleton-animation"></div>
    </div>
    <div className="explore-button-container">
      <div className="skeleton-button skeleton-animation"></div>
    </div>
  </div>
);




const OwnerList = ({ owners, filteredUsers, isLoading, selectedLocation }) => {
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (owners || filteredUsers) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [owners, filteredUsers]);

  const handleExplore = async (owner) => {
    if (selectedOwner === owner) {
      setSelectedOwner(null);
      return;
    }

    try {
      const response = await fetch(`${Server_url}/api/owner-all-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: owner.user_email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch owner details");
      }

      const data = await response.json();
      console.log("Data received from server.....................", data);
      if (data && data.equipment && data.packages && data.photo_files) {
        navigate(`/Owner/search_photographer/${owner.user_email}`, {
          state: { ownerData: data, selectedOwner: owner },
        });
      } else {
        console.error("Data format is not as expected:", data);
      }
    } catch (error) {
      console.error("Error fetching owner details:", error);
    }
  };

  const filterOwnersByLocation = (ownersArray) => {
    if (!selectedLocation || selectedLocation === 'all') {
      return ownersArray;
    }

    return ownersArray.filter(owner => {
      const businessAddress = (owner?.business_address || "").toLowerCase();
      const location = selectedLocation?.toLowerCase();

      // Handle special case for Delhi NCR
      if (location === 'delhi-ncr') {
        return businessAddress.includes('delhi') ||
          businessAddress.includes('ncr') ||
          businessAddress.includes('gurgaon') ||
          businessAddress.includes('noida') ||
          businessAddress.includes('ghaziabad');
      }

      return businessAddress.includes(location);
    });
  };

  if (isLoading || localLoading) {
    return (
      <div className="owner-list-container">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (filteredUsers && filteredUsers.owners && filteredUsers.owners.length > 0) {
    const filteredByLocation = filterOwnersByLocation(filteredUsers.owners);

    if (filteredByLocation.length === 0) {
      return (
        <div className="no-photographers">
          <div className="no-results-icon">
            <FaSearch className="icon" />
          </div>
          <h2>No Photographers Found in This Location</h2>
          <p>We couldn't find any photographers in the selected location.</p>
          <p>Try selecting a different location or removing the location filter.</p>
        </div>
      );
    }

    return (
      <div className="owner-list-container">
        {filteredByLocation.map((owner, index) => (
          <div
            key={index}
            className="owner-card"
            onClick={() => {
              handleExplore(owner);
            }}
          >
            <div className="image_container">
              <img
                src={`${Server_url}/owner/business-profile-image/${owner.user_email}?t=${new Date().getTime()}` || user1}
                alt="Owner Avatar"
                className="owner-avatar"
              />
            </div>

            <div className="owner-info">
              <h3>{owner.user_name}</h3>
              <p className="email"> <FaEnvelope className="icon" />{owner.user_email}</p>
              <p className="location">
                <span >
                  <FaMapMarkerAlt className="icon" />
                  {owner.business_address || "Not Available"}
                </span>
              </p>
            </div>
            <div className="explore-button-container">
              <button onClick={() => handleExplore(owner)}>
                {selectedOwner === owner ? "Hide Details" : "Explore"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!owners || owners.length === 0) {
    return (
      <div className="no-photographers">
        <div className="no-results-icon">
          <FaSearch className="icon" />
        </div>
        <h2>No Photographers Found</h2>
        <p>We couldn't find any photographers matching your search criteria.</p>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const filteredByLocation = filterOwnersByLocation(owners);

  if (filteredByLocation.length === 0) {
    return (
      <div className="no-photographers">
        <div className="no-results-icon">
          <FaSearch className="icon" />
        </div>
        <h2>No Photographers Found in This Location</h2>
        <p>We couldn't find any photographers in the selected location.</p>
        <p>Try selecting a different location or removing the location filter.</p>
      </div>
    );
  }

  return (
    <div className="owner-list-container">
      {filteredByLocation.map((owner, index) => (
        <div
          key={index}
          className="owner-card"
          onClick={() => {
            handleExplore(owner);
          }}
        >
          <div className="image_container">
            <img
              src={`${Server_url}/owner/business-profile-image/${owner.user_email}?t=${new Date().getTime()}` || user1}
              alt="Owner Avatar"
              className="owner-avatar"
            />
          </div>

          <div className="owner-info">
            <h3><MdCamera className="icon" />{owner.user_name}</h3>
            <p className="email"> <FaEnvelope className="icon" />{owner.user_email}</p>
            {/* <p>{owner.mobile_number}</p> */}
            <p className="location">
              <span>
                <FaMapMarkerAlt className="icon" />
              </span>{" "}
              {owner.business_address || "Not Available"}
            </p>
          </div>
          <div className="explore-button-container">
            <button onClick={() => handleExplore(owner)}>
              {selectedOwner === owner ? "Hide Details" : "Explore"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerList;
