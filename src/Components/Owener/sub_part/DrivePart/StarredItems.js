import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url, showAcceptToast, showRejectToast, ConfirmMessage } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import FileItem from './FileItem'
import FilePreview from './FilePreview'
import { useNavigate } from 'react-router-dom'
import SharePopup from './SharePopup'

function StarredItems() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [starredFolders, setStarredFolders] = useState([]);
    const [starredFiles, setStarredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [downloadProgress, setDownloadProgress] = useState({ isDownloading: false, progress: 0, fileName: '' })
    const [currentFolder, setCurrentFolder] = useState(null)
    const [breadcrumbPath, setBreadcrumbPath] = useState([])
    const [previewFile, setPreviewFile] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectionMode, setSelectionMode] = useState(false)
    const [activePopup, setActivePopup] = useState(null)
    const [selectAll, setSelectAll] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteItem, setDeleteItem] = useState(null)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [renameItem, setRenameItem] = useState(null)
    const [newItemName, setNewItemName] = useState('')
    const [sharePopup, setSharePopup] = useState({
        show: false,
        item: null
    })
    const navigate = useNavigate();

    const fetchStarredItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${Server_url}/starred/drive/get_starred_items?user_email=${user_email}`);
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const data = await response.json();
            setStarredFolders(data.starred_folders || []);
            setStarredFiles(data.starred_files || []);
        } catch (error) {
            console.error('Error fetching starred items:', error);
            // Set demo data for now
            setStarredFolders([
                {
                    folder_id: 1,
                    folder_name: 'Project Materials',
                    user_email: user_email,
                    is_root: 0,
                    created_at: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    created_by: 'user1',
                    modified_by: 'user1',
                    is_shared: 0,
                    is_starred: 1,
                    shared_with: [
                        { id: 1, avatar: 'avatar1.jpg' },
                        { id: 2, avatar: 'avatar2.jpg' }
                    ]
                }
            ]);
            setStarredFiles([
                {
                    file_id: 1,
                    file_name: 'Important Document.pdf',
                    file_size: 2.4 * 1024 * 1024, // Convert to bytes
                    file_type: 'pdf',
                    parent_folder_id: 1,
                    file_data: null,
                    is_shared: 0,
                    created_at: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    created_by: 'user1',
                    modified_by: 'user1',
                    is_root: 0,
                    file_path: '/documents/important.pdf',
                    user_email: user_email,
                    is_starred: 1,
                    shared_with: [
                        { id: 1, avatar: 'avatar1.jpg' },
                        { id: 2, avatar: 'avatar2.jpg' }
                    ]
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFolderContents = async (folderId) => {
        setIsLoading(true);
        try {
            let url;

            if (folderId) {
                // If we're in a folder, use the new endpoint to get only its contents
                url = new URL(`${Server_url}/drive/folder/${folderId}/contents`);
                url.searchParams.append('user_email', user_email);
                url.searchParams.append('created_by', starredFolders[0].created_by);
            } else {
                // If we're at the root, get all files and folders
                url = new URL(`${Server_url}/starred/drive/get_starred_items`);
                url.searchParams.append('user_email', user_email);
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Handle the response format
            if (folderId && data.success) {
                // When in a folder, show all contents of that folder
                setStarredFiles(data.files || []);
                setStarredFolders(data.folders || []);
            } else {
                // At root level, only show starred items
                if (data.files) {
                    setStarredFiles(data.files.filter(file => file.is_starred === 1));
                }

                if (data.folders) {
                    setStarredFolders(data.folders.filter(folder => folder.is_starred === 1));
                }
            }

            // Update breadcrumb path if available from server
            if (data.breadcrumb && data.breadcrumb.length > 0) {
                setBreadcrumbPath(data.breadcrumb);
            } else {
                setBreadcrumbPath([]);
            }
        } catch (error) {
            console.error('Error fetching files and folders:', error);
            toast.error('Failed to load folder contents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeProfileSection !== 'Starred Items') {
            setActiveProfileSection('Starred Items')
        }
        // Fetch starred items
        fetchStarredItems()
    }, [activeProfileSection, setActiveProfileSection])

    useEffect(() => {
        if (currentFolder) {
            fetchFolderContents(currentFolder);
        } else {
            fetchStarredItems();
        }
    }, [currentFolder]);

    const handleUnstar = async (itemId, itemType, isStarred) => {
        try {
            // Immediately update UI
            if (itemType === 'file') {
                setStarredFiles(prev => prev.filter(file => file.file_id !== itemId));
            } else {
                setStarredFolders(prev => prev.filter(folder => folder.folder_id !== itemId));
            }

            // Notify user
            toast.success(`Item removed from starred items`);

            // Update backend
            const response = await fetch(`${Server_url}/starred/drive/${itemType === 'file' ? 'files' : 'folders'}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_starred: !isStarred,
                    modified_by: user_email
                })
            })

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }
        } catch (error) {
            console.error('Error unstarring item:', error);
            // Revert UI changes on error
            toast.error('Failed to unstar item. Please try again.');
            if (currentFolder) {
                fetchFolderContents(currentFolder);
            } else {
                fetchStarredItems();
            }
        }
    }

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            setDownloadProgress({
                isDownloading: true,
                progress: 0,
                fileName: fileName
            });

            const response = await fetch(`${Server_url}/drive/files/${fileId}?user_email=${user_email}&download=true`);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setDownloadProgress({
                isDownloading: false,
                progress: 100
            });

            toast.success(`Downloaded ${fileName} successfully`);
        } catch (error) {
            console.error('Download error:', error);
            setDownloadProgress({
                isDownloading: false,
                progress: 0,
                fileName: ''
            });
            toast.error(`Failed to download ${fileName}`);
        }
    }

    const formatFileSize = (size) => {
        const num = Number(size);
        if (isNaN(num)) return '0 B';

        const kb = num / 1024;
        const mb = kb / 1024;
        if (mb >= 1) return `${mb.toFixed(0)} MB`;
        if (kb >= 1) return `${kb.toFixed(0)} KB`;
        return `${num} B`;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 24) {
            return `${diffHours} hours ago`;
        }

        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(' ', ', ');
    }

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const navigateToFolder = (folderId, folderName) => {
        setCurrentFolder(folderId);

        setBreadcrumbPath((prevPath) => {
            const existingIndex = prevPath.findIndex(item => item.id === folderId);

            if (existingIndex !== -1) {
                // If folder already exists in breadcrumb, cut the path here
                return prevPath.slice(0, existingIndex + 1);
            } else {
                // Append new folder to path
                return [...prevPath, { id: folderId, name: folderName }];
            }
        });
    };
    const navigateUp = () => {
        if (breadcrumbPath.length <= 1) {
            setCurrentFolder(null);
            setBreadcrumbPath([]);
            return;
        }

        const newBreadcrumbPath = [...breadcrumbPath];
        newBreadcrumbPath.pop();
        const parentFolder = newBreadcrumbPath[newBreadcrumbPath.length - 1];

        if (parentFolder) {
            setCurrentFolder(parentFolder.id);
            setBreadcrumbPath(newBreadcrumbPath);
        } else {
            setCurrentFolder(null);
            setBreadcrumbPath([]);
        }
    }

    const handleItemClick = (item, type) => {
        if (selectionMode) {
            const itemId = type === 'folder' ? item.folder_id : item.file_id;
            toggleSelectItem(itemId, type);
            return;
        }

        if (type === 'folder') {
            // Instead of navigating within StarredItems, redirect to DriveHome
            setActiveProfileSection('Drive Home');

            // Better handling of breadcrumb path
            let pathToStore = [];
            let currentPath = '';

            if (currentFolder) {
                // If we're already in a folder in StarredItems, preserve that path
                pathToStore = [...breadcrumbPath];

                // Check if the current folder is already in the path to avoid duplicates
                if (!pathToStore.some(p => p.id === item.folder_id)) {
                    pathToStore.push({ id: item.folder_id, name: item.folder_name });
                }

                // Build current path string
                currentPath = '/' + pathToStore.map(p => p.name).join('/');
            } else {
                // If we're at the root of StarredItems, start a new path
                pathToStore = [{ id: item.folder_id, name: item.folder_name }];
                currentPath = '/' + item.folder_name;
            }

            console.log("Navigating to Drive Home with path:", pathToStore, "and currentPath:", currentPath);

            // Use a custom flag to force the path navigation
            const timestamp = new Date().getTime();
            localStorage.setItem(`folder_navigation_${timestamp}`, JSON.stringify({
                folderId: item.folder_id,
                folderName: item.folder_name,
                breadcrumbPath: pathToStore,
                currentPath: currentPath
            }));

            // Pass folder data directly through router state with special flags
            navigate('/Owner/drive/home', {
                state: {
                    folderData: {
                        folderId: item.folder_id,
                        folderName: item.folder_name,
                        breadcrumbPath: pathToStore,
                        currentPath: currentPath,
                        fromStarred: true,
                        directOpen: true, // Special flag for direct opening
                        timestamp: timestamp
                    }
                }
            });
        } else {
            setPreviewFile(item);
        }
    };

    const toggleSelectItem = (id, type) => {
        const existingIndex = selectedItems.findIndex(item => item.id === id && item.type === type);

        if (existingIndex >= 0) {
            const newSelectedItems = selectedItems.filter((_, index) => index !== existingIndex);
            setSelectedItems(newSelectedItems);

            if (newSelectedItems.length === 0) {
                setSelectionMode(false);
            }
        } else {
            setSelectedItems([...selectedItems, { id, type }]);
            setSelectionMode(true);
        }
    };

    const clearSelections = () => {
        setSelectedItems([]);
        setSelectionMode(false);
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    const handleSetActivePopup = (popupId) => {
        setActivePopup(popupId);
    };

    // Add select all functionality
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            // Select all visible items
            const allItems = [...starredFolders, ...starredFiles].map(item => {
                const itemType = 'folder_id' in item ? 'folder' : 'file';
                const itemId = itemType === 'folder' ? item.folder_id : item.file_id;
                return { id: itemId, type: itemType };
            });
            setSelectedItems(allItems);
            setSelectionMode(true);
        } else {
            // Deselect all items
            setSelectedItems([]);
            setSelectionMode(false);
        }
    };

    // Update handlers to use proper dialogs
    const handleOpenRenameDialog = (id, type, currentName) => {
        setRenameItem({ id, type, currentName });
        setNewItemName(currentName);
        setShowRenameDialog(true);
    };

    const handleRenameCancel = () => {
        setShowRenameDialog(false);
        setRenameItem(null);
        setNewItemName('');
    };

    const handleRenameSubmit = async () => {
        if (!renameItem || !newItemName.trim()) return;

        try {
            const endpoint = renameItem.type === 'folder' ? 'folders' : 'files';
            const nameField = renameItem.type === 'folder' ? 'folder_name' : 'file_name';

            // Updated URL to include query parameters like in DriveHome.js
            const response = await fetch(`${Server_url}/drive/${endpoint}/${renameItem.id}?created_by=${user_email}&user_email=${user_email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [nameField]: newItemName,
                    modified_by: user_email
                })
            });

            if (response.ok) {
                showAcceptToast({ message: `${renameItem.type} renamed successfully` });
                // Refresh the list
                if (currentFolder) {
                    fetchFolderContents(currentFolder);
                } else {
                    fetchStarredItems();
                }
            } else {
                const errorData = await response.json();
                showRejectToast({ message: errorData.error || `Failed to rename ${renameItem.type}` });
            }
        } catch (error) {
            console.error(`Error renaming ${renameItem.type}:`, error);
            showRejectToast({ message: `Failed to rename ${renameItem.type}` });
        } finally {
            setShowRenameDialog(false);
            setRenameItem(null);
            setNewItemName('');
        }
    };

    const handleShare = (id, type, name) => {
        const item = {
            [type === 'file' ? 'file_id' : 'folder_id']: id,
            type,
            name
        };
        setSharePopup({ show: true, item });
    };

    const handleShareSuccess = () => {
        // Refresh the list after sharing
        if (currentFolder) {
            fetchFolderContents(currentFolder);
        } else {
            fetchStarredItems();
        }
    };

    const handleDeleteFile = (fileId, fileName) => {
        setDeleteItem({ id: fileId, name: fileName, type: 'file' });
        setShowDeleteDialog(true);
    };

    const handleDeleteFolder = (folderId, folderName) => {
        setDeleteItem({ id: folderId, name: folderName, type: 'folder' });
        setShowDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setDeleteItem(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteItem) return;

        try {
            const endpoint = deleteItem.type === 'folder' ? 'folders' : 'files';

            // Updated URL to include query parameters like in DriveHome.js
            const response = await fetch(`${Server_url}/drive/${endpoint}/${deleteItem.id}?created_by=${user_email}&user_email=${user_email}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAcceptToast({ message: `${deleteItem.type} deleted successfully` });
                // Refresh the list
                if (currentFolder) {
                    fetchFolderContents(currentFolder);
                } else {
                    fetchStarredItems();
                }
            } else {
                const errorData = await response.json();
                showRejectToast({ message: errorData.error || `Failed to delete ${deleteItem.type}` });
            }
        } catch (error) {
            console.error(`Error deleting ${deleteItem.type}:`, error);
            showRejectToast({ message: `Failed to delete ${deleteItem.type}` });
        } finally {
            setShowDeleteDialog(false);
            setDeleteItem(null);
        }
    };

    const sortedFolders = [...starredFolders];
    const sortedFiles = [...starredFiles];
    const allItems = [...sortedFolders, ...sortedFiles];

    // Get the sort icon based on the current sort state
    const getSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc'
            ? <FontAwesomeIcon icon={faSortUp} />
            : <FontAwesomeIcon icon={faSortDown} />;
    };

    return (
        <div className="starred-items-container">
            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && deleteItem && (
                <ConfirmMessage
                    message_title={`Delete ${deleteItem.type === 'file' ? 'File' : 'Folder'}`}
                    message={`Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    button_text="Delete"
                />
            )}

            {/* Rename Dialog */}
            {showRenameDialog && renameItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Rename {renameItem.type}</h2>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={`Enter new name for ${renameItem.type}`}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button onClick={handleRenameCancel}>Cancel</button>
                            <button onClick={handleRenameSubmit}>Rename</button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Component */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    onClose={closePreview}
                />
            )}

            {/* Share Popup */}
            {sharePopup.show && (
                <SharePopup
                    item={sharePopup.item}
                    onClose={() => setSharePopup({ show: false, item: null })}
                    onShare={handleShareSuccess}
                />
            )}

            <div className="drive-header">
                <h1>{activeProfileSection}</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search starred items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            {/* <div className="path-navigation">
                <button onClick={navigateUp} disabled={!currentFolder || isLoading}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Up
                </button>

                <div className="breadcrumb-container">
                    <span
                        className="breadcrumb-item clickable"
                        onClick={() => {
                            setCurrentFolder(null);
                            setBreadcrumbPath([]);
                        }}
                    >
                        Home
                    </span>

                    {breadcrumbPath.map((item, index) => (
                        <span key={item.id}>
                            <span className="breadcrumb-separator">/</span>
                            <span
                                className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : 'clickable'}`}
                                onClick={() => {
                                    if (index < breadcrumbPath.length - 1) {
                                        setCurrentFolder(item.id);
                                        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
                                    }
                                }}
                            >
                                {item.name}
                            </span>
                        </span>
                    ))}
                </div>
            </div> */}

            {/* Selection Bar */}
            {selectedItems.length > 0 && (
                <div className="selection-bar">
                    <div className="selection-count">
                        <button className="clear-selection" onClick={clearSelections}>×</button>
                        <span>{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected</span>
                    </div>
                </div>
            )}

            <div className="files-container">
                <div className="table-container">
                    <table className="files-table">
                        <thead>
                            <tr className="files-header">
                                <th className="checkbox-header">
                                    <div className="select-all-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            title={selectAll ? "Deselect all" : "Select all"}
                                        />
                                    </div>
                                </th>
                                <th
                                    className="name-header"
                                    onClick={() => handleSort('name')}
                                >
                                    <span>NAME</span>
                                    {getSortIcon('name')}
                                </th>
                                <th className="shared-header">
                                    <span>SHARED</span>
                                </th>
                                <th
                                    className="date-header"
                                    onClick={() => handleSort('date')}
                                >
                                    <span>LAST MODIFIED</span>
                                    {getSortIcon('date')}
                                </th>
                                <th
                                    className="size-header"
                                    onClick={() => handleSort('size')}
                                >
                                    <span>FILE SIZE</span>
                                    {getSortIcon('size')}
                                </th>
                                <th className="actions-header"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="loading-cell">
                                        <div className="loading_drive">
                                            <div className="loading-spinner-drive"></div>
                                            <p>Loading your files...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : allItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-cell">
                                        <div className="empty-state">
                                            <div className="empty-icon">
                                                <FontAwesomeIcon icon={faStar} size="3x" />
                                            </div>
                                            <p>No starred items found</p>
                                            <p>Mark important files with a star to find them quickly here</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Render all items in table rows
                                [...sortedFolders, ...sortedFiles].map(item => {
                                    const itemType = 'folder_id' in item ? 'folder' : 'file';
                                    const itemId = itemType === 'folder' ? item.folder_id : item.file_id;
                                    return (
                                        <FileItem
                                            key={`${itemType}-${itemId}`}
                                            item={item}
                                            type={itemType}
                                            viewMode="list"
                                            isSelected={selectedItems.some(selectedItem =>
                                                selectedItem.id === itemId &&
                                                selectedItem.type === itemType
                                            )}
                                            onSelect={toggleSelectItem}
                                            onNavigate={navigateToFolder}
                                            onDownload={handleDownloadFile}
                                            onStar={handleUnstar}
                                            onEdit={handleOpenRenameDialog}
                                            onShare={handleShare}
                                            onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                            formatFileSize={formatFileSize}
                                            formatDate={formatDate}
                                            onClick={handleItemClick}
                                            selectionMode={selectionMode}
                                            globalActivePopup={activePopup}
                                            setGlobalActivePopup={handleSetActivePopup}
                                        />
                                    );
                                })
                            )}
                            {downloadProgress.isDownloading && (
                                <tr className="download-progress-overlay">
                                    <td colSpan="6">
                                        <div className="download-progress-container">
                                            <p>Downloading {downloadProgress.fileName}</p>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress"
                                                    style={{ width: `${downloadProgress.progress}%` }}
                                                ></div>
                                            </div>
                                            <p>{downloadProgress.progress}%</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StarredItems 