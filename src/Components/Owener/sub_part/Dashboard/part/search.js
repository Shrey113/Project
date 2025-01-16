import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './search.css';
import { Server_url } from '../../../../../redux/AllData';

function Search() {
  const user = useSelector((state) => state.user);
  const user_email = user.user_email;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState({ owners: [], packages: [], equipment: [] });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true); 
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredUsers({ owners: [], packages: [], equipment: [] });
        setIsSearching(false);
        return;
      }

      const fetchData = async () => {
        
        try {
          const response = await fetch(`${Server_url}/owner/search?term=${searchTerm}`);
          const data = await response.json();

          setFilteredUsers({
            owners: data.owners?.filter(owner => owner.user_email !== user_email) || [],
            packages: data.packages || [],
            equipment: data.equipment?.filter(equip => equip.user_email !== user_email) || [],
          });
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

  const handleKeyDown = (e) => {
    const totalItems = Object.values(filteredUsers).flat().length;

    if (totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          const allItems = Object.values(filteredUsers).flat();
          const selectedItem = allItems[highlightedIndex];
          alert(`Selected Item: ${selectedItem.user_email || selectedItem.PackageName}`);
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
              className={`search-item ${highlightedIndex === globalIndex ? 'highlighted' : ''}`}
              onClick={() =>
                alert(
                  `Selected ${title.slice(0, -1)}: ${item.user_email || item.PackageName}`
                )
              }
              onMouseEnter={() => setHighlightedIndex(globalIndex)}
            >
              <div className="avatar">{item.avatar}</div>
              <div className="user-info">
                <span className="user-name">{item.user_name || item.PackageName}</span>
                <span className="user-role">
                  {title === 'Owners'
                    ? `– ${item.user_email}`
                    : `- ${item.Description || item.user_email}`}
                </span>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {searchTerm !== '' && (
          <>
            {isSearching ? (
              <div className="searching-text">Searching...</div>
            ) : hasResults ? (
              <>
                {renderItems('Owners', filteredUsers.owners)}
                {renderItems('Packages', filteredUsers.packages)}
                {renderItems('Equipment', filteredUsers.equipment)}
              </>
            ) : (
              <div className="no-results">No results found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
