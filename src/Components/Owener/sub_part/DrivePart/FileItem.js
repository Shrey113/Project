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
    selectionMode = false
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const itemRef = useRef(null);

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
        setShowOptions(!showOptions);
    };

    const handleItemClick = (e) => {
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
    const itemId = type === 'file' ? item.file_id : item.folder_id;
    const itemName = type === 'file' ? item.file_name : item.folder_name;
    const createdDate = formatDate ? formatDate(item.created_at || item.created_date) : new Date(item.created_at || item.created_date).toLocaleDateString();
    const isStarred = item.is_starred;
    const itemSize = type === 'file' 
        ? formatFileSize(item.file_size)
        : formatFileSize(item);
    const sharedWith = item.shared_with || [];

    // Render shared avatars
    const renderSharedAvatars = () => {
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
                        onChange={() => {}}
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
                                style={{
                                    color: '#FFD700',
                                    fill: '#FFD700'
                                }}
                            />
                        )}
                    </div>
                    
                    <div className="file-meta">
                        {type === 'file' && (
                            <span className="file-size-grid">{itemSize}</span>
                        )}
                    </div>
                </div>
                
                <div className={`file-actions-grid ${isHovered ? 'visible' : ''}`}>
                    {type === 'file' && onDownload && (
                        <button
                            className="action-btn action-download"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(itemId, itemName);
                            }}
                            title="Download"
                        >
                            <FiDownload />
                        </button>
                    )}
                    
                    {onStar && (
                        <button
                            className="action-btn action-star"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStar(itemId, type, isStarred);
                            }}
                            title={isStarred ? "Unstar" : "Star"}
                        >
                            <FiStar
                                style={{
                                    color: isStarred ? '#FFD700' : '#666',
                                    fill: isStarred ? '#FFD700' : 'none'
                                }}
                            />
                        </button>
                    )}
                    
                    <button
                        className="action-btn action-more"
                        onClick={toggleOptions}
                        title="More options"
                    >
                        <FiMoreVertical />
                    </button>
                </div>
                
                {showOptions && (
                    <div className="options-popup" ref={optionsRef}>
                        <ul>
                            {type === 'file' && onDownload && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload(itemId, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiDownload /> Download
                                </li>
                            )}
                            {onStar && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onStar(itemId, type, isStarred);
                                    setShowOptions(false);
                                }}>
                                    <FiStar style={{
                                        color: isStarred ? '#FFD700' : '#666',
                                        fill: isStarred ? '#FFD700' : 'none'
                                    }} /> {isStarred ? 'Unstar' : 'Star'}
                                </li>
                            )}
                            {type === 'file' && onEdit && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(itemId, type, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiEdit /> Rename
                                </li>
                            )}
                            {type === 'folder' && onDelete && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(itemId, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiTrash2 /> Delete
                                </li>
                            )}
                            {type === 'file' && onDelete && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(itemId, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiTrash2 /> Delete
                                </li>
                            )}
                            {type === 'folder' && onEdit && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(itemId, type, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiEdit /> Rename
                                </li>
                            )}
                            {onShare && (
                                <li onClick={(e) => {
                                    e.stopPropagation();
                                    onShare(itemId, type, itemName);
                                    setShowOptions(false);
                                }}>
                                    <FiShare2 /> Share
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // List view (matches the image more closely)
    return (
        <div
            ref={itemRef}
            className={`file-item ${type} ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
            onClick={handleItemClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="file-select" onClick={handleCheckboxClick}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                />
            </div>

            <div className="file-name">
                {getIcon()}
                <span>{itemName}</span>
                {isStarred && (
                    <FiStar
                        className="star-indicator"
                        style={{
                            color: '#FFD700',
                            fill: '#FFD700'
                        }}
                    />
                )}
            </div>

            <div className="file-shared">
                {renderSharedAvatars()}
            </div>

            <div className="file-date">
                {createdDate}
            </div>

            <div className="file-size">
                {itemSize}
            </div>

            <div className="file-actions">
                <button
                    className="action-btn action-more"
                    onClick={toggleOptions}
                    title="More options"
                >
                    <FiMoreVertical size={18} />
                </button>
            </div>

            {showOptions && (
                <div className="options-popup" ref={optionsRef}>
                    <ul>
                        {type === 'file' && onDownload && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onDownload(itemId, itemName);
                                setShowOptions(false);
                            }}>
                                <FiDownload /> Download
                            </li>
                        )}
                        {onStar && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onStar(itemId, type, isStarred);
                                setShowOptions(false);
                            }}>
                                <FiStar style={{
                                    color: isStarred ? '#FFD700' : '#666',
                                    fill: isStarred ? '#FFD700' : 'none'
                                }} /> {isStarred ? 'Unstar' : 'Star'}
                            </li>
                        )}
                        {type === 'file' && onEdit && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onEdit(itemId, type, itemName);
                                setShowOptions(false);
                            }}>
                                <FiEdit /> Rename
                            </li>
                        )}
                        {type === 'folder' && onDelete && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onDelete(itemId, itemName);
                                setShowOptions(false);
                            }}>
                                <FiTrash2 /> Delete
                            </li>
                        )}
                        {type === 'file' && onDelete && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onDelete(itemId, itemName);
                                setShowOptions(false);
                            }}>
                                <FiTrash2 /> Delete
                            </li>
                        )}
                        {type === 'folder' && onEdit && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onEdit(itemId, type, itemName);
                                setShowOptions(false);
                            }}>
                                <FiEdit /> Rename
                            </li>
                        )}
                        {onShare && (
                            <li onClick={(e) => {
                                e.stopPropagation();
                                onShare(itemId, type, itemName);
                                setShowOptions(false);
                            }}>
                                <FiShare2 /> Share
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileItem; 