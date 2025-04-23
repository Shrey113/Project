import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faUpload, faPlusSquare, faSync } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url, FileLoaderToast } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'
import FileItem from './FileItem'
import FilePreview from './FilePreview'

function DriveHome() {
    const user = useSelector((state) => state.user);
    const created_by = user.user_email;
    const user_email = user.user_email;
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])
    const [currentPath, setCurrentPath] = useState('/')
    const [currentFolder, setCurrentFolder] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 })
    const [selectedItems, setSelectedItems] = useState([])
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [storageUsed, setStorageUsed] = useState(0)
    const [storageLimit, setStorageLimit] = useState(1024) // 1GB in MB
    const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-renders

    // Rename dialog state variables
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [renameItemType, setRenameItemType] = useState('') // 'file' or 'folder'
    const [renameItemId, setRenameItemId] = useState(null)
    const [renameItemOldName, setRenameItemOldName] = useState('')
    const [renameItemNewName, setRenameItemNewName] = useState('') // Initialize with empty string
    const [dialogMode, setDialogMode] = useState('rename') // 'rename' or 'create'

    const [previewFile, setPreviewFile] = useState(null);

    // Function to trigger a refresh
    const refreshDrive = () => {
        console.log("Refreshing drive content...");
        setRefreshKey(prevKey => prevKey + 1);
    };


    useEffect(() => {
        if (activeProfileSection !== 'Drive Home') {
            setActiveProfileSection('Drive Home')
        }

        const fetchFilesAndFolders = async () => {
            setIsLoading(true);
            console.log("Fetching files and folders, currentFolder:", currentFolder);

            try {
                // Use query parameters for both user_email and created_by
                const url = new URL(`${Server_url}/drive/get_all_files_and_folders/${created_by}`);
                url.searchParams.append('user_email', user_email);

                const response = await fetch(url.toString());

                // Check if response is OK
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error:', response.status, errorText);
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log("Files and folders fetched:", data);

                // Handle the updated response format that now contains both files and folders
                if (data.files) {
                    console.log("Filessssssssss:", data.files);

                    setFiles(data.files);
                }

                if (data.folders) {
                    console.log("Folderssssssssssssssss:", data.folders);

                    setFolders(data.folders);
                }
            } catch (error) {
                console.error('Error fetching files and folders:', error);
                // Fallback to sample data
                setFolders([
                    { folder_id: 1, folder_name: 'Documents', created_at: new Date().toISOString() },
                    { folder_id: 2, folder_name: 'Images', created_at: new Date().toISOString() }
                ]);
                setFiles([
                    { file_id: 1, file_name: 'Report.pdf', file_size: 2.4, file_type: 'pdf', created_at: new Date().toISOString() },
                    { file_id: 2, file_name: 'Presentation.pptx', file_size: 5.7, file_type: 'pptx', created_at: new Date().toISOString() }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        // Load initial files and folders
        fetchFilesAndFolders();

        const fetchStorageInfo = async () => {
            try {
                const response = await fetch(`${Server_url}/drive/storage?created_by=${created_by}&user_email=${user_email}`)
                const data = await response.json()
                setStorageUsed(data.used || 125) // MB used
                setStorageLimit(data.limit || 1024) // MB total
            } catch (error) {
                console.error('Error fetching storage info:', error)
                // Set demo data
                setStorageUsed(125)
            }
        }


        // Get storage info
        fetchStorageInfo()
    }, [activeProfileSection, setActiveProfileSection, refreshKey, currentFolder, created_by, user_email]) // Add refreshKey to dependencies

    // Add handleOpenRenameDialog function
    const handleOpenRenameDialog = (id, type, currentName) => {
        console.log("Opening rename dialog:", { id, type, currentName });

        // Ensure we have the current name
        if (!currentName) {
            // Try to find the name from the items based on ID and type
            if (type === 'folder') {
                const folder = folders.find(f => f.folder_id === id);
                currentName = folder ? folder.folder_name : '';
                console.log("Found folder name from state:", currentName);
            } else if (type === 'file') {
                const file = files.find(f => f.file_id === id);
                currentName = file ? file.file_name : '';
                console.log("Found file name from state:", currentName);
            }
        }

        console.log("Setting rename dialog values:", {
            id,
            type,
            oldName: currentName,
            newName: currentName
        });

        setRenameItemId(id);
        setRenameItemType(type);
        setRenameItemOldName(currentName);
        setRenameItemNewName(currentName);
        setDialogMode('rename');
        setShowRenameDialog(true);

        // The text will be selected when the input gets focus (using onFocus handler)
    };

    // Function to open the dialog in create folder mode
    const handleOpenCreateFolderDialog = () => {
        setRenameItemType('folder');
        setRenameItemId(null);
        setRenameItemOldName('');
        setRenameItemNewName('');
        setDialogMode('create');
        setShowRenameDialog(true);
    };

    // Combined function for both rename and create folder operations
    const handleDialogSubmit = async () => {
        // Validate input - safely check if the value exists and is not empty
        if (!renameItemNewName || !renameItemNewName.trim()) {
            setShowRenameDialog(false);
            return;
        }

        // If renaming and name hasn't changed, just close dialog
        if (dialogMode === 'rename' && renameItemNewName === renameItemOldName) {
            setShowRenameDialog(false);
            return;
        }

        setIsLoading(true);

        try {
            if (dialogMode === 'rename') {
                // RENAME OPERATION
                const endpoint = renameItemType === 'file'
                    ? `${Server_url}/drive/files/${renameItemId}?created_by=${created_by}&user_email=${user_email}`
                    : `${Server_url}/drive/folders/${renameItemId}?created_by=${created_by}&user_email=${user_email}`;

                console.log(`Renaming ${renameItemType} from "${renameItemOldName}" to "${renameItemNewName}"`);

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        [renameItemType === 'file' ? 'file_name' : 'folder_name']: renameItemNewName,
                        modified_by: created_by,
                        is_shared: false // Maintain current sharing status
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to rename ${renameItemType}: ${errorText}`);
                }

                const result = await response.json();
                console.log("Rename successful:", result);

                // Update local state to reflect the change immediately
                if (renameItemType === 'file') {
                    setFiles(prevFiles =>
                        prevFiles.map(file =>
                            file.file_id === renameItemId
                                ? { ...file, file_name: renameItemNewName }
                                : file
                        )
                    );
                } else {
                    setFolders(prevFolders =>
                        prevFolders.map(folder =>
                            folder.folder_id === renameItemId
                                ? { ...folder, folder_name: renameItemNewName }
                                : folder
                        )
                    );
                }
            } else {
                // CREATE FOLDER OPERATION
                console.log(`Creating folder: ${renameItemNewName}`);

                const response = await fetch(`${Server_url}/drive/create-folder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        folder_name: renameItemNewName,
                        created_by: created_by,
                        user_email: user_email,
                        modified_by: created_by
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to create folder: ${errorText}`);
                }

                const result = await response.json();
                console.log("Folder created successfully:", result);
            }

            // Close the dialog and refresh to get updated data
            setShowRenameDialog(false);
            refreshDrive();

        } catch (error) {
            console.error(`Error ${dialogMode === 'rename' ? 'renaming' : 'creating'} item:`, error);
            alert(`Failed to ${dialogMode === 'rename' ? 'rename' : 'create'} ${renameItemType}: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setIsLoading(true);
        const totalFiles = files.length;
        let completedFiles = 0;
        setUploadProgress({ completed: 0, total: totalFiles });

        try {
            console.log("Starting upload of", totalFiles, "files");

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Processing file ${i + 1}/${totalFiles}:`, file.name, "size:", file.size);

                // Create FormData for each file
                const formData = new FormData();
                formData.append('file', file);

                // Construct upload URL with proper parameters
                const uploadUrl = new URL(`${Server_url}/drive/upload-file`);
                uploadUrl.searchParams.append('created_by', created_by);
                uploadUrl.searchParams.append('user_email', user_email);

                // All files are now uploaded directly to user's drive folder
                console.log("Uploading to user's drive folder");

                console.log("Sending request to:", uploadUrl.toString());

                // Send file to server using FormData with proper headers for Busboy
                const response = await fetch(uploadUrl.toString(), {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Upload successful:", result);
                    completedFiles++;
                    setUploadProgress({ completed: completedFiles, total: totalFiles });
                } else {
                    const errorText = await response.text();
                    console.error(`Upload failed for ${file.name}:`, errorText);
                    alert(`Failed to upload ${file.name}: ${errorText}`);
                }
            }

            // All uploads completed
            console.log("All uploads completed");
            setUploadProgress({ completed: 0, total: 0 });
            refreshDrive(); // Use the refresh function instead of direct fetch calls
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToFolder = (folderId, folderName) => {
        // We're not actually navigating between folders since our system now just shows all files
        // But we'll update the path for display purposes
        setCurrentFolder(folderId)
        setCurrentPath(currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`)

        // Just reload the files list - the backend will return all files regardless
        refreshDrive();
    }

    const navigateUp = () => {
        if (currentPath === '/') return

        // Just for display purposes
        const pathParts = currentPath.split('/')
        pathParts.pop() // Remove current folder name
        const newPath = pathParts.join('/') || '/'

        setCurrentFolder(null)
        setCurrentPath(newPath)

        // Just reload the files list
        refreshDrive();
    }

    const toggleSelectItem = (id, type) => {
        const existingIndex = selectedItems.findIndex(item => item.id === id && item.type === type)

        if (existingIndex >= 0) {
            setSelectedItems(selectedItems.filter((_, index) => index !== existingIndex))
        } else {
            setSelectedItems([...selectedItems, { id, type }])
        }
    }

    const handleDeleteFile = async (fileId, fileName) => {
        const confirmed = window.confirm(`Are you sure you want to delete the file "${fileName}"?`);
        if (!confirmed) return;

        setIsLoading(true);
        try {
            console.log(`Deleting file: ${fileName} (ID: ${fileId})`);

            const endpoint = `${Server_url}/drive/files/${fileId}?created_by=${created_by}&user_email=${user_email}`;
            console.log(`Sending delete request to: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to delete file: ${errorText}`);
                throw new Error(`Server error: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            console.log("Delete successful:", result);

            alert(`File "${fileName}" deleted successfully`);
            refreshDrive();
        } catch (error) {
            console.error("Error deleting file:", error);
            alert(`Failed to delete file: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedItems.length) return;

        const confirmed = window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`);
        if (!confirmed) return;

        setIsLoading(true);
        let successCount = 0;
        let failCount = 0;
        let deletedItemNames = [];

        for (const item of selectedItems) {
            try {
                console.log(`Deleting ${item.type} with ID: ${item.id}`);
                let endpoint;
                let itemName = '';

                // Find the name of the item for better logging
                if (item.type === 'file') {
                    const fileObj = files.find(f => f.file_id === item.id);
                    itemName = fileObj ? fileObj.file_name : `file #${item.id}`;
                    endpoint = `${Server_url}/drive/files/${item.id}?created_by=${created_by}&user_email=${user_email}`;
                } else {
                    const folderObj = folders.find(f => f.folder_id === item.id);
                    itemName = folderObj ? folderObj.folder_name : `folder #${item.id}`;
                    endpoint = `${Server_url}/drive/folders/${item.id}?created_by=${created_by}&user_email=${user_email}`;
                }

                console.log(`Deleting ${item.type}: "${itemName}" - sending request to: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`Successfully deleted ${item.type} "${itemName}":`, result);
                    successCount++;
                    deletedItemNames.push(itemName);
                } else {
                    const errorText = await response.text();
                    console.error(`Failed to delete ${item.type} "${itemName}":`, errorText);
                    failCount++;
                }
            } catch (error) {
                console.error(`Error deleting ${item.type}:`, error);
                failCount++;
            }
        }

        if (failCount > 0) {
            if (successCount > 0) {
                alert(`Deleted ${successCount} items (${deletedItemNames.join(', ')}), but failed to delete ${failCount} items.`);
            } else {
                alert(`Failed to delete all ${failCount} items. Please try again.`);
            }
        } else if (successCount > 0) {
            if (successCount === 1) {
                alert(`Successfully deleted "${deletedItemNames[0]}"`);
            } else {
                alert(`Successfully deleted ${successCount} items`);
            }
        }

        setSelectedItems([]);
        setIsLoading(false);
        refreshDrive();
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            console.log(`Downloading file: ${fileName} (ID: ${fileId})`);

            const response = await fetch(`${Server_url}/drive/files/${fileId}?created_by=${created_by}&user_email=${user_email}&download=true`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Download error:', errorText);
                throw new Error(`Download failed: ${errorText}`);
            }

            const blob = await response.blob();
            console.log(`File downloaded, size: ${blob.size} bytes`);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert(`Failed to download file: ${error.message}`);
        }
    }

    const handleStar = async (itemId, itemType, isStarred) => {
        console.log(`Starring ${itemType} with ID: ${itemId}, current starred status: ${isStarred}`);
        try {
            const response = await fetch(`${Server_url}/starred/drive/${itemType === 'file' ? 'files' : 'folders'}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_starred: !isStarred,
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state immediately for real-time feedback
                if (itemType === 'file') {
                    setFiles(prevFiles =>
                        prevFiles.map(file =>
                            file.file_id === itemId
                                ? { ...file, is_starred: !isStarred }
                                : file
                        )
                    );
                } else {
                    setFolders(prevFolders =>
                        prevFolders.map(folder =>
                            folder.folder_id === itemId
                                ? { ...folder, is_starred: !isStarred }
                                : folder
                        )
                    );
                }
                // No need to fetch all files and folders again
            } else {
                console.error("Error starring item:", data?.error || "Unknown error");
            }
        } catch (error) {
            console.error('Error starring item:', error);
        }
    };

    function formatFileSize(size) {
        const num = Number(size);
        if (isNaN(num)) return '0 B';

        const kb = num / 1024;
        const mb = kb / 1024;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        if (kb >= 1) return `${kb.toFixed(2)} KB`;
        return `${num} B`;
    }

    // Update the sorting logic to always show folders on top
    const sortItems = (items, type, sortKey, order) => {
        return [...items].sort((a, b) => {
            // Get values to compare
            const aValue = a[sortKey] || '';
            const bValue = b[sortKey] || '';

            // Determine sort direction
            const direction = order === 'asc' ? 1 : -1;

            // Compare values
            let result;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                result = aValue.localeCompare(bValue) * direction;
            } else {
                result = (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * direction;
            }

            return result;
        });
    };

    // Sort and filter files and folders
    const sortedFolders = Array.isArray(folders)
        ? sortItems(
            folders.filter(folder => folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase())),
            'folder',
            sortBy,
            sortOrder
        )
        : [];

    const sortedFiles = Array.isArray(files)
        ? sortItems(
            files.filter(file => file.file_name.toLowerCase().includes(searchTerm.toLowerCase())),
            'file',
            sortBy,
            sortOrder
        )
        : [];

    // Create a function to get sort icon
    const getSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc'
            ? <span className="sort-icon">↑</span>
            : <span className="sort-icon">↓</span>;
    };

    const percentUsed = (storageUsed / storageLimit) * 100

    // Add a click handler for file items
    const handleItemClick = (item, type) => {
        if (type === 'folder') {
            navigateToFolder(item.folder_id, item.folder_name);
        } else {
            // Show file preview instead of downloading
            setPreviewFile(item);
        }
    };

    // Close file preview
    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div className="drive-home-container">
            {uploadProgress.total > 0 && <FileLoaderToast uploadProgress={uploadProgress} />}

            {/* File Preview Component */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    onClose={closePreview}
                />
            )}

            {/* Rename/Create Dialog */}
            {showRenameDialog && (
                <div className="rename-dialog-overlay">
                    <div className="rename-dialog">
                        <h3>{dialogMode === 'rename' ? `Rename ${renameItemType}` : 'Create new folder'}</h3>
                        <input
                            type="text"
                            placeholder={dialogMode === 'rename' ? "New name" : "Folder name"}
                            value={renameItemNewName || (dialogMode === 'rename' ? renameItemOldName : '')}
                            onChange={(e) => setRenameItemNewName(e.target.value)}
                            autoFocus
                            onFocus={(e) => {
                                // Select all text when focused for easier editing
                                if (dialogMode === 'rename') {
                                    e.target.select();
                                }
                            }}
                        />
                        <div className="rename-dialog-buttons">
                            <button
                                onClick={() => setShowRenameDialog(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDialogSubmit}
                                className="rename-btn"
                                disabled={
                                    !renameItemNewName ||
                                    !renameItemNewName.trim() ||
                                    (dialogMode === 'rename' && renameItemNewName === renameItemOldName) ||
                                    isLoading
                                }
                            >
                                {isLoading ?
                                    (dialogMode === 'rename' ? 'Renaming...' : 'Creating...') :
                                    (dialogMode === 'rename' ? 'Rename' : 'Create')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="drive-header">
                <h1>{activeProfileSection}</h1>

                <div className="drive-actions">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn-upload" onClick={() => document.getElementById('file-upload').click()}>
                        <FontAwesomeIcon icon={faUpload} /> Upload
                    </button>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />

                    <button className="btn-create-folder" onClick={handleOpenCreateFolderDialog}>
                        <FontAwesomeIcon icon={faPlusSquare} /> New Folder
                    </button>

                    {selectedItems.length > 0 && (
                        <button className="btn-delete" onClick={handleDeleteSelected}>
                            <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                    )}

                    <button className="btn-refresh" onClick={refreshDrive} title="Refresh">
                        <FontAwesomeIcon icon={faSync} spin={isLoading} />
                    </button>
                </div>
            </div>



            <div className="drive-stats">
                <div className="stat-card">
                    <h3>Storage</h3>
                    <p>{formatFileSize(storageUsed)} used of {formatFileSize(storageLimit)}</p>
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${percentUsed}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="path-navigation">
                <button onClick={navigateUp} disabled={currentPath === '/' || isLoading}>Up</button>
                <span className="current-path">{currentPath}</span>
            </div>

            <div className="files-container">
                <div className="files-header">
                    <div className="header-select"></div>
                    <div
                        className="header-item header-name"
                        onClick={() => {
                            setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                            setSortBy('name');
                        }}
                    >
                        <span>Name</span>
                        {getSortIcon('name')}
                    </div>
                    <div
                        className="header-item header-date"
                        onClick={() => {
                            setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                            setSortBy('created_at');
                        }}
                    >
                        <span>Last modified</span>
                        {getSortIcon('created_at')}
                    </div>
                    <div
                        className="header-item header-size"
                        onClick={() => {
                            setSortOrder(sortBy === 'file_size' && sortOrder === 'asc' ? 'desc' : 'asc');
                            setSortBy('file_size');
                        }}
                    >
                        <span>File size</span>
                        {getSortIcon('file_size')}
                    </div>
                    <div className="header-item header-actions">
                        Actions
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading files and folders...</div>
                ) : (
                    <div className="files-list">
                        {sortedFolders.length === 0 && sortedFiles.length === 0 ? (
                            <div className="empty-state">
                                <p>This folder is empty</p>
                                <p>Upload files or create folders to get started</p>
                            </div>
                        ) : (
                            // Render all items in one list
                            <>
                                {/* Combine folders and files into a single list */}
                                {[...sortedFolders, ...sortedFiles].map(item => {
                                    // Determine if it's a folder or file
                                    const itemType = 'folder_id' in item ? 'folder' : 'file';

                                    return (
                                        <FileItem
                                            key={itemType === 'folder' ? item.folder_id : item.file_id}
                                            item={item}
                                            type={itemType}
                                            isSelected={selectedItems.some(selectedItem =>
                                                selectedItem.id === (itemType === 'folder' ? item.folder_id : item.file_id) &&
                                                selectedItem.type === itemType
                                            )}
                                            onSelect={toggleSelectItem}
                                            onNavigate={navigateToFolder}
                                            onDownload={itemType === 'file' ? handleDownloadFile : null}
                                            onStar={handleStar}
                                            onDelete={itemType === 'file' ? handleDeleteFile : null}
                                            onShare={(id, type, name) => {
                                                console.log(`Sharing ${type}: ${name}`);
                                            }}
                                            onEdit={itemType === 'folder' ? handleOpenRenameDialog : null}
                                            formatFileSize={formatFileSize}
                                            onClick={handleItemClick}
                                        />
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriveHome 