import React, { useState, useEffect, useRef } from "react";
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
    const [sendNotification, setSendNotification] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [openPermissionDropdown, setOpenPermissionDropdown] = useState(null);
    const searchContainerRef = useRef(null);
    const permissionDropdownRefs = useRef({});

    useEffect(() => {
        const performSearch = async () => {
            if (!user?.user_email) return;

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
                if (filteredData.length > 0) {
                    setShowResults(true);
                }
            } catch (error) {
                console.error("Error searching owners:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const searchTimeout = setTimeout(() => {
            if (searchQuery.trim().length >= 2 && user?.user_email) {
                performSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(searchTimeout);
    }, [searchQuery, user?.user_email]);

    // Handle clicks outside the search container and permission dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close search results if clicked outside search container
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowResults(false);
            }

            // Close permission dropdown if clicked outside
            if (openPermissionDropdown &&
                permissionDropdownRefs.current[openPermissionDropdown] &&
                !permissionDropdownRefs.current[openPermissionDropdown].contains(event.target)) {
                setOpenPermissionDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openPermissionDropdown]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim().length > 0) {
            setShowResults(true);
        }
    };

    const handleSearchInputFocus = () => {
        if (searchResults.length > 0 && searchQuery.trim().length > 0) {
            setShowResults(true);
        }
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
        // Don't clear search query or hide results
    };

    const handlePermissionChange = (ownerEmail, permission) => {
        setPermissions(prev => ({
            ...prev,
            [ownerEmail]: permission
        }));
        setOpenPermissionDropdown(null);
    };

    const togglePermissionDropdown = (ownerEmail) => {
        if (openPermissionDropdown === ownerEmail) {
            setOpenPermissionDropdown(null);
        } else {
            setOpenPermissionDropdown(ownerEmail);
        }
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
                    send_notification: sendNotification
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

    const getPermissionLabel = (permission) => {
        switch (permission) {
            case 'read': return 'Can view';
            case 'write': return 'Can edit';
            case 'admin': return 'Is owner';
            default: return 'Can view';
        }
    };

    // Show filtered search results
    const renderSearchResults = () => {
        if (!showResults) return null;

        // Filter out already selected users
        const filteredResults = searchResults.filter(
            result => !selectedOwners.some(selected => selected.user_email === result.user_email)
        );

        return (
            <div className="search-results-dropdown">
                {isSearching ? (
                    <div className="searching-indicator">Searching...</div>
                ) : filteredResults.length > 0 ? (
                    filteredResults.map(owner => (
                        <div
                            key={owner.user_email}
                            className="search-result-item"
                            onClick={() => handleSelectOwner(owner)}
                        >
                            <div className="result-avatar">
                                <img
                                    src={`${Server_url}/owner/profile-image/${owner.user_email}`}
                                    alt={owner.user_name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/40";
                                    }}
                                />
                            </div>
                            <div className="result-info">
                                <div className="result-name">{owner.user_name}</div>
                                <div className="result-email">{owner.user_email}</div>
                            </div>
                        </div>
                    ))
                ) : searchQuery.trim() ? (
                    <div className="no-results">No matching owners found</div>
                ) : null}
            </div>
        );
    };

    // Render permission dropdown
    const renderPermissionDropdown = (owner) => {
        const currentPermission = permissions[owner.user_email] || 'read';

        return (
            <div
                className="permission-selector-container"
                ref={el => permissionDropdownRefs.current[owner.user_email] = el}
            >
                <button
                    className="permission-dropdown-button"
                    onClick={() => togglePermissionDropdown(owner.user_email)}
                >
                    {getPermissionLabel(currentPermission)}
                    <span className="dropdown-arrow">▼</span>
                </button>

                {openPermissionDropdown === owner.user_email && (
                    <div className="permission-options-dropdown">
                        <div
                            className={`permission-option ${currentPermission === 'read' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(owner.user_email, 'read')}
                        >
                            Can view
                        </div>
                        <div
                            className={`permission-option ${currentPermission === 'write' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(owner.user_email, 'write')}
                        >
                            Can edit
                        </div>
                        <div
                            className={`permission-option ${currentPermission === 'admin' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(owner.user_email, 'admin')}
                        >
                            Is owner
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="share-popup-overlay" onClick={(e) => {
            if (e.target.className === "share-popup-overlay") {
                onClose();
            }
        }}>
            <div className="share-popup-content">
                <div className="share-popup-header">
                    <h3>Share "{item.name}"</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="share-body">
                    <div className="search-container" ref={searchContainerRef}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Add people and groups"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onFocus={handleSearchInputFocus}
                        />
                        {isSearching ? (
                            <div className="search-spinner"></div>
                        ) : (
                            <div className="search-icon">🔍</div>
                        )}
                        {renderSearchResults()}
                    </div>

                    <div className="notification-option">
                        <label className="notification-checkbox">
                            <input
                                type="checkbox"
                                checked={sendNotification}
                                onChange={() => setSendNotification(!sendNotification)}
                            />
                            <span className="checkbox-text">Send notification email</span>
                        </label>
                    </div>

                    {(selectedOwners.length > 0) && (
                        <div className="people-with-access">
                            <h4>People with access</h4>
                            <div className="access-list">
                                {selectedOwners.map(owner => (
                                    <div key={owner.user_email} className="access-item">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <img
                                                    src={`${Server_url}/owner/profile-image/${owner.user_email}`}
                                                    alt={owner.user_name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/40";
                                                    }}
                                                />
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">{owner.user_name}</div>
                                                <div className="user-email">{owner.user_email}</div>
                                            </div>
                                        </div>
                                        <div className="user-actions">
                                            {renderPermissionDropdown(owner)}
                                            <button
                                                className="remove-user-btn"
                                                onClick={() => handleSelectOwner(owner)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="popup-actions">
                    <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className={`btn btn-share ${selectedOwners.length === 0 ? 'disabled' : ''}`}
                        onClick={handleShare}
                        disabled={selectedOwners.length === 0}
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePopup; 