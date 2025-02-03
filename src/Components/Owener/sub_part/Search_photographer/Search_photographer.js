import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Search_photographer.css";
import OwnerList from "./sub_part/Owners_List";
import { Server_url } from "../../../../redux/AllData";

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const [activeSection, setActiveSection] = useState("maharashtra");

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredUsers({ owners: [], packages: [], equipment: [] });
        setIsSearching(false);
        return;
      }

      const fetchData = async () => {
        try {
          const response = await fetch(
            `${Server_url}/owner/search?term=${searchTerm}`
          );
          const data = await response.json();

          setFilteredUsers({
            owners:
              data.owners?.filter((owner) => owner.user_email !== user_email) ||
              [],
            packages: data.packages || [],
            equipment:
              data.equipment?.filter(
                (equip) => equip.user_email !== user_email
              ) || [],
          });
          console.log("Packages", data.packages);
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setIsSearching(false); // End searching
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
        set_all_owner_Data(data.result); // Ensure correct data structure
      } catch (error) {
        console.error("Error fetching owner data:", error);
      }
    };
    fetchOwners();
  }, [user.user_email]);

  const handleKeyDown = (e) => {
    const totalItems = Object.values(filteredUsers).flat().length;

    if (totalItems === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          const allItems = Object.values(filteredUsers).flat();
          const selectedItem = allItems[highlightedIndex];
          alert(
            `Selected Item: ${
              selectedItem.user_email || selectedItem.PackageName
            }`
          );
        }
        break;
      default:
        break;
    }
  };

  const renderItems = (title, items) => {
    if (items.length === 0) return null;

    const allItems = Object.values(filteredUsers).flat();

    return (
      <>
        <div className="recent-searches-title">{title}</div>
        {items.map((item, index) => {
          const globalIndex = allItems.indexOf(item);

          return (
            <div
              key={index}
              className={`search-item ${
                highlightedIndex === globalIndex ? "highlighted" : ""
              }`}
              onClick={() =>
                alert(
                  `Selected ${title.slice(0, -1)}: ${
                    item.user_email || item.PackageName
                  }`
                )
              }
              onMouseEnter={() => setHighlightedIndex(globalIndex)}
            >
              <div className="avatar">{item.avatar}</div>
              <div
                className="user-info"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "5px",
                }}
              >
                <span className="user-name" style={{ display: "flex" }}>
                  {item.user_name || item.package_name || item.name}
                </span>
                <span className="user-role">
                  {title === "Owners"
                    ? `– ${item.user_email}`
                    : `- ${item.Description || item.user_email}`}
                </span>
                {item.package_name && (
                  <div
                    className="package_pricing"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "5px",
                    }}
                  >
                    <p style={{ fontWeight: "700" }}>/ Price -</p> {item.price}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const hasResults =
    filteredUsers.owners.length > 0 ||
    filteredUsers.packages.length > 0 ||
    filteredUsers.equipment.length > 0;

  return (
    <div className="photographer-main-container">
      {/* Navbar */}
      <nav className="photographer-navbar">
        <div className="nav-links">
          <button
            className={`nav-link ${
              activeSection === "maharashtra" ? "active" : ""
            }`}
            onClick={() => setActiveSection("maharashtra")}
          >
            Maharashtra
          </button>
          <button
            className={`nav-link ${
              activeSection === "gujarat" ? "active" : ""
            }`}
            onClick={() => setActiveSection("gujarat")}
          >
            Gujarat
          </button>
          <button
            className={`nav-link ${
              activeSection === "rajasthan" ? "active" : ""
            }`}
            onClick={() => setActiveSection("rajasthan")}
          >
            Rajasthan
          </button>
          <button
            className={`nav-link ${activeSection === "delhi" ? "active" : ""}`}
            onClick={() => setActiveSection("delhi")}
          >
            Delhi
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container-nav">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchTerm !== "" && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="searching-text">Searching...</div>
              ) : (
                <>
                  {renderItems("Owners", filteredUsers.owners)}
                  {renderItems("Packages", filteredUsers.packages)}
                  {renderItems("Equipment", filteredUsers.equipment)}
                  {!hasResults && (
                    <div className="no-results">No results found.</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Sections */}
      <div className="sections-container">
        <OwnerList
          owners={
            all_owner_data?.filter((owner) =>
              owner.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || []
          }
        />
      </div>
    </div>
  );
}

export default Search_photographer;
