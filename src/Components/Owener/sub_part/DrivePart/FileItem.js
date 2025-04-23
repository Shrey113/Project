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
    isSelected,
    onSelect,
    onNavigate,
    onDownload,
    onStar,
    onDelete,
    onShare,
    onEdit,
    formatFileSize,
    onClick,
    onPreview
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
            return <FcFolder className="folder-icon" size={24} />;
        }

        // Determine icon by file extension
        const fileType = item.file_type ? item.file_type.toLowerCase() : '';

        switch (true) {
            // Images
            case /jpg|jpeg|png|gif|bmp|svg/.test(fileType):
                return <FcImageFile className="file-icon" size={24} />;

            // PDFs
            case /pdf/.test(fileType):
                return <BsFiletypePdf className="file-icon file-pdf" size={24} />;

            // Word documents
            case /doc|docx/.test(fileType):
                return <BsFiletypeDocx className="file-icon file-doc" size={24} />;

            // Excel spreadsheets
            case /xls|xlsx|csv/.test(fileType):
                return <BsFiletypeXlsx className="file-icon file-excel" size={24} />;

            // PowerPoint presentations
            case /ppt|pptx/.test(fileType):
                return <BsFiletypePpt className="file-icon file-ppt" size={24} />;

            // Text files
            case /txt|rtf|md/.test(fileType):
                return <BsFiletypeTxt className="file-icon file-txt" size={24} />;

            // Code files
            case /js|jsx|ts|tsx|html|css|java|py|c|cpp|php/.test(fileType):
                return <BsFileCode className="file-icon file-code" size={24} />;

            // Archive files
            case /zip|rar|7z|tar|gz/.test(fileType):
                return <BsFileZip className="file-icon file-archive" size={24} />;

            // Audio files
            case /mp3|wav|ogg|flac|aac/.test(fileType):
                return <FcAudioFile className="file-icon" size={24} />;

            // Video files
            case /mp4|avi|mov|wmv|mkv/.test(fileType):
                return <FcVideoFile className="file-icon" size={24} />;

            // Default file icon
            default:
                return type === 'file' ? <FcDocument className="file-icon" size={24} /> : <FcFile className="file-icon" size={24} />;
        }
    };

    const toggleOptions = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleItemClick = (e) => {
        if (onClick) {
            onClick(item, type);
        } else if (type === 'folder' && onNavigate) {
            onNavigate(item.folder_id, item.folder_name);
        } else if (type === 'file' && onPreview) {
            onPreview(item);
        }
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
    const createdDate = new Date(item.created_at || item.created_date).toLocaleDateString();
    const isStarred = item.is_starred;

    return (
        <div
            ref={itemRef}
            className={`file-item ${type} ${isSelected ? 'selected' : ''}`}
            onClick={handleItemClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="file-select" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(itemId, type)}
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

            <div className="file-date">
                {createdDate}
            </div>

            <div className="file-size">
                {type === 'file' ? formatFileSize(item.file_size) : '—'}
            </div>

            <div className="file-actions">
                {isHovered && (
                    <>
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

                        {type === 'file' && onDelete && (
                            <button
                                className="action-btn action-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(itemId, itemName);
                                }}
                                title="Delete"
                            >
                                <FiTrash2 />
                            </button>
                        )}

                        {type === 'folder' && onEdit && (
                            <button
                                className="action-btn action-edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Sending to edit:', { id: itemId, type, name: itemName });
                                    onEdit(itemId, type, itemName);
                                }}
                                title="Rename"
                            >
                                <FiEdit />
                            </button>
                        )}
                    </>
                )}

                {/* Three dots always visible regardless of hover state */}
                <button
                    className="action-btn action-more always-visible"
                    onClick={toggleOptions}
                    title="More options"
                >
                    <FiMoreVertical size={20} />
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
                                console.log('Sending to edit from menu:', { id: itemId, type, name: itemName });
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