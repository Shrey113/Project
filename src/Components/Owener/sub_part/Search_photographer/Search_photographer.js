import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Search_photographer.css";
import OwnerList from "./sub_part/Owners_List";
import { Server_url } from "../../../../redux/AllData";

function Search_photographer({ searchTerm,
   selectedLocation = 'all' }) {
  const user = useSelector((state) => state.user);
  const user_email = user.user_email;
  const [all_owner_data, set_all_owner_Data] = useState();
  const [filteredUsers, setFilteredUsers] = useState({
    owners: [],
    packages: [],
    equipment: [],
  });

  const [isLoading, setIsLoading] = useState(false);

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
