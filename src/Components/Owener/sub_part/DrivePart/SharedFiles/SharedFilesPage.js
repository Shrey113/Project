import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../../redux/UIContext'
import '../DriveStyles.css'
import './SharedFilesPage.css'
import { Server_url, showAcceptToast, showRejectToast, ConfirmMessage } from '../../../../../redux/AllData'
import { useSelector } from 'react-redux'
import FileItem from '../FileItem'
import FilePreview from '../FilePreview'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-hot-toast'
import SharePopup from '../SharePopup'

function SharedFilesPage() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;

    const [activeTab, setActiveTab] = useState('shared-with-me')
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [sharedWithMe, setSharedWithMe] = useState([])
    const [sharedByMe, setSharedByMe] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('list')
    const [selectedItems, setSelectedItems] = useState({})
    const [globalActivePopup, setGlobalActivePopup] = useState(null)
    const [previewFile, setPreviewFile] = useState(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteItem, setDeleteItem] = useState(null)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [renameItem, setRenameItem] = useState(null)
    const [newItemName, setNewItemName] = useState('')
    const [sharePopup, setSharePopup] = useState({
        show: false,
        item: null
    })

    // Add new state variables for folder navigation
    const [currentFolder, setCurrentFolder] = useState(null)
    const [currentPath, setCurrentPath] = useState('/')
    const [breadcrumbPath, setBreadcrumbPath] = useState([])
    const [folderContents, setFolderContents] = useState({ files: [], folders: [] })

    const [showShareModal, setShowShareModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [shareEmail, setShareEmail] = useState('')
    const [sharePermission, setSharePermission] = useState('READ')

    useEffect(() => {
        if (activeProfileSection !== 'Shared Files') {
            setActiveProfileSection('Shared Files')
        }

        // Fetch shared items based on active tab
        fetchSharedItems()
    }, [activeProfileSection, setActiveProfileSection, activeTab, user_email])

    const fetchSharedItems = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'shared-with-me') {
                // Use the new POST endpoint for shared-with-me
                const response = await fetch(`${Server_url}/share_drive/share_drive_with_me`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_email })
                })

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`)
                }

                const data = await response.json()
                console.log("shared with me", data)

                // Process the new data format
                const combinedItems = [
                    ...(data.shared_folders || []).map(folder => ({
                        ...folder,
                        type: 'folder',
                        name: folder.folder_name,
                        shared_at: folder.created_at,
                        shared_by: folder.shared_by
                    })),
                    ...(data.shared_files || []).map(file => ({
                        ...file,
                        type: 'file',
                        name: file.file_name,
                        file_type: file.file_extension || file.type || 'file',
                        shared_at: file.created_at,
                        shared_by: file.shared_by
                    }))
                ]

                console.log("combined items", combinedItems)
                setSharedWithMe(combinedItems)
            } else {
                // Use the new POST endpoint for shared-by-me
                const response = await fetch(`${Server_url}/share_drive/share_drive_by_me`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_email })
                })

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`)
                }

                const data = await response.json()
                console.log("shared by me", data)

                // Process the new data format
                const combinedItems = [
                    ...(data.shared_folders || []).map(folder => ({
                        ...folder,
                        type: 'folder',
                        shared_with: folder.shared_with ? folder.shared_with.split(',') : []
                    })),
                    ...(data.shared_files || []).map(file => ({
                        ...file,
                        type: 'file',
                        file_type: file.file_extension || file.type || 'file',
                        shared_with: file.shared_with ? file.shared_with.split(',') : []
                    }))
                ]

                console.log("combined items", combinedItems)
                setSharedByMe(combinedItems)
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab} items:`, error)
            // Set empty arrays instead of fake data
            if (activeTab === 'shared-with-me') {
                setSharedWithMe([])
            } else {
                setSharedByMe([])
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleShareItem = async (e) => {
        e.preventDefault()
        if (!shareEmail.trim() || !selectedItem) return

        try {
            const response = await fetch(`${Server_url}/drive/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: selectedItem.id || selectedItem.file_id || selectedItem.folder_id,
                    item_type: selectedItem.type,
                    user_email: user_email,
                    shared_with: shareEmail,
                    permission: sharePermission
                })
            })

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }

            // Refresh shared items
            fetchSharedItems()

            // Close modal and reset form
            setShowShareModal(false)
            setSelectedItem(null)
            setShareEmail('')
            setSharePermission('READ')
        } catch (error) {
            console.error('Error sharing item:', error)
        }
    }

    const handleRemoveAccess = async (itemId, itemType, userToRemove) => {
        try {
            const response = await fetch(`${Server_url}/drive/share`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: itemId,
                    item_type: itemType,
                    user_email: user_email,
                    shared_with: userToRemove
                })
            })

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }

            // Refresh shared items
            fetchSharedItems()
        } catch (error) {
            console.error('Error removing access:', error)
        }
    }

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            // Get the owner's email for the file (created_by parameter)
            const response = await fetch(`${Server_url}/drive/files/${fileId}?user_email=${user_email}&created_by=${user_email}&download=true`)

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }

            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download error:', error)
        }
    }

    // Format file size for display
    const formatFileSize = (size) => {
        if (!size) return '0 B'
        if (typeof size === 'object') return '-'

        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
        let formattedSize = size
        let unitIndex = 0

        while (formattedSize >= 1024 && unitIndex < units.length - 1) {
            formattedSize /= 1024
            unitIndex++
        }

        return `${formattedSize.toFixed(1)} ${units[unitIndex]}`
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString()
    }

    // Handle item selection
    const handleSelectItem = (itemId, type) => {
        setSelectedItems(prev => {
            const newSelectedItems = { ...prev }

            if (newSelectedItems[`${type}-${itemId}`]) {
                delete newSelectedItems[`${type}-${itemId}`]
            } else {
                newSelectedItems[`${type}-${itemId}`] = { id: itemId, type }
            }

            return newSelectedItems
        })
    }

    // Handle renaming items
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
                fetchSharedItems();
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

    // Handle deleting items
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
            // For shared items, implement removing access rather than actual deletion
            const response = await fetch(`${Server_url}/share_drive/remove_access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: deleteItem.id,
                    item_type: deleteItem.type,
                    user_email: user_email
                })
            });

            if (response.ok) {
                showAcceptToast({ message: `${deleteItem.type} removed from shared items` });
                fetchSharedItems();
            } else {
                const errorData = await response.json();
                showRejectToast({ message: errorData.error || `Failed to remove ${deleteItem.type}` });
            }
        } catch (error) {
            console.error(`Error removing ${deleteItem.type}:`, error);
            showRejectToast({ message: `Failed to remove ${deleteItem.type}` });
        } finally {
            setShowDeleteDialog(false);
            setDeleteItem(null);
        }
    };

    // Handle starring items
    const handleStar = async (itemId, itemType, isStarred) => {
        try {
            const response = await fetch(`${Server_url}/starred/drive/${itemType === 'file' ? 'files' : 'folders'}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_starred: !isStarred,
                    modified_by: user_email
                })
            });

            if (response.ok) {
                showAcceptToast({ message: `${itemType} ${isStarred ? 'unstarred' : 'starred'} successfully` });

                // Update the local state for immediate feedback
                if (activeTab === 'shared-with-me') {
                    setSharedWithMe(prev => prev.map(item => {
                        if ((itemType === 'file' && item.file_id === itemId) ||
                            (itemType === 'folder' && item.folder_id === itemId)) {
                            return { ...item, is_starred: !isStarred };
                        }
                        return item;
                    }));
                } else {
                    setSharedByMe(prev => prev.map(item => {
                        if ((itemType === 'file' && item.file_id === itemId) ||
                            (itemType === 'folder' && item.folder_id === itemId)) {
                            return { ...item, is_starred: !isStarred };
                        }
                        return item;
                    }));
                }
            } else {
                const errorData = await response.json();
                showRejectToast({ message: errorData.error || `Failed to ${isStarred ? 'unstar' : 'star'} ${itemType}` });
            }
        } catch (error) {
            console.error(`Error ${isStarred ? 'unstarring' : 'starring'} ${itemType}:`, error);
            showRejectToast({ message: `Failed to ${isStarred ? 'unstar' : 'star'} ${itemType}` });
        }
    };

    // Handle sharing items
    const handleShare = (id, type, name) => {
        const item = {
            [type === 'file' ? 'file_id' : 'folder_id']: id,
            type,
            name
        };
        setSharePopup({ show: true, item });
    };

    const handleShareSuccess = () => {
        fetchSharedItems();
    };

    // Sort and filter items
    const getItemsToDisplay = () => {
        const items = activeTab === 'shared-with-me' ? sharedWithMe : sharedByMe

        if (!Array.isArray(items)) {
            return []
        }

        return [...items].sort((a, b) => {
            const aValue = a[sortBy] || ''
            const bValue = b[sortBy] || ''
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            return sortOrder === 'asc' ? compareResult : -compareResult
        }).filter(item => {
            const itemName = item.name || item.file_name || ''
            return itemName.toLowerCase().includes(searchTerm.toLowerCase())
        })
    }

    const sortedItems = getItemsToDisplay()

    // Add new function to handle folder navigation
    const navigateToFolder = async (folderId, folderName, sharedBy) => {
        setIsLoading(true);
        try {
            // Update current folder and path
            setCurrentFolder(folderId);
            setCurrentPath(prevPath => prevPath === '/' ? `/${folderName}` : `${prevPath}/${folderName}`);

            // Update breadcrumb path with shared_by information
            setBreadcrumbPath(prevPath => [...prevPath, { id: folderId, name: folderName, shared_by: sharedBy }]);

            // Fetch folder contents using the owner's email (shared_by) 
            // Make sure we use the correct API endpoint matching what's in DriveHome.js
            const response = await fetch(`${Server_url}/drive/folders/${folderId}/contents?user_email=${encodeURIComponent(user_email)}&created_by=${encodeURIComponent(sharedBy || user_email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log("Folder contents:", data);

            // Process the folder contents to have consistent format
            const processedFiles = (data.files || []).map(file => ({
                ...file,
                type: 'file',
                file_type: file.file_extension || file.type || 'file',
                shared_by: sharedBy || file.created_by || user_email
            }));

            const processedFolders = (data.folders || []).map(folder => ({
                ...folder,
                type: 'folder',
                shared_by: sharedBy || folder.created_by || user_email
            }));

            setFolderContents({
                files: processedFiles,
                folders: processedFolders
            });
        } catch (error) {
            console.error('Error fetching folder contents:', error);
            toast.error('Failed to load folder contents');
            setFolderContents({ files: [], folders: [] });
        } finally {
            setIsLoading(false);
        }
    };

    // Add function to navigate up
    const navigateUp = () => {
        if (breadcrumbPath.length <= 1) {
            // If at root or only one level deep, go to root
            setCurrentFolder(null);
            setCurrentPath('/');
            setBreadcrumbPath([]);
            setFolderContents({ files: [], folders: [] });
            return;
        }

        // Navigate to the parent folder
        const newBreadcrumbPath = [...breadcrumbPath];
        newBreadcrumbPath.pop(); // Remove the current folder from breadcrumb

        const parentFolder = newBreadcrumbPath.length > 0
            ? newBreadcrumbPath[newBreadcrumbPath.length - 1]
            : null;

        if (parentFolder) {
            setCurrentFolder(parentFolder.id);
            setBreadcrumbPath(newBreadcrumbPath);
            setCurrentPath(newBreadcrumbPath.map(item => item.name).join('/'));
        } else {
            // If something went wrong with the breadcrumb, go to root
            setCurrentFolder(null);
            setCurrentPath('/');
            setBreadcrumbPath([]);
            setFolderContents({ files: [], folders: [] });
        }
    };

    // Add preview handler functions
    const handleItemClick = (item) => {
        // Check if it's a folder and navigate to it
        if (item.type === 'folder' || item.folder_id) {
            const folderId = item.folder_id || item.id;
            const folderName = item.folder_name || item.name;
            const sharedBy = item.shared_by || item.created_by;
            navigateToFolder(folderId, folderName, sharedBy);
            return;
        }

        // It's a file - handle file preview
        if (item.type === 'file' || item.file_id) {
            // Get file extension from name if not available in file_type
            let fileType = item.file_type || item.type || '';
            if (fileType === 'file' && item.file_name) {
                const nameParts = item.file_name.split('.');
                if (nameParts.length > 1) {
                    fileType = nameParts[nameParts.length - 1];
                }
            }

            // Ensure we have all the required properties for FilePreview
            const fileData = {
                file_id: item.file_id || item.id,
                file_name: item.file_name || item.name,
                file_type: fileType,
                ...item // Include all other item properties
            };
            console.log("Setting preview file:", fileData);
            setPreviewFile(fileData);
        }
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div className="shared-files-container">
            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && deleteItem && (
                <ConfirmMessage
                    message_title={`Remove ${deleteItem.type === 'file' ? 'File' : 'Folder'}`}
                    message={`Are you sure you want to remove "${deleteItem.name}" from shared items?`}
                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    button_text="Remove"
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

            {/* Share Popup */}
            {sharePopup.show && (
                <SharePopup
                    item={sharePopup.item}
                    onClose={() => setSharePopup({ show: false, item: null })}
                    onShare={handleShareSuccess}
                />
            )}

            {/* File Preview */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    onClose={closePreview}
                />
            )}

            <div className="drive-header">
                <h1>{activeProfileSection}</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search shared items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tabs-container">
                <div
                    className={`tab ${activeTab === 'shared-with-me' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shared-with-me')}
                >
                    Shared with me
                </div>
                <div
                    className={`tab ${activeTab === 'shared-by-me' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shared-by-me')}
                >
                    Shared by me
                </div>
            </div>

            {/* Add path navigation */}
            {currentFolder && (
                <div className="path-navigation">
                    <button onClick={navigateUp} disabled={isLoading}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    <div className="breadcrumb-container">
                        <span
                            className="breadcrumb-item clickable"
                            onClick={() => {
                                setCurrentFolder(null);
                                setCurrentPath('/');
                                setBreadcrumbPath([]);
                                setFolderContents({ files: [], folders: [] });
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
                                            navigateToFolder(item.id, item.name, item.shared_by);
                                        }
                                    }}
                                >
                                    {item.name}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="files-container">
                {viewMode === 'list' && (
                    <div className="table-container">
                        <table className="files-table">
                            <thead>
                                <tr className="files-header">
                                    <th className="checkbox-header">
                                        {/* Checkbox for select all could go here */}
                                    </th>
                                    <th className="name-header" onClick={() => {
                                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                                        setSortBy('name')
                                    }}>
                                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="shared-header">
                                        {activeTab === 'shared-with-me' ? 'Shared By' : 'Shared With'}
                                    </th>
                                    <th className="date-header" onClick={() => {
                                        setSortOrder(sortBy === 'shared_at' && sortOrder === 'asc' ? 'desc' : 'asc')
                                        setSortBy('shared_at')
                                    }}>
                                        Date Shared {sortBy === 'shared_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="size-header">
                                        Size
                                    </th>
                                    <th className="actions-header"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="loading-cell">
                                            <div className="loading">
                                                <div className="loading-spinner"></div>
                                                <p>Loading items...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentFolder ? (
                                    // Show folder contents when in a folder
                                    [...folderContents.folders, ...folderContents.files].length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-cell">
                                                <div className="empty-state">
                                                    <p>This folder is empty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        [...folderContents.folders, ...folderContents.files].map(item => {
                                            const itemType = item.folder_id ? 'folder' : 'file';
                                            const itemId = itemType === 'folder' ? item.folder_id : item.file_id;
                                            const isItemSelected = !!selectedItems[`${itemType}-${itemId}`];

                                            return (
                                                <FileItem
                                                    key={`${itemType}-${itemId}`}
                                                    item={{
                                                        ...item,
                                                        shared_by: item.shared_by || '-',
                                                        shared_with: activeTab === 'shared-with-me' ? [] : (item.shared_with || [])
                                                    }}
                                                    type={itemType}
                                                    viewMode={viewMode}
                                                    isSelected={isItemSelected}
                                                    onSelect={handleSelectItem}
                                                    onNavigate={itemType === 'folder' ? (id, name) => navigateToFolder(id, name, item.shared_by || item.created_by) : null}
                                                    onDownload={itemType === 'file' ? handleDownloadFile : null}
                                                    onStar={handleStar}
                                                    onEdit={handleOpenRenameDialog}
                                                    onShare={handleShare}
                                                    onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                                    formatFileSize={formatFileSize}
                                                    formatDate={formatDate}
                                                    setGlobalActivePopup={setGlobalActivePopup}
                                                    globalActivePopup={globalActivePopup}
                                                    onClick={(item) => handleItemClick(item)}
                                                />
                                            );
                                        })
                                    )
                                ) : (
                                    // Show shared items when not in a folder
                                    sortedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-cell">
                                                <div className="empty-state">
                                                    {activeTab === 'shared-with-me' ? (
                                                        <>
                                                            <p>No files have been shared with you yet.</p>
                                                            <p>Files and folders others share with you will appear here.</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>You haven't shared any files yet.</p>
                                                            <p>Share files with others and they will appear here.</p>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedItems.map(item => {
                                            const itemType = item.type || (item.file_id ? 'file' : 'folder');
                                            const itemId = itemType === 'file' ? item.file_id || item.id : item.folder_id || item.id;
                                            const isItemSelected = !!selectedItems[`${itemType}-${itemId}`];

                                            return (
                                                <FileItem
                                                    key={`${itemType}-${itemId}`}
                                                    item={{
                                                        ...item,
                                                        shared_by: item.shared_by || '-',
                                                        shared_with: activeTab === 'shared-with-me' ? [] : (item.shared_with || [])
                                                    }}
                                                    type={itemType}
                                                    viewMode={viewMode}
                                                    isSelected={isItemSelected}
                                                    onSelect={handleSelectItem}
                                                    onNavigate={itemType === 'folder' ? (id, name) => navigateToFolder(id, name, item.shared_by || item.created_by) : null}
                                                    onDownload={handleDownloadFile}
                                                    onStar={handleStar}
                                                    onEdit={handleOpenRenameDialog}
                                                    onShare={handleShare}
                                                    onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                                    formatFileSize={formatFileSize}
                                                    formatDate={formatDate}
                                                    setGlobalActivePopup={setGlobalActivePopup}
                                                    globalActivePopup={globalActivePopup}
                                                    onClick={(item) => handleItemClick(item)}
                                                />
                                            );
                                        })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {viewMode === 'grid' && (
                    <div className={`files-list grid-layout`}>
                        {isLoading ? (
                            <div className="loading">
                                <div className="loading-spinner"></div>
                                <p>Loading shared items...</p>
                            </div>
                        ) : sortedItems.length === 0 ? (
                            <div className="empty-state">
                                {activeTab === 'shared-with-me' ? (
                                    <>
                                        <p>No files have been shared with you yet.</p>
                                        <p>Files and folders others share with you will appear here.</p>
                                    </>
                                ) : (
                                    <>
                                        <p>You haven't shared any files yet.</p>
                                        <p>Share files with others and they will appear here.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            sortedItems.map(item => {
                                const itemType = item.type || (item.file_id ? 'file' : 'folder');
                                const itemId = itemType === 'file' ? item.file_id || item.id : item.folder_id || item.id;
                                const itemName = item.file_name || item.folder_name || item.name;
                                const isItemSelected = !!selectedItems[`${itemType}-${itemId}`];

                                return (
                                    <FileItem
                                        key={`${itemType}-${itemId}`}
                                        item={{
                                            ...item,
                                            shared_by: item.shared_by || '-',
                                            shared_with: activeTab === 'shared-with-me' ? [] : (item.shared_with || [])
                                        }}
                                        type={itemType}
                                        viewMode={viewMode}
                                        isSelected={isItemSelected}
                                        onSelect={handleSelectItem}
                                        onNavigate={itemType === 'folder' ? (id, name) => navigateToFolder(id, name, item.shared_by || item.created_by) : null}
                                        onDownload={handleDownloadFile}
                                        onStar={handleStar}
                                        onEdit={handleOpenRenameDialog}
                                        onShare={handleShare}
                                        onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                        formatFileSize={formatFileSize}
                                        formatDate={formatDate}
                                        setGlobalActivePopup={setGlobalActivePopup}
                                        globalActivePopup={globalActivePopup}
                                        onClick={(item) => handleItemClick(item)}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay">
                    <div className="share-modal">
                        <h3>Share "{selectedItem?.name}"</h3>

                        <form onSubmit={handleShareItem}>
                            <div className="form-group">
                                <label>Email address</label>
                                <input
                                    type="email"
                                    placeholder="Enter email to share with"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Permission</label>
                                <select
                                    value={sharePermission}
                                    onChange={(e) => setSharePermission(e.target.value)}
                                >
                                    <option value="READ">View only</option>
                                    <option value="WRITE">Edit</option>
                                    <option value="FULL">Full access</option>
                                </select>
                            </div>

                            {activeTab === 'shared-by-me' && selectedItem?.shared_with && (
                                <div className="already-shared">
                                    <h4>Already shared with:</h4>
                                    <ul>
                                        {Array.isArray(selectedItem.shared_with)
                                            ? selectedItem.shared_with.map((email, index) => (
                                                <li key={index}>
                                                    {email}
                                                    <button
                                                        type="button"
                                                        className="remove-access-btn"
                                                        onClick={() => handleRemoveAccess(selectedItem.id, selectedItem.type, email)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))
                                            : typeof selectedItem.shared_with === 'string' && selectedItem.shared_with.trim() !== '' && (
                                                <li>
                                                    {selectedItem.shared_with}
                                                    <button
                                                        type="button"
                                                        className="remove-access-btn"
                                                        onClick={() => handleRemoveAccess(selectedItem.id, selectedItem.type, selectedItem.shared_with)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowShareModal(false)
                                        setSelectedItem(null)
                                        setShareEmail('')
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-share">
                                    Share
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SharedFilesPage 