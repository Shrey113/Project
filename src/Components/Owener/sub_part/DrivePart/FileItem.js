import React, { useState, useRef, useEffect } from 'react';
import {
    FiMoreVertical,
    FiDownload,
    FiStar,
    FiTrash2,
    FiEdit,
    FiShare2
} from 'react-icons/fi';
import {
    FcFolder,
    FcDocument,
    FcImageFile,
    FcVideoFile,
    FcAudioFile,
    FcFile
} from 'react-icons/fc';
import {
    BsFiletypePdf,
    BsFiletypeDocx,
    BsFiletypeXlsx,
    BsFiletypeTxt,
    BsFiletypePpt,
    BsFileZip,
    BsFileCode
} from 'react-icons/bs';
import './DriveStyles.css';
import { Server_url } from '../../../../redux/AllData';

// Global variable to track the active popup
let activePopupId = null;

const FileItem = ({
    item,
    type,
    viewMode = 'list',
    isSelected,
    onSelect,
    onNavigate,
    onDownload,
    onStar,
    onDelete,
    onShare,
    onEdit,
    formatFileSize,
    formatDate,
    onClick,
    onPreview,
    selectionMode = false,
    setGlobalActivePopup,
    globalActivePopup,
    currentTab
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const itemRef = useRef(null);
    const [sharedWithProfiles, setSharedWithProfiles] = useState([]);

    // Generate a unique ID for this item
    const itemId = type === 'file' ? `file-${item.file_id}` : `folder-${item.folder_id}`;

    // Close options popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target) &&
                !event.target.closest('.action-more')) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    // Sync local popup state with global state
    useEffect(() => {
        if (globalActivePopup !== itemId) {
            setShowOptions(false);
        }
    }, [globalActivePopup, itemId]);

    useEffect(() => {
        console.log("currentTab", item);
        async function fetchBusinessProfileImage() {
            if (currentTab === "shared-by-me") {
                try {
                    const response = await fetch(`${Server_url}/share_drive/business-profile-image/${item.user_email}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    const data = await response.json();
                    console.log("data", data);

                    // ✅ Filter out duplicates based on user_email
                    const uniqueProfiles = [];
                    const seenEmails = new Set();

                    data.forEach(profile => {
                        if (!seenEmails.has(profile.user_email)) {
                            seenEmails.add(profile.user_email);
                            uniqueProfiles.push(profile);
                        }
                    });

                    setSharedWithProfiles(uniqueProfiles);
                } catch (error) {
                    console.error("Error fetching profile images:", error);
                }
            }
        }
        fetchBusinessProfileImage();
    }, [item]);


    // Get appropriate icon based on file type
    const getIcon = () => {
        if (type === 'folder') {
            return <FcFolder className="folder-icon" size={viewMode === 'grid' ? 40 : 24} />;
        }

        // Determine icon by file extension
        const fileType = item.file_type ? item.file_type.toLowerCase() : '';

        switch (true) {
            // Images
            case /jpg|jpeg|png|gif|bmp|svg/.test(fileType):
                return <FcImageFile className="file-icon" size={viewMode === 'grid' ? 40 : 24} />;

            // PDFs
            case /pdf/.test(fileType):
                return <BsFiletypePdf className="file-icon file-pdf" size={viewMode === 'grid' ? 40 : 24} />;

            // Word documents
            case /doc|docx/.test(fileType):
                return <BsFiletypeDocx className="file-icon file-doc" size={viewMode === 'grid' ? 40 : 24} />;

            // Excel spreadsheets
            case /xls|xlsx|csv/.test(fileType):
                return <BsFiletypeXlsx className="file-icon file-excel" size={viewMode === 'grid' ? 40 : 24} />;

            // PowerPoint presentations
            case /ppt|pptx/.test(fileType):
                return <BsFiletypePpt className="file-icon file-ppt" size={viewMode === 'grid' ? 40 : 24} />;

            // Text files
            case /txt|rtf|md/.test(fileType):
                return <BsFiletypeTxt className="file-icon file-txt" size={viewMode === 'grid' ? 40 : 24} />;

            // Code files
            case /js|jsx|ts|tsx|html|css|java|py|c|cpp|php/.test(fileType):
                return <BsFileCode className="file-icon file-code" size={viewMode === 'grid' ? 40 : 24} />;

            // Archive files
            case /zip|rar|7z|tar|gz/.test(fileType):
                return <BsFileZip className="file-icon file-archive" size={viewMode === 'grid' ? 40 : 24} />;

            // Audio files
            case /mp3|wav|ogg|flac|aac/.test(fileType):
                return <FcAudioFile className="file-icon" size={viewMode === 'grid' ? 40 : 24} />;

            // Video files
            case /mp4|avi|mov|wmv|mkv/.test(fileType):
                return <FcVideoFile className="file-icon" size={viewMode === 'grid' ? 40 : 24} />;

            // Default file icon
            default:
                return type === 'file' ? <FcDocument className="file-icon" size={viewMode === 'grid' ? 40 : 24} /> : <FcFile className="file-icon" size={viewMode === 'grid' ? 40 : 24} />;
        }
    };

    const toggleOptions = (e) => {
        e.stopPropagation();

        // Close any active popup if it's not this one
        if (globalActivePopup && globalActivePopup !== itemId) {
            // Close the currently active popup
            setGlobalActivePopup(null);
        }

        // Toggle this popup and set it as the active one
        const newState = !showOptions;
        setShowOptions(newState);

        if (newState) {
            setGlobalActivePopup(itemId);
        } else {
            setGlobalActivePopup(null);
        }
    };

    const handleItemClick = (e) => {
        if (showOptions) return; // Prevent navigation when options menu is open

        if (onClick) {
            onClick(item, type);
        } else if (type === 'folder' && onNavigate && !selectionMode) {
            onNavigate(item.folder_id, item.folder_name);
        } else if (type === 'file' && onPreview && !selectionMode) {
            onPreview(item);
        }
    };

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        const itemId = type === 'file' ? item.file_id : item.folder_id;
        onSelect(itemId, type);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    // Determine item details based on type
    const itemIdValue = type === 'file' ? item.file_id : item.folder_id;
    const itemName = type === 'file' ? item.file_name : item.folder_name;
    const createdDate = formatDate ? formatDate(item.created_at || item.created_date) : new Date(item.created_at || item.created_date).toLocaleDateString();
    const isStarred = item.is_starred;
    const itemSize = type === 'file'
        ? formatFileSize(item.file_size)
        : formatFileSize(item);
    const sharedWith = item.shared_with || [];

    // Render shared avatars
    const renderSharedAvatars = () => {
        if (!sharedWith || sharedWith.length === 0) return null;

        return (
            <div className="shared-avatars">
                {sharedWith.map((user, index) => {
                    // Limit display to first 5 avatars
                    if (index < 5) {
                        return (
                            <div key={index} className="shared-avatar" title={user.id}>
                                {typeof user.avatar === 'string' && user.avatar.startsWith('+') ? (
                                    <div className="more-avatar">{user.avatar}</div>
                                ) : (
                                    <div className="user-avatar">
                                        {user.avatar.substring(0, 1)}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    const handleDownload = (e) => {
        e.stopPropagation();

        try {
            // Call the onDownload callback if provided
            if (onDownload) {
                onDownload(itemIdValue, itemName);
            }

            // Close options menu
            setShowOptions(false);
            setGlobalActivePopup(null);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file. Please try again.");
        }
    };

    if (viewMode === 'grid') {
        return (
            <div
                ref={itemRef}
                className={`file-item-grid ${type} ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
                onClick={handleItemClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="file-select-grid" onClick={handleCheckboxClick}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                    />
                </div>

                <div className="file-icon-container">
                    {getIcon()}
                </div>

                <div className="file-details">
                    <div className="file-name-grid">
                        <span title={itemName}>{itemName}</span>
                        {isStarred && (
                            <FiStar
                                className="star-indicator"
                                style={{ color: '#FFD700', fill: '#FFD700' }}
                            />
                        )}
                    </div>
                </div>

                {/* In grid view, only show 3-dot menu */}
                <div className="file-actions-grid">
                    <button
                        className="action-more"
                        onClick={toggleOptions}
                        title="More options"
                    >
                        <FiMoreVertical />
                    </button>

                    {showOptions && (
                        <div className="options-popup" ref={optionsRef}>
                            {type === 'file' && onDownload && (
                                <button
                                    onClick={handleDownload}
                                    className="option-item"
                                >
                                    <FiDownload />
                                    <span>Download</span>
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onStar) {
                                        onStar(itemIdValue, type, isStarred);
                                    }
                                    setShowOptions(false);
                                    setGlobalActivePopup(null);
                                }}
                                className="option-item"
                            >
                                <FiStar />
                                <span>{isStarred ? "Unstar" : "Star"}</span>
                            </button>
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(itemIdValue, type, itemName);
                                        setShowOptions(false);
                                        setGlobalActivePopup(null);
                                    }}
                                    className="option-item"
                                >
                                    <FiEdit />
                                    <span>Rename</span>
                                </button>
                            )}
                            {onShare && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShare(itemIdValue, type, itemName);
                                        setShowOptions(false);
                                        setGlobalActivePopup(null);
                                    }}
                                    className="option-item"
                                >
                                    <FiShare2 />
                                    <span>Share</span>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(itemIdValue, itemName);
                                        setShowOptions(false);
                                        setGlobalActivePopup(null);
                                    }}
                                    className="option-item warning"
                                >
                                    <FiTrash2 />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List view - improved table-like structure
    return (
        <tr
            ref={itemRef}
            className={`table-row ${type} ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
            onClick={handleItemClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <td className="checkbox-cell">
                <div className="file-select" onClick={handleCheckboxClick}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                    />
                </div>
            </td>

            <td className="name-cell">
                <div className="name-wrapper">
                    <div className="file-icon-container">
                        {getIcon()}
                    </div>
                    <span title={itemName} className="file-name-span">{itemName}</span>
                    {isStarred && (
                        <FiStar
                            className="star-indicator"
                            style={{ color: '#FFD700', fill: '#FFD700' }}
                        />
                    )}
                </div>
            </td>

            <td className="shared-cell">
                {currentTab === "shared-by-me" ? (
                    <div className="shared-by">
                        <div className="shared-by-container">
                            {sharedWithProfiles.map((user, index) => (
                                <div key={index} className="shared-user-container">
                                    <img
                                        src={`${Server_url}/owner/business-profile-image/${user.user_email}`}
                                        alt={user.user_email}
                                        className="shared-user-avatar"
                                    />
                                </div>
                            ))}

                        </div>
                    </div>
                ) : currentTab === "shared-with-me" ? (
                    <div className="shared-by">
                        <div className="shared-with-me-container">
                            <img src={`${Server_url}/owner/business-profile-image/${item.shared_by}`} alt={item.shared_by} />
                            <span>{item.shared_by}</span>
                        </div>
                    </div>
                ) : renderSharedAvatars()}
            </td>

            <td className="date-cell">
                {createdDate}
            </td>

            <td className="size-cell">
                {itemSize}
            </td>

            <td className="actions-cell">
                <button
                    className="action-more"
                    onClick={toggleOptions}
                    title="More options"
                >
                    <FiMoreVertical />
                </button>

                {showOptions && (
                    <div className="options-popup" ref={optionsRef}>
                        {type === 'file' && onDownload && (
                            <button
                                onClick={handleDownload}
                                className="option-item"
                            >
                                <FiDownload />
                                <span>Download</span>
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onStar) {
                                    onStar(itemIdValue, type, isStarred);
                                }
                                setShowOptions(false);
                                setGlobalActivePopup(null);
                            }}
                            className="option-item"
                        >
                            <FiStar />
                            <span>{isStarred ? "Unstar" : "Star"}</span>
                        </button>
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(itemIdValue, type, itemName);
                                    setShowOptions(false);
                                    setGlobalActivePopup(null);
                                }}
                                className="option-item"
                            >
                                <FiEdit />
                                <span>Rename</span>
                            </button>
                        )}
                        {onShare && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShare(itemIdValue, type, itemName);
                                    setShowOptions(false);
                                    setGlobalActivePopup(null);
                                }}
                                className="option-item"
                            >
                                <FiShare2 />
                                <span>Share</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(itemIdValue, itemName);
                                    setShowOptions(false);
                                    setGlobalActivePopup(null);
                                }}
                                className="option-item warning"
                            >
                                <FiTrash2 />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
};

export default FileItem; 