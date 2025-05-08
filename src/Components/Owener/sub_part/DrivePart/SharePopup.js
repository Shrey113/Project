import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Server_url, showAcceptToast, showRejectToast, APP_URL } from "../../../../redux/AllData";
import "./SharePopup.css";

const SharePopup = ({ item, onClose, onShare }) => {
    const user = useSelector((state) => state.user);
    
    // State for access mode
    const [accessMode, setAccessMode] = useState("restricted"); // "anyone" or "restricted"
    const [anyonePermission, setAnyonePermission] = useState("read"); // "read", "write", or "admin"
    const [isSharing, setIsSharing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for wizard steps
    const [currentStep, setCurrentStep] = useState(1); // 1: Select sharing mode, 2: Add people
    
    // State for internal users
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [sendNotification, setSendNotification] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [openPermissionDropdown, setOpenPermissionDropdown] = useState(null);
    
    // State for external users
    const [showAddExternal, setShowAddExternal] = useState(false);
    const [externalUsers, setExternalUsers] = useState([]);
    const [newExternalUser, setNewExternalUser] = useState({
        username: "",
        email: "",
        password: "",
        permission: "read"
    });

    // State for current shares
    const [currentShares, setCurrentShares] = useState([]);
    const [isPublic, setIsPublic] = useState(false);
    
    // New state for revocation functionality
    const [isRevoking, setIsRevoking] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isRevokingPublic, setIsRevokingPublic] = useState(false);
    const [showConfirmRevokePublic, setShowConfirmRevokePublic] = useState(false);
    const [shareSuccessInfo, setShareSuccessInfo] = useState(null);

    // Add state for public link
    const [publicLinkInfo, setPublicLinkInfo] = useState(null);
    const [isFetchingLink, setIsFetchingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Add state variable for warning
    const [restricedUsersCount, setRestricedUsersCount] = useState(0);
    const [showRestrictedWarning, setShowRestrictedWarning] = useState(false);

    // New state for revoking all restricted access
    const [showConfirmRevokeAll, setShowConfirmRevokeAll] = useState(false);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    // Refs
    const searchContainerRef = useRef(null);
    const permissionDropdownRefs = useRef({});
    const externalFormRef = useRef(null);

    // Move to next step
    const goToNextStep = () => {
        if (accessMode === "anyone") {
            // For "Anyone", proceed directly to sharing
            handleShare();
        } else {
            // For "Restricted", move to the people selection step
            setCurrentStep(2);
        }
    };

    // Go back to the first step
    const goToPreviousStep = () => {
        setCurrentStep(1);
    };

    // Fetch current shares when component mounts
    useEffect(() => {
        const fetchCurrentShares = async () => {
            if (!item || !item.type) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${Server_url}/share_drive/get-current-shares`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        item_id: item.type === 'file' ? item.file_id : item.folder_id,
                        item_type: item.type
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch current shares");
                }

                const data = await response.json();
                
                // Set already shared users
                const currentShares = data.current_shares || [];
                setCurrentShares(currentShares);
                
                // Count total number of restricted users for warning message
                setRestricedUsersCount(currentShares.length);
                
                // If item is already public, set the access mode to "anyone"
                if (data.is_public) {
                    setIsPublic(true);
                    setAccessMode("anyone");
                }
                
                // Initialize already shared internal users
                const internalShares = currentShares.filter(share => !share.is_external);
                
                if (internalShares.length > 0) {
                    const internalOwners = internalShares.map(share => ({
                        user_email: share.email,
                        user_name: share.name,
                        profile_image: share.profile_image
                    }));
                    
                    setSelectedOwners(internalOwners);
                    
                    // Set permissions for each user
                    const permissionsObj = {};
                    internalShares.forEach(share => {
                        permissionsObj[share.email] = share.permission;
                    });
                    setPermissions(permissionsObj);
                }
                
                // Initialize already shared external users
                const externalShares = currentShares.filter(share => share.is_external);
                
                if (externalShares.length > 0) {
                    const formattedExtUsers = externalShares.map(share => ({
                        username: share.name,
                        email: share.email,
                        password: "********", // Placeholder, we don't have the actual password
                        permission: share.permission
                    }));
                    
                    setExternalUsers(formattedExtUsers);
                }
                
            } catch (error) {
                console.error("Error fetching current shares:", error);
                showRejectToast({ message: "Failed to load current sharing settings" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentShares();
    }, [item]);

    // Add another useEffect to fetch public link when isPublic changes
    useEffect(() => {
            // Add a function to fetch public link when "Anyone with the link" is selected
    const fetchPublicLink = async () => {
        if (!isPublic || publicLinkInfo) return;
        
        setIsFetchingLink(true);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/get-public-link`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: item.type === 'file' ? item.file_id : item.folder_id,
                    item_type: item.type
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get public link");
            }

            const data = await response.json();
            setPublicLinkInfo(data);
        } catch (error) {
            console.error("Error fetching public link:", error);
        } finally {
            setIsFetchingLink(false);
        }
    };
        if (isPublic && accessMode === "anyone") {
            fetchPublicLink();
        }
    }, [isPublic, accessMode, item,publicLinkInfo]);

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
                let filteredData = data.filter(owner => owner.user_email !== user.user_email);
                
                // Also filter out users who already have access
                const existingEmails = currentShares
                    .filter(share => !share.is_external)
                    .map(share => share.email);
                
                filteredData = filteredData.filter(
                    owner => !existingEmails.includes(owner.user_email) && 
                           !selectedOwners.some(o => o.user_email === owner.user_email)
                );
                
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
    }, [searchQuery, user?.user_email, currentShares, selectedOwners]);

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
            
            // Close external user form if clicked outside
            if (showAddExternal && 
                externalFormRef.current && 
                !externalFormRef.current.contains(event.target)) {
                setShowAddExternal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openPermissionDropdown, showAddExternal]);

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
                
                const updatedList = prev.filter(o => o.user_email !== owner.user_email);
                // Update restricted users count
                setRestricedUsersCount(updatedList.length + externalUsers.length);
                return updatedList;
            } else {
                // Set default permission
                setPermissions(prev => ({
                    ...prev,
                    [owner.user_email]: "read"
                }));
                
                const updatedList = [...prev, owner];
                // Update restricted users count
                setRestricedUsersCount(updatedList.length + externalUsers.length);
                return updatedList;
            }
        });
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
    
    const handleAddExternalUser = () => {
        // Check if this email is already shared with
        const isAlreadyShared = currentShares.some(
            share => share.is_external && share.email.toLowerCase() === newExternalUser.email.toLowerCase()
        );
        
        if (isAlreadyShared) {
            showRejectToast({ message: "This external user already has access to this item" });
            return;
        }
        
        // Check if this email is already in the list
        const isDuplicate = externalUsers.some(
            user => user.email.toLowerCase() === newExternalUser.email.toLowerCase()
        );
        
        if (isDuplicate) {
            showRejectToast({ message: "This external user is already in your sharing list" });
            return;
        }
        
        // Validate external user data
        if (!newExternalUser.username || !newExternalUser.email || !newExternalUser.password) {
            showRejectToast({ message: "Please fill all required fields" });
            return;
        }
        
        // Add to external users list
        setExternalUsers([...externalUsers, {...newExternalUser}]);
        
        // Reset form
        setNewExternalUser({
            username: "",
            email: "",
            password: "",
            permission: "read"
        });
        
        // Close form
        setShowAddExternal(false);
    };
    
    const handleRemoveExternalUser = (email) => {
        // Check if this is an existing share that we can't modify
        const isExistingShare = currentShares.some(
            share => share.is_external && share.email === email
        );
        
        if (isExistingShare) {
            showRejectToast({ message: "Cannot remove an existing share. Please contact your administrator." });
            return;
        }
        
        const updatedList = externalUsers.filter(user => user.email !== email);
        setExternalUsers(updatedList);
        // Update restricted users count
        setRestricedUsersCount(selectedOwners.length + updatedList.length);
    };
    
    const handleExternalPermissionChange = (email, permission) => {
        setExternalUsers(externalUsers.map(user => 
            user.email === email ? {...user, permission} : user
        ));
    };

    const handleShare = async () => {
        if (accessMode === "restricted" && selectedOwners.length === 0 && externalUsers.length === 0) {
            showRejectToast({ message: "Please select at least one user to share with" });
            return;
        }

        setIsSharing(true);

        try {
            // First handle internal users (using existing API)
            if (accessMode === "restricted" && selectedOwners.length > 0) {
                // Filter out already shared users
                const existingEmails = currentShares
                    .filter(share => !share.is_external)
                    .map(share => share.email);
                
                const newShares = selectedOwners.filter(
                    owner => !existingEmails.includes(owner.user_email)
                );
                
                if (newShares.length > 0) {
                    const response = await fetch(`${Server_url}/share_drive/share_with_permission`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            item_id: item.type === 'file' ? item.file_id : item.folder_id,
                            item_type: item.type,
                            shared_by: user.user_email,
                            share_with: newShares.map(owner => ({
                                email: owner.user_email,
                                permission: permissions[owner.user_email] || "read"
                            })),
                            send_notification: sendNotification
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to share with internal users");
                    }
                }
            }
            
            // Handle external users (needs new API endpoint)
            if (accessMode === "restricted" && externalUsers.length > 0) {
                // Filter out already shared external users
                const existingExternalEmails = currentShares
                    .filter(share => share.is_external)
                    .map(share => share.email);
                
                const newExternalShares = externalUsers.filter(
                    user => !existingExternalEmails.includes(user.email)
                );
                
                if (newExternalShares.length > 0) {
                    const response = await fetch(`${Server_url}/share_drive/share_with_external`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            item_id: item.type === 'file' ? item.file_id : item.folder_id,
                            item_type: item.type,
                            shared_by: user.user_email,
                            external_users: newExternalShares,
                            send_notification: sendNotification
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to share with external users");
                    }
                }
            }
            
            // Handle "anyone" access mode
            let publicLinkData = null;
            if (accessMode === "anyone") {
                const response = await fetch(`${Server_url}/share_drive/share_with_anyone`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        item_id: item.type === 'file' ? item.file_id : item.folder_id,
                        item_type: item.type,
                        shared_by: user.user_email,
                        permission: anyonePermission
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to share with anyone");
                }
                
                // Get public link data
                publicLinkData = await response.json();
            }

            const successMessage = isPublic && accessMode === "anyone" 
                ? "Link sharing permissions updated successfully" 
                : "Item shared successfully";
            
            if (accessMode === "anyone") {
                // Show success popup with the link
                setShareSuccessInfo({
                    title: isPublic ? "Sharing permissions updated" : "Link sharing enabled",
                    message: isPublic 
                        ? `The permissions for "${item.name || item.file_name || item.folder_name}" have been updated to ${getPermissionLabel(anyonePermission)}.`
                        : `Anyone with the link can now ${anyonePermission === 'read' ? 'view' : anyonePermission === 'write' ? 'edit' : 'manage'} "${item.name || item.file_name || item.folder_name}".`,
                    link: publicLinkData?.public_link || get_link_for_anyone(),
                    access_token: publicLinkData?.access_token
                });
            } else {
                showAcceptToast({ message: successMessage });
                onShare();
                onClose();
            }
        } catch (error) {
            console.error("Error sharing item:", error);
            showRejectToast({ message: error.message || "Error sharing item. Please try again." });
            setIsSharing(false);
        } finally {
            setIsSharing(false);
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

        // Filter out already selected users and users who already have access
        const existingEmails = [
            ...currentShares.filter(share => !share.is_external).map(share => share.email),
            ...selectedOwners.map(owner => owner.user_email)
        ];
        
        const filteredResults = searchResults.filter(
            result => !existingEmails.includes(result.user_email)
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
                    <div className="no-results">No matching users found</div>
                ) : null}
            </div>
        );
    };

    // Render permission dropdown
    const renderPermissionDropdown = (ownerEmail, currentPermission) => {
        // Check if this is a pre-existing share
        const isExistingShare = currentShares.some(
            share => !share.is_external && share.email === ownerEmail
        );
        
        return (
            <div
                className="permission-selector-container"
                ref={el => permissionDropdownRefs.current[ownerEmail] = el}
            >
                <button
                    className={`permission-dropdown-button ${isExistingShare ? 'existing-share' : ''}`}
                    onClick={() => togglePermissionDropdown(ownerEmail)}
                    disabled={isExistingShare}
                >
                    {getPermissionLabel(currentPermission)}
                    <span className="dropdown-arrow">▼</span>
                </button>

                {openPermissionDropdown === ownerEmail && (
                    <div className="permission-options-dropdown">
                        <div
                            className={`permission-option ${currentPermission === 'read' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(ownerEmail, 'read')}
                        >
                            Can view
                        </div>
                        <div
                            className={`permission-option ${currentPermission === 'write' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(ownerEmail, 'write')}
                        >
                            Can edit
                        </div>
                        <div
                            className={`permission-option ${currentPermission === 'admin' ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(ownerEmail, 'admin')}
                        >
                            Is owner
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const renderExternalUserForm = () => {
        return (
            <div className="external-user-form" ref={externalFormRef}>
                <h4>Add External User</h4>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={newExternalUser.username} 
                        onChange={e => setNewExternalUser({...newExternalUser, username: e.target.value})}
                        placeholder="Enter username"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={newExternalUser.email} 
                        onChange={e => setNewExternalUser({...newExternalUser, email: e.target.value})}
                        placeholder="Enter email address"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={newExternalUser.password} 
                        onChange={e => setNewExternalUser({...newExternalUser, password: e.target.value})}
                        placeholder="Create password"
                    />
                </div>
                <div className="form-group">
                    <label>Permission</label>
                    <select 
                        value={newExternalUser.permission}
                        onChange={e => setNewExternalUser({...newExternalUser, permission: e.target.value})}
                        className="permission-select"
                    >
                        <option value="read">Can view</option>
                        <option value="write">Can edit</option>
                        <option value="admin">Is owner</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn btn-add" onClick={handleAddExternalUser}>
                        Add User
                    </button>
                    <button type="button" className="btn btn-cancel" onClick={() => setShowAddExternal(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    };



    // Update the get_link_for_anyone function
    const get_link_for_anyone = () => {
        if (publicLinkInfo && publicLinkInfo.public_link) {
            return publicLinkInfo.public_link;
        }
        return `${APP_URL}/share/${item.type === 'file' ? item.file_id : item.folder_id}`;
    };

    // Update the copy link function
    const handleCopyLink = () => {
        const linkText = get_link_for_anyone();
        navigator.clipboard.writeText(linkText).then(() => {
            setLinkCopied(true);
            showAcceptToast({ message: "Link copied to clipboard!" });
            
            // Reset the copied state after 2 seconds
            setTimeout(() => {
                setLinkCopied(false);
            }, 2000);
        }).catch(err => {
            showRejectToast({ message: "Failed to copy: " + err });
        });
    };

    // Update the copylink-section in renderStepOne
    const renderCopyLinkSection = () => {
        return (
            <div className="copylink-section">
                {isFetchingLink ? (
                    <div className="copylink-loading">
                        <div className="copylink-spinner"></div>
                        <span>Fetching link...</span>
                    </div>
                ) : (
                    <>
                        <div className="copylink-input-container">
                            <input
                                type="text"
                                value={get_link_for_anyone()}
                                readOnly
                                className="copylink-input"
                                id={`copyInput-${item.type === 'file' ? item.file_id : item.folder_id}`}
                            />
                            <button
                                className={`copylink-button ${linkCopied ? 'copied' : ''}`}
                                onClick={handleCopyLink}
                            >
                                {linkCopied ? (
                                    <>
                                        <span className="copy-icon">✓</span>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <span className="copy-icon">📋</span>
                                        Copy link
                                    </>
                                )}
                            </button>
                        </div>
                        
                    </>
                )}
            </div>
        );
    };

    // Add function to handle access mode change with validations
    const handleAccessModeChange = (mode) => {
        if (mode === "anyone" && !isPublic) {
            if (restricedUsersCount > 0) {
                setShowRestrictedWarning(true);
                return;
            }
        }
        
        setAccessMode(mode);
        setShowRestrictedWarning(false);
    };

    // Add function to close restricted warning
    const closeRestrictedWarning = () => {
        setShowRestrictedWarning(false);
    };

    // Add function to render restricted warning modal
    const renderRestrictedWarning = () => {
        if (!showRestrictedWarning) return null;
        
        return (
            <div className="confirm-modal-overlay">
                <div className="confirm-modal">
                    <div className="confirm-modal-title">Remove Shared Users First</div>
                    <div className="confirm-modal-message">
                        You currently have {restricedUsersCount} user{restricedUsersCount !== 1 ? 's' : ''} with restricted access to this {item.type}.
                        You must remove all restricted users before switching to "Anyone with the link" access.
                    </div>
                    <div className="restricted-warning-info">
                        <p>This is because restricted sharing and public sharing are different modes that cannot be used together.</p>
                        <p>You have these options:</p>
                        <ul>
                            <li>Remove all restricted users to enable link sharing</li>
                            <li>Keep using restricted sharing with specific people</li>
                        </ul>
                    </div>
                    {renderQuickActionButtons()}
                </div>
            </div>
        );
    };

    // Function to remove all restricted users from this item
    const handleRemoveAllRestrictedUsers = () => {
        setIsRevoking(true);
        
        // Create a modal showing the impact of this action
        setShowConfirmRevokeAll(true);
    };
    
    // Render confirmation modal for revoking all restricted access
    const renderRevokeAllConfirmModal = () => {
        if (!showConfirmRevokeAll) return null;
        
        return (
            <div className="confirm-modal-overlay">
                <div className="confirm-modal">
                    <div className="confirm-modal-title">Revoke All Restricted Access</div>
                    <div className="confirm-modal-message">
                        This will remove all {restricedUsersCount} user{restricedUsersCount !== 1 ? 's' : ''} who currently have access.
                        They will no longer be able to access this {item.type}. This cannot be undone.
                    </div>
                    <div className="confirm-modal-actions">
                        <button 
                            className="confirm-btn-cancel" 
                            onClick={() => {
                                setShowConfirmRevokeAll(false);
                                setIsRevoking(false);
                            }}
                            disabled={isRevokingAll}
                        >
                            Cancel
                        </button>
                        <button 
                            className="confirm-btn-delete" 
                            onClick={confirmRevokeAllUsers}
                            disabled={isRevokingAll}
                        >
                            {isRevokingAll ? "Revoking..." : "Revoke All Access"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    // Function to actually revoke all restricted users
    const confirmRevokeAllUsers = async () => {
        setIsRevokingAll(true);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/revoke-all-restricted-access`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: item.type === 'file' ? item.file_id : item.folder_id,
                    item_type: item.type
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to revoke all access");
            }
            
            const data = await response.json();
            
            // Update local state
            setRestricedUsersCount(0);
            setCurrentShares(currentShares.filter(share => share.is_public));
            setSelectedOwners([]);
            setExternalUsers([]);
            
            // Show success message
            showAcceptToast({ message: data.message || "All restricted access revoked successfully" });
            
            // Now we can switch to "anyone" access mode
            setAccessMode("anyone");
            
        } catch (error) {
            console.error("Error revoking all access:", error);
            showRejectToast({ message: error.message || "Failed to revoke all access. Please try again." });
        } finally {
            setIsRevokingAll(false);
            setShowConfirmRevokeAll(false);
            setShowRestrictedWarning(false);
        }
    };
    
    // Add a helper method to render revoke all button in the restricted warning
    const renderQuickActionButtons = () => {
        return (
            <div className="restricted-warning-actions">
                <button 
                    className="btn-quick-action secondary" 
                    onClick={closeRestrictedWarning}
                >
                    Keep Restricted Access
                </button>
                <button 
                    className="btn-quick-action primary" 
                    onClick={handleRemoveAllRestrictedUsers}
                >
                    Remove All Restricted Users
                </button>
            </div>
        );
    };

    // Render the first step - Access mode selection
    const renderStepOne = () => {
        return (
            <>
                <div className="section-title">Who can access this {item.type}</div>
                <div className="access-mode-selector">
                    <div className="radio-group">
                        <label className={`radio-label ${accessMode === "anyone" ? 'active' : ''} ${restricedUsersCount > 0 && !isPublic ? 'disabled' : ''}`}>
                            <input
                                type="radio"
                                name="accessMode"
                                value="anyone"
                                checked={accessMode === "anyone"}
                                onChange={() => handleAccessModeChange("anyone")}
                                disabled={restricedUsersCount > 0 && !isPublic}
                            />
                            <span className="radio-custom"></span>
                            <div className="radio-text">
                                <span className="radio-title">Anyone with the link &nbsp; {isPublic && <span className="already-shared-badge">Already shared</span>}</span>
                                <span className="radio-desc">Anyone on the internet with the link can access</span>
                                {restricedUsersCount > 0 && !isPublic && (
                                    <span className="radio-restriction">
                                        Remove {restricedUsersCount} shared user{restricedUsersCount !== 1 ? 's' : ''} first
                                    </span>
                                )}
                            </div>
                        </label>
                        
                        {accessMode === "anyone" && (
                            <div className="permission-options">
                                <div className="permission-options-title">
                                    Permission level:
                                    {isPublic && <span className="update-permission-note">Updating existing link permissions</span>}
                                </div>
                                <div className="permission-radio-group">
                                    <label className="permission-radio-label">
                                        <input
                                            type="radio"
                                            name="anyonePermission"
                                            value="read"
                                            checked={anyonePermission === "read"}
                                            onChange={() => setAnyonePermission("read")}
                                        />
                                        <span className="permission-label">View</span>
                                    </label>
                                    <label className="permission-radio-label">
                                        <input
                                            type="radio"
                                            name="anyonePermission"
                                            value="write"
                                            checked={anyonePermission === "write"}
                                            onChange={() => setAnyonePermission("write")}
                                        />
                                        <span className="permission-label">Edit</span>
                                    </label>
                                    <label className="permission-radio-label">
                                        <input
                                            type="radio"
                                            name="anyonePermission"
                                            value="admin"
                                            checked={anyonePermission === "admin"}
                                            onChange={() => setAnyonePermission("admin")}
                                        />
                                        <span className="permission-label">Owner</span>
                                    </label>
                                </div>
                                
                                {renderCopyLinkSection()}
                                
                                {isPublic && (
                                    <button
                                        className="revoke-public-access"
                                        onClick={confirmRevokePublicAccess}
                                    >
                                        Revoke public access
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <label className={`radio-label 
                                ${accessMode === "restricted" ? 'active' : ''}
                                ${isPublic ? 'disabled' : ''}`}>
                            <input
                                type="radio"
                                name="accessMode"
                                value="restricted"
                                checked={accessMode === "restricted"}
                                onChange={() => handleAccessModeChange("restricted")}
                                disabled={isPublic}
                            />
                            <span className="radio-custom"></span>
                            <div className="radio-text">
                                <span className="radio-title">Restricted</span>
                                <span className="radio-desc">Only people you specify can access</span>
                                {isPublic && <span className="radio-restriction">Revoke public access first</span>}
                            </div>
                        </label>
                    </div>
                </div>
            </>
        );
    };
    
    // Render the second step - People selection
    const renderStepTwo = () => {
        return (
            <>
                <div className="step-header">
                    <button className="back-button" onClick={goToPreviousStep}>
                        <span className="back-arrow">{"<"}</span>
                    </button>
                    <h3 className="step-title">Add people to "{item.name || item.file_name || item.folder_name}"</h3>
                </div>
                
                <div className="search-section">
                    <div className="search-container" ref={searchContainerRef}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter name or email address"
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

                    {renderSelectedOwners()}
                    {renderExternalUsers()}

                    <div className="notification-option">
                        <label className="notification-checkbox">
                            <input
                                type="checkbox"
                                checked={sendNotification}
                                onChange={() => setSendNotification(!sendNotification)}
                            />
                            <span className="checkbox-text">Notify people via email</span>
                        </label>
                    </div>
                </div>
            </>
        );
    };

    // New function to handle revoking access
    const handleRevokeAccess = async () => {
        if (!userToDelete) return;
        
        setIsRevoking(true);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/revoke-access`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: item.type === 'file' ? item.file_id : item.folder_id,
                    item_type: item.type,
                    email: userToDelete.email,
                    is_external: userToDelete.is_external
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to revoke access");
            }
            
            // Remove user from UI
            if (userToDelete.is_external) {
                setExternalUsers(externalUsers.filter(user => user.email !== userToDelete.email));
            } else {
                setSelectedOwners(selectedOwners.filter(owner => owner.user_email !== userToDelete.email));
                // Remove from permissions
                const newPermissions = { ...permissions };
                delete newPermissions[userToDelete.email];
                setPermissions(newPermissions);
            }
            
            // Remove from current shares
            setCurrentShares(currentShares.filter(share => 
                share.email !== userToDelete.email || 
                share.is_external !== userToDelete.is_external
            ));
            
            showAcceptToast({ message: "Access revoked successfully" });
            
        } catch (error) {
            console.error("Error revoking access:", error);
            showRejectToast({ message: error.message || "Error revoking access. Please try again." });
        } finally {
            setIsRevoking(false);
            setShowConfirmDelete(false);
            setUserToDelete(null);
        }
    };
    
    // New function to handle revoking public access
    const handleRevokePublicAccess = async () => {
        setIsRevokingPublic(true);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/revoke-public-access`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: item.type === 'file' ? item.file_id : item.folder_id,
                    item_type: item.type
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to revoke public access");
            }
            
            // Update state
            setIsPublic(false);
            setAccessMode("restricted");
            
            showAcceptToast({ message: "Public access revoked successfully" });
            
        } catch (error) {
            console.error("Error revoking public access:", error);
            showRejectToast({ message: error.message || "Error revoking public access. Please try again." });
        } finally {
            setIsRevokingPublic(false);
            setShowConfirmRevokePublic(false);
        }
    };
    
    // Function to show deletion confirmation
    const confirmDeleteAccess = (user, isExternal) => {
        setUserToDelete({
            name: isExternal ? user.username : user.user_name,
            email: isExternal ? user.email : user.user_email,
            is_external: isExternal
        });
        setShowConfirmDelete(true);
    };
    
    // Function to show public access revocation confirmation
    const confirmRevokePublicAccess = () => {
        setShowConfirmRevokePublic(true);
    };

    // Modify the internal users section in renderStepTwo to add delete buttons
    const renderSelectedOwners = () => {
        if (selectedOwners.length === 0) return null;
        
        return (
            <div className="people-with-access">
                <div className="section-title">Internal Users</div>
                <div className="access-list">
                    {selectedOwners.map(owner => {
                        // Check if this is a pre-existing share
                        const isExistingShare = currentShares.some(
                            share => !share.is_external && share.email === owner.user_email
                        );
                        
                        return (
                            <div key={owner.user_email} className={`access-item ${isExistingShare ? 'existing-share' : ''}`}>
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
                                        <div className="user-name">
                                            {owner.user_name}
                                        </div>
                                        <div className="user-email">{owner.user_email}</div>
                                    </div>
                                </div>
                                <div className="user-actions">
                                    {renderPermissionDropdown(owner.user_email, permissions[owner.user_email] || "read")}
                                    
                                    {/* Replace the original remove button with two buttons */}
                                    {isExistingShare ? (
                                        <button
                                            className="remove-access-btn"
                                            onClick={() => confirmDeleteAccess(owner, false)}
                                            title="Revoke access"
                                        >
                                            🗑️
                                        </button>
                                    ) : (
                                        <button
                                            className="remove-user-btn"
                                            onClick={() => handleSelectOwner(owner)}
                                            title="Remove from list"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Modify the external users section to add delete buttons
    const renderExternalUsers = () => {
        return (
            <div className="external-user-section">
                <div className="external-user-header">
                    <div className="section-title">External Users</div>
                    {!showAddExternal && (
                        <button 
                            className="add-external-btn"
                            onClick={() => setShowAddExternal(true)}
                        >
                            + Add New User
                        </button>
                    )}
                </div>
                
                {showAddExternal && 
                <div className="external-user-form-overlay">
                    <div className="external-user-form-container">
                        {renderExternalUserForm()}
                    </div>
                </div>}
                
                {externalUsers.length > 0 && (
                    <div className="external-users-list">
                        {externalUsers.map((extUser, index) => {
                            // Check if this is a pre-existing share
                            const isExistingShare = currentShares.some(
                                share => share.is_external && share.email === extUser.email
                            );
                            
                            return (
                                <div key={index} className={`access-item ${isExistingShare ? 'existing-share' : ''}`}>
                                    <div className="user-info">
                                        <div className="external-avatar">
                                            {extUser.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">
                                                {extUser.username}
                                            </div>
                                            <div className="user-email">{extUser.email}</div>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        <div className="permission-selector-container">
                                            <select
                                                className={`permission-select ${isExistingShare ? 'existing-share' : ''}`}
                                                value={extUser.permission}
                                                onChange={(e) => handleExternalPermissionChange(extUser.email, e.target.value)}
                                                disabled={isExistingShare}
                                            >
                                                <option value="read">Can view</option>
                                                <option value="write">Can edit</option>
                                                <option value="admin">Is owner</option>
                                            </select>
                                        </div>
                                        
                                        {isExistingShare ? (
                                            <button
                                                className="remove-access-btn"
                                                onClick={() => confirmDeleteAccess(extUser, true)}
                                                title="Revoke access"
                                            >
                                                🗑️
                                            </button>
                                        ) : (
                                            <button
                                                className="remove-user-btn"
                                                onClick={() => handleRemoveExternalUser(extUser.email)}
                                                title="Remove from list"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Render confirmation modal for deleting a user's access
    const renderDeleteConfirmModal = () => {
        if (!showConfirmDelete || !userToDelete) return null;
        
        return (
            <div className="confirm-modal-overlay">
                <div className="confirm-modal">
                    <div className="confirm-modal-title">Revoke Access</div>
                    <div className="confirm-modal-message">
                        Are you sure you want to revoke {userToDelete.name}'s access to this {item.type}? 
                        This action cannot be undone.
                    </div>
                    <div className="confirm-modal-actions">
                        <button 
                            className="confirm-btn-cancel" 
                            onClick={() => {
                                setShowConfirmDelete(false);
                                setUserToDelete(null);
                            }}
                            disabled={isRevoking}
                        >
                            Cancel
                        </button>
                        <button 
                            className="confirm-btn-delete" 
                            onClick={handleRevokeAccess}
                            disabled={isRevoking}
                        >
                            {isRevoking ? "Revoking..." : "Revoke Access"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render confirmation modal for revoking public access
    const renderRevokePublicConfirmModal = () => {
        if (!showConfirmRevokePublic) return null;
        
        return (
            <div className="confirm-modal-overlay">
                <div className="confirm-modal">
                    <div className="confirm-modal-title">Revoke Public Access</div>
                    <div className="confirm-modal-message">
                        Are you sure you want to revoke public access to this {item.type}? 
                        Anyone with the link will no longer be able to access it.
                    </div>
                    <div className="confirm-modal-actions">
                        <button 
                            className="confirm-btn-cancel" 
                            onClick={() => setShowConfirmRevokePublic(false)}
                            disabled={isRevokingPublic}
                        >
                            Cancel
                        </button>
                        <button 
                            className="confirm-btn-delete" 
                            onClick={handleRevokePublicAccess}
                            disabled={isRevokingPublic}
                        >
                            {isRevokingPublic ? "Revoking..." : "Revoke Public Access"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render success popup for sharing
    const renderShareSuccessPopup = () => {
        if (!shareSuccessInfo) return null;
        
        return (
            <div className="share-success-overlay">
                <div className="share-success-modal">
                    <div className="share-success-header">
                        <div className="share-success-icon">✓</div>
                        <div className="share-success-title">{shareSuccessInfo.title}</div>
                    </div>
                    <div className="share-success-message">{shareSuccessInfo.message}</div>
                    <div className="share-link-container">
                        <input
                            type="text"
                            className="share-link-input"
                            value={shareSuccessInfo.link}
                            readOnly
                            id="share-success-link-input"
                        />
                        <button
                            className="share-link-copy-btn"
                            onClick={() => {
                                const input = document.getElementById("share-success-link-input");
                                input.select();
                                input.setSelectionRange(0, 99999);
                                navigator.clipboard.writeText(input.value).then(() => {
                                    showAcceptToast({ message: "Link copied to clipboard!" });
                                }).catch(err => {
                                    showRejectToast({ message: "Failed to copy: " + err });
                                });
                            }}
                        >
                            Copy link
                        </button>
                    </div>
                    <div className="share-success-actions">
                        <button 
                            className="share-success-close"
                            onClick={() => {
                                setShareSuccessInfo(null);
                                onShare();
                                onClose();
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="share-popup-overlay">
                <div className="share-popup-loading">
                    <div className="loading-spinner-share-popup"></div>
                    <p>Loading share settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="share-popup-overlay" onClick={(e) => {
            if (e.target.className === "share-popup-overlay") {
                onClose();
            }
        }}>
            <div className="share-popup-content">
                {currentStep === 1 && (
                    <div className="share-popup-header">
                        <h3>Share "{item.name || item.file_name || item.folder_name}"</h3>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                )}

                <div className={`share-body ${currentStep === 1 ? 'step-one' : 'step-two'}`}>
                    {currentStep === 1 ? renderStepOne() : renderStepTwo()}
                </div>

                <div className="popup-actions">
                    <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
                    
                    {currentStep === 1 ? (
                        <button
                            className="btn btn-next"
                            onClick={goToNextStep}
                        >
                            {accessMode === "anyone" ? "Share" : "Add People"}
                        </button>
                    ) : (
                        <button
                            className={`btn btn-share ${(selectedOwners.length === 0 && externalUsers.length === 0) ? 'disabled' : ''}`}
                            onClick={handleShare}
                            disabled={(selectedOwners.length === 0 && externalUsers.length === 0) || isSharing}
                        >
                            {isSharing ? (
                                <div className="share-loading">
                                    <div className="share-spinner"></div>
                                    <span>Sharing...</span>
                                </div>
                            ) : (
                                "Share"
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            {renderDeleteConfirmModal()}
            {renderRevokePublicConfirmModal()}
            {renderRevokeAllConfirmModal()}
            {renderShareSuccessPopup()}
            {renderRestrictedWarning()}
        </div>
    );
};

export default SharePopup; 