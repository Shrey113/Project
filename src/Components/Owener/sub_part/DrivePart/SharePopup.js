import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Server_url, showAcceptToast, showRejectToast } from "../../../../redux/AllData";
import "./SharePopup.css";

const SharePopup = ({ item, onClose, onShare }) => {
    const user = useSelector((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [permissions, setPermissions] = useState({}); // Track permissions for each selected owner

    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim().length < 3 || !user?.user_email) return;

            setIsSearching(true);
            try {
                const response = await fetch(`${Server_url}/team_members/photographers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: searchQuery,
                        user_email: user.user_email,
                    }),
                });

                const data = await response.json();
                // Filter out the current user from search results
                const filteredData = data.filter(owner => owner.user_email !== user.user_email);
                setSearchResults(filteredData);
            } catch (error) {
                console.error("Error searching owners:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const searchTimeout = setTimeout(() => {
            if (searchQuery.trim().length >= 3 && user?.user_email) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 2000); // 2 second delay

        return () => clearTimeout(searchTimeout);
    }, [searchQuery, user?.user_email]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectOwner = (owner) => {
        setSelectedOwners(prev => {
            const isSelected = prev.some(o => o.user_email === owner.user_email);
            if (isSelected) {
                // Remove permissions for unselected owner
                const newPermissions = { ...permissions };
                delete newPermissions[owner.user_email];
                setPermissions(newPermissions);
                return prev.filter(o => o.user_email !== owner.user_email);
            } else {
                // Set default permission (read) for newly selected owner
                setPermissions(prev => ({
                    ...prev,
                    [owner.user_email]: 'read'
                }));
                return [...prev, owner];
            }
        });
    };

    const handlePermissionChange = (ownerEmail, permission) => {
        setPermissions(prev => ({
            ...prev,
            [ownerEmail]: permission
        }));
    };

    const handleShare = async () => {
        if (selectedOwners.length === 0) {
            showRejectToast({ message: "Please select at least one owner to share with" });
            return;
        }

        try {
            const response = await fetch(`${Server_url}/share_drive/share_with_permission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: item.type === 'file' ? item.file_id : item.folder_id,
                    item_type: item.type,
                    shared_by: user.user_email,
                    share_with: selectedOwners.map(owner => ({
                        email: owner.user_email,
                        permission: permissions[owner.user_email] || 'read'
                    })),
                }),
            });

            if (response.ok) {
                showAcceptToast({ message: "Item shared successfully" });
                onShare();
                onClose();
            } else {
                const errorData = await response.json();
                showRejectToast({ message: errorData.error || "Failed to share item" });
            }
        } catch (error) {
            console.error("Error sharing item:", error);
            showRejectToast({ message: "Error sharing item. Please try again." });
        }
    };

    return (
        <div className="share-popup-overlay" onClick={(e) => {
            if (e.target.className === "share-popup-overlay") {
                onClose();
            }
        }}>
            <div className="share-popup-content">
                <h3>Share "{item.name}"</h3>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search owners by name, email..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    {isSearching && <div className="search-spinner"></div>}
                </div>

                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                    <div className="search-hint">Enter at least 3 characters to search</div>
                )}

                <div className="search-results">
                    {searchResults.length === 0 && searchQuery.trim().length >= 3 && !isSearching ? (
                        <div className="no-results">No owners found</div>
                    ) : (
                        searchResults.map((owner) => (
                            <div
                                key={owner.user_email}
                                className={`search-result-item ${selectedOwners.some(o => o.user_email === owner.user_email) ? 'selected' : ''}`}
                                onClick={() => handleSelectOwner(owner)}
                            >
                                <div className="result-avatar">
                                    <img src={`${Server_url}/owner/profile-image/${owner.user_email}`} alt={owner.user_name} />
                                </div>
                                <div className="result-info">
                                    <div className="result-name">{owner.user_name}</div>
                                    <div className="result-email">{owner.user_email}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedOwners.length > 0 && (
                    <div className="selected-owners">
                        <h4>Selected Owners</h4>
                        <div className="selected-owners-list">
                            {selectedOwners.map((owner) => (
                                <div key={owner.user_email} className="selected-owner">
                                    <img src={`${Server_url}/owner/profile-image/${owner.user_email}`} alt={owner.user_name} />
                                    <span>{owner.user_name}</span>
                                    <div className="permission-selector">
                                        <select
                                            value={permissions[owner.user_email] || 'read'}
                                            onChange={(e) => handlePermissionChange(owner.user_email, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="read">Can view</option>
                                            <option value="write">Can edit</option>
                                            <option value="admin">Is owner</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleSelectOwner(owner)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="popup-actions">
                    <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn btn-share" onClick={handleShare}>
                        Share with {selectedOwners.length} {selectedOwners.length === 1 ? 'owner' : 'owners'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePopup; 