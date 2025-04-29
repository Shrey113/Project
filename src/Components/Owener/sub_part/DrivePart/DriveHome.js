import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faThLarge, faList, faUpload, faPlusSquare, faSearch, faSort,
    faSortAlphaDown, faSortAlphaUp, faCalendarAlt, faFileAlt,
    faStar, faCaretDown, faFolder, faFile
} from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url, FileLoaderToast, showAcceptToast, showRejectToast, ConfirmMessage } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import FileItem from './FileItem'
import FilePreview from './FilePreview'
import { FiStar, FiTrash } from 'react-icons/fi'
import SharePopup from './SharePopup'

function DriveHome() {
    const user = useSelector((state) => state.user);
    const created_by = user.user_email;
    const user_email = user.user_email;
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const location = useLocation();
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
    const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-renders
    const [breadcrumbPath, setBreadcrumbPath] = useState([]) // Add state for breadcrumb path
    const [viewMode, setViewMode] = useState('list') // Default to list view like in the image
    const [selectionMode, setSelectionMode] = useState(false) // Track if we're in selection mode
    const [activePopup, setActivePopup] = useState(null) // Add state for tracking active popup

    // Rename dialog state variables
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [renameItemType, setRenameItemType] = useState('') // 'file' or 'folder'
    const [renameItemId, setRenameItemId] = useState(null)
    const [renameItemOldName, setRenameItemOldName] = useState('')
    const [renameItemNewName, setRenameItemNewName] = useState('') // Initialize with empty string
    const [dialogMode, setDialogMode] = useState('rename')

    const [previewFile, setPreviewFile] = useState(null);

    // Add reference to track navigation processing
    const navigationProcessedRef = useRef(false);
    const directFolderOpenRef = useRef(false);

    // Share popup state
    const [sharePopup, setSharePopup] = useState({
        show: false,
        item: null
    });

    // Function to trigger a refresh
    const refreshDrive = () => {
        console.log("Refreshing drive content...");
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Toggle view mode
    // const toggleViewMode = () => {
    //     setViewMode(viewMode === 'grid' ? 'list' : 'grid');
    //     // Clear any active popups when switching view modes
    //     setActivePopup(null);
    // };

    // Get total items count
    const getTotalItemsCount = () => {
        return folders.length + files.length;
    };

    // Clear all selections
    const clearSelections = () => {
        setSelectedItems([]);
        setSelectionMode(false);
    };

    // Process location state from navigation (handle navigation from StarredItems)
    useLayoutEffect(() => {
        // Check if we have folder data from navigation state (from Starred Items) with directOpen flag
        if (location.state && location.state.folderData && location.state.folderData.directOpen) {
            try {
                const folderData = location.state.folderData;
                console.log("Processing DIRECT navigation data:", folderData);

                const timestamp = folderData.timestamp;
                // Get the saved data from localStorage as a backup
                const savedData = localStorage.getItem(`folder_navigation_${timestamp}`);

                // Mark as processed to prevent duplicate processing
                navigationProcessedRef.current = true;
                directFolderOpenRef.current = true;

                // Force folder ID and path update
                console.log("Setting current folder to:", folderData.folderId);
                setCurrentFolder(folderData.folderId);

                // Force breadcrumb path update with proper formatting
                if (folderData.breadcrumbPath && folderData.breadcrumbPath.length > 0) {
                    // Ensure each item in breadcrumb has id and name properties
                    const formattedPath = folderData.breadcrumbPath.map(item => ({
                        id: item.id || item.folder_id,
                        name: item.name || item.folder_name
                    }));

                    console.log("Setting breadcrumb path to:", formattedPath);
                    setBreadcrumbPath(formattedPath);

                    // Set current path
                    if (folderData.currentPath) {
                        console.log("Setting current path to:", folderData.currentPath);
                        setCurrentPath(folderData.currentPath);
                    } else {
                        // Build path from breadcrumb
                        const pathString = '/' + formattedPath.map(item => item.name).join('/');
                        console.log("Setting built path to:", pathString);
                        setCurrentPath(pathString);
                    }
                }

                // Cleanup localStorage
                if (savedData) {
                    localStorage.removeItem(`folder_navigation_${timestamp}`);
                }

                // Explicitly fetch the folder contents immediately
                const fetchDirectFolderContents = async () => {
                    setIsLoading(true);
                    console.log("Explicitly fetching contents for folder:", folderData.folderId);

                    try {
                        const url = new URL(`${Server_url}/drive/folder/${folderData.folderId}/contents`);
                        url.searchParams.append('user_email', user_email);
                        url.searchParams.append('created_by', created_by);

                        const response = await fetch(url.toString());

                        // Check if response is OK
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error('Server error:', response.status, errorText);
                            throw new Error(`Server responded with ${response.status}: ${errorText}`);
                        }

                        const data = await response.json();
                        console.log("Direct folder contents fetched:", data);

                        // Handle the response format
                        if (data.success) {
                            // Set files and folders from the response
                            setFiles(data.files || []);
                            setFolders(data.folders || []);

                            // Reset the direct folder open flag after successful fetch
                            directFolderOpenRef.current = false;
                        }
                    } catch (error) {
                        console.error("Error fetching direct folder contents:", error);
                        directFolderOpenRef.current = false;

                        // Fallback: Add a slight delay and trigger a normal fetch through the refreshDrive
                        setTimeout(() => {
                            console.log("Triggering fallback refresh after direct fetch failed");
                            setRefreshKey(prev => prev + 1);
                        }, 500);
                    } finally {
                        setIsLoading(false);
                    }
                };

                // Execute the fetch
                fetchDirectFolderContents();
            } catch (error) {
                console.error("Error in direct folder opening:", error);
                directFolderOpenRef.current = false;
            }
        } else if (location.state && location.state.folderData && !navigationProcessedRef.current) {
            // Handle standard navigation (existing code)
            try {
                const folderData = location.state.folderData;
                console.log("Processing navigation data:", folderData);

                // Check if the data is recent (within the last minute)
                const isRecent = folderData.timestamp &&
                    (new Date().getTime() - folderData.timestamp < 60000);

                if (isRecent) {
                    // Mark as processed to prevent duplicate processing
                    navigationProcessedRef.current = true;

                    // Set current folder to the one from navigation
                    const newFolderId = folderData.folderId;
                    setCurrentFolder(newFolderId);

                    // Set breadcrumb path with proper formatting
                    if (folderData.breadcrumbPath && folderData.breadcrumbPath.length > 0) {
                        // Ensure each item in breadcrumb has id and name properties
                        const formattedPath = folderData.breadcrumbPath.map(item => ({
                            id: item.id || item.folder_id, // Handle different property names
                            name: item.name || item.folder_name // Handle different property names
                        }));

                        setBreadcrumbPath(formattedPath);

                        // Use provided currentPath if available, otherwise build it
                        if (folderData.currentPath) {
                            setCurrentPath(folderData.currentPath);
                        } else {
                            // Update current path for backward compatibility
                            const pathString = '/' + formattedPath
                                .map(item => item.name)
                                .join('/');
                            setCurrentPath(pathString);
                        }

                        console.log("Set breadcrumb path to:", formattedPath);
                        console.log("Set current folder to:", newFolderId);
                    }
                }
            } catch (error) {
                console.error("Error processing folder data from navigation state:", error);
            }
        }
    }, [location, user_email, created_by]);

    // Main effect for fetching drive contents
    useEffect(() => {
        if (activeProfileSection !== 'Drive Home') {
            setActiveProfileSection('Drive Home')
        }

        // Skip fetching if we're in direct folder opening mode
        if (directFolderOpenRef.current) {
            console.log("Skipping normal fetch due to direct folder opening - data will be fetched separately");
            return;
        }

        const fetchFilesAndFolders = async () => {
            setIsLoading(true);
            console.log("Fetching files and folders normally, currentFolder:", currentFolder);

            try {
                let url;

                if (currentFolder) {
                    // If we're in a folder, use the new endpoint to get only its contents
                    url = new URL(`${Server_url}/drive/folder/${currentFolder}/contents`);
                    url.searchParams.append('user_email', user_email);
                    url.searchParams.append('created_by', created_by);
                } else {
                    // If we're at the root, get all files and folders as before
                    url = new URL(`${Server_url}/drive/get_all_files_and_folders/${created_by}`);
                    url.searchParams.append('user_email', user_email);
                    // Reset breadcrumb at root level if not coming from navigation
                    if (!navigationProcessedRef.current) {
                        setBreadcrumbPath([]);
                    }
                }

                const response = await fetch(url.toString());

                // Check if response is OK
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error:', response.status, errorText);
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log("Normal fetch - Files and folders fetched:", data);

                // Handle the response format
                if (currentFolder && data.success) {
                    // Set files and folders from the response
                    setFiles(data.files || []);
                    setFolders(data.folders || []);

                    // Update breadcrumb path if available from server and not from navigation
                    if (data.breadcrumb && data.breadcrumb.length > 0 && !navigationProcessedRef.current) {
                        setBreadcrumbPath(data.breadcrumb);
                    }
                } else {
                    // Handle the response for root level
                    if (data.files) {
                        setFiles(data.files.filter(file => !file.parent_folder_id || file.parent_folder_id === 0));
                    }

                    if (data.folders) {
                        setFolders(data.folders.filter(folder => !folder.parent_folder_id || folder.parent_folder_id === 0));
                    }

                    // Reset breadcrumb for root level if not from navigation
                    if (!navigationProcessedRef.current) {
                        setBreadcrumbPath([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching files and folders:', error);
                directFolderOpenRef.current = false;
            } finally {
                setIsLoading(false);
            }
        };

        // Load files and folders
        fetchFilesAndFolders();



        // Reset the navigation processed ref when component unmounts or currentFolder changes
        return () => {
            if (currentFolder === null) {
                navigationProcessedRef.current = false;
                directFolderOpenRef.current = false;
            }
        };
    }, [activeProfileSection, setActiveProfileSection, refreshKey, currentFolder, created_by, user_email]); // Removed location from dependencies

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

        // For files, remove the extension from the name shown in the dialog
        let displayName = currentName;
        if (type === 'file') {
            const lastDotIndex = currentName.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                displayName = currentName.substring(0, lastDotIndex);
            }
        }

        console.log("Setting rename dialog values:", {
            id,
            type,
            oldName: currentName,
            newName: displayName
        });

        setRenameItemId(id);
        setRenameItemType(type);
        setRenameItemOldName(currentName);
        setRenameItemNewName(displayName);
        setDialogMode('rename');
        setShowRenameDialog(true);
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

        // Check character limit
        if (renameItemNewName.length > 100) {
            alert('File name cannot exceed 100 characters');
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
                // For files, preserve the extension
                let finalName = renameItemNewName;
                if (renameItemType === 'file') {
                    const lastDotIndex = renameItemOldName.lastIndexOf('.');
                    if (lastDotIndex !== -1) {
                        const extension = renameItemOldName.substring(lastDotIndex);
                        finalName = renameItemNewName + extension;
                    }
                }

                // RENAME OPERATION
                const endpoint = renameItemType === 'file'
                    ? `${Server_url}/drive/files/${renameItemId}?created_by=${created_by}&user_email=${user_email}`
                    : `${Server_url}/drive/folders/${renameItemId}?created_by=${created_by}&user_email=${user_email}`;

                console.log(`Renaming ${renameItemType} from "${renameItemOldName}" to "${finalName}"`);

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        [renameItemType === 'file' ? 'file_name' : 'folder_name']: finalName,
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
                                ? { ...file, file_name: finalName }
                                : file
                        )
                    );
                } else {
                    setFolders(prevFolders =>
                        prevFolders.map(folder =>
                            folder.folder_id === renameItemId
                                ? { ...folder, folder_name: finalName }
                                : folder
                        )
                    );
                }
            } else {
                // CREATE FOLDER OPERATION
                console.log(`Creating folder: ${renameItemNewName}${currentFolder ? ` in parent folder ID: ${currentFolder}` : ' at root level'}`);

                const response = await fetch(`${Server_url}/drive/create-folder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        folder_name: renameItemNewName,
                        created_by: created_by,
                        user_email: user_email,
                        modified_by: created_by,
                        parent_folder_id: currentFolder || null // Include current folder as parent if we're in a folder
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
                console.log(`Processing file ${i + 1}/${totalFiles}:`, file.name, "size:", file.size, "bytes");

                // Create FormData for each file
                const formData = new FormData();
                formData.append('file', file);

                // Construct upload URL with proper parameters
                const uploadUrl = new URL(`${Server_url}/drive/upload-file`);
                uploadUrl.searchParams.append('created_by', created_by);
                uploadUrl.searchParams.append('user_email', user_email);

                // Add current folder ID if we're in a folder
                if (currentFolder) {
                    uploadUrl.searchParams.append('parent_folder_id', currentFolder);
                    console.log(`Uploading to folder ID: ${currentFolder}`);
                } else {
                    console.log("Uploading to root folder");
                }

                console.log("Sending request to:", uploadUrl.toString());

                // Send file to server using FormData with proper headers for Busboy
                const response = await fetch(uploadUrl.toString(), {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Upload successful:", result);

                    // Verify file_size is present in the response
                    if (result.file_size) {
                        console.log(`Uploaded file size: ${result.file_size} bytes (${formatFileSize(result.file_size)})`);
                    } else {
                        console.warn("File size not returned from server");
                    }

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
        // If in selection mode, don't navigate
        if (selectionMode) {
            return;
        }

        console.log(`Navigating to folder: ${folderName} (ID: ${folderId})`);

        // Reset navigation and direct folder flags
        navigationProcessedRef.current = false;
        directFolderOpenRef.current = false;

        // Reset file and folder states
        setFiles([]);
        setFolders([]);

        // Update current folder
        setCurrentFolder(folderId);

        // Update breadcrumb path manually if not provided by the API
        // This ensures we maintain the path even if the API response is slow
        if (currentFolder) {
            // We're navigating deeper, so add to the breadcrumb
            const currentFolderInfo = breadcrumbPath.length > 0
                ? breadcrumbPath[breadcrumbPath.length - 1]
                : null;

            // Only add the new folder to breadcrumb if it's not already the current folder
            if (!currentFolderInfo || currentFolderInfo.id !== folderId) {
                setBreadcrumbPath([
                    ...breadcrumbPath,
                    { id: folderId, name: folderName }
                ]);
            }
        } else {
            // If we were at root, just add this folder to breadcrumb
            setBreadcrumbPath([{ id: folderId, name: folderName }]);
        }

        // Update path for backward compatibility
        setCurrentPath(currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`);

        // No need to call refreshDrive() as the useEffect will trigger due to currentFolder change
    }

    const navigateUp = () => {
        // Reset navigation and direct folder flags
        navigationProcessedRef.current = false;
        directFolderOpenRef.current = false;

        if (breadcrumbPath.length <= 1) {
            // If at root or only one level deep, go to root
            setCurrentFolder(null);
            setCurrentPath('/');
            setBreadcrumbPath([]);

            // Instead of setting fake data, we'll trigger a real fetch
            setIsLoading(true);
            refreshDrive();
            return;
        }

        // Navigate to the parent folder
        const newBreadcrumbPath = [...breadcrumbPath];
        newBreadcrumbPath.pop(); // Remove the current folder from breadcrumb

        const parentFolder = newBreadcrumbPath.length > 0
            ? newBreadcrumbPath[newBreadcrumbPath.length - 1]
            : null;

        if (parentFolder) {
            console.log(`Navigating up to: ${parentFolder.name} (ID: ${parentFolder.id})`);
            setCurrentFolder(parentFolder.id);
            setBreadcrumbPath(newBreadcrumbPath);

            // Path will be updated by the API response
            // Keep this for backward compatibility
            const pathParts = currentPath.split('/');
            pathParts.pop();
            setCurrentPath(pathParts.join('/') || '/');

            // Instead of manually setting empty files/folders, trigger a fetch
            setIsLoading(true);
        } else {
            // If something went wrong with the breadcrumb, go to root
            setCurrentFolder(null);
            setCurrentPath('/');
            setBreadcrumbPath([]);

            // Instead of setting fake data, we'll trigger a real fetch
            setIsLoading(true);
            refreshDrive();
        }
    }

    const toggleSelectItem = (id, type) => {
        // Check if the item is already selected
        const existingIndex = selectedItems.findIndex(item => item.id === id && item.type === type);

        if (existingIndex >= 0) {
            // Item is already selected, so remove it
            const newSelectedItems = selectedItems.filter((_, index) => index !== existingIndex);
            setSelectedItems(newSelectedItems);

            // If this was the last selected item, exit selection mode
            if (newSelectedItems.length === 0) {
                setSelectionMode(false);
            }
        } else {
            // Item is not selected, add it and enter selection mode
            setSelectedItems([...selectedItems, { id, type }]);
            setSelectionMode(true);
        }
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleDeleteFile = async (fileId, fileName) => {
        setDeleteItem({ id: fileId, name: fileName, type: 'file' });
        setShowDeleteDialog(true);
    };

    const handleDeleteFolder = async (folderId, folderName) => {
        setDeleteItem({ id: folderId, name: folderName, type: 'folder' });
        setShowDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setDeleteItem(null);
    };

    const handleDeleteSelected = async () => {
        if (!selectedItems.length) return;

        setDeleteItem({
            type: 'multiple',
            items: selectedItems,
            count: selectedItems.length
        });
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteItem) return;

        setIsLoading(true);
        try {
            if (deleteItem.type === 'multiple') {
                // Handle multiple items deletion
                let successCount = 0;
                let failCount = 0;
                let deletedItemNames = [];

                for (const item of deleteItem.items) {
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
                        showRejectToast({ message: `Deleted ${successCount} items (${deletedItemNames.join(', ')}), but failed to delete ${failCount} items.` });
                    } else {
                        showRejectToast({ message: `Failed to delete all ${failCount} items. Please try again.` });
                    }
                } else if (successCount > 0) {
                    if (successCount === 1) {
                        showAcceptToast({ message: `Successfully deleted "${deletedItemNames[0]}"` });
                    } else {
                        showAcceptToast({ message: `Successfully deleted ${successCount} items` });
                    }
                }

                setSelectedItems([]);
                setSelectionMode(false);
            } else {
                // Handle single item deletion
                console.log(`Deleting ${deleteItem.type}: ${deleteItem.name} (ID: ${deleteItem.id})`);

                const endpoint = deleteItem.type === 'file'
                    ? `${Server_url}/drive/files/${deleteItem.id}?created_by=${created_by}&user_email=${user_email}`
                    : `${Server_url}/drive/folders/${deleteItem.id}?created_by=${created_by}&user_email=${user_email}`;

                console.log(`Sending delete request to: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Failed to delete ${deleteItem.type}: ${errorText}`);
                    throw new Error(`Server error: ${response.status} ${errorText}`);
                }

                const result = await response.json();
                console.log("Delete successful:", result);

                showAcceptToast({ message: `${deleteItem.type === 'file' ? 'File' : 'Folder'} "${deleteItem.name}" deleted successfully` });
            }

            refreshDrive();
        } catch (error) {
            console.error(`Error deleting ${deleteItem.type}:`, error);
            showRejectToast({ message: `Failed to delete ${deleteItem.type}: ${error.message}` });
        } finally {
            setIsLoading(false);
            setShowDeleteDialog(false);
            setDeleteItem(null);
        }
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
        // Handle invalid or missing values
        if (size === null || size === undefined || isNaN(Number(size))) {
            return '0 B';
        }

        // Ensure size is a number in bytes
        const bytes = Number(size);

        // Size thresholds in bytes
        const KB = 1024;
        const MB = KB * 1024;
        const GB = MB * 1024;
        const TB = GB * 1024;

        // Format with appropriate unit
        if (bytes >= TB) {
            return `${(bytes / TB).toFixed(2)} TB`;
        } else if (bytes >= GB) {
            return `${(bytes / GB).toFixed(2)} GB`;
        } else if (bytes >= MB) {
            return `${(bytes / MB).toFixed(2)} MB`;
        } else if (bytes >= KB) {
            return `${(bytes / KB).toFixed(2)} KB`;
        } else {
            return `${bytes} B`;
        }
    }

    function formatFolderSize(folder) {
        if (!folder.item_count) return '--';
        // If folder has file_size property, format it as file size
        if (folder.file_size) {
            return formatFileSize(folder.file_size);
        }
        return '--';
    }

    // Format the date to match the image format
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        if (diff < 2419200) return `${Math.floor(diff / 604800)}w ago`;

        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(' ', ', ');
    }


    // Modified sort function to handle all data types properly
    const sortItems = (items, type, sortKey, order) => {
        if (!items || !Array.isArray(items)) return [];

        return [...items].sort((a, b) => {
            // Special handling for starred items
            if (sortKey === 'is_starred') {
                const aStarred = a.is_starred ? 1 : 0;
                const bStarred = b.is_starred ? 1 : 0;
                // Direction is reversed for stars - we want starred items on top
                const direction = order === 'asc' ? -1 : 1;
                return (aStarred - bStarred) * direction;
            }

            // Handle other fields based on their data types
            let aValue, bValue;

            // Handle file_size specially for folders
            if (sortKey === 'file_size') {
                // Convert file_size to numbers for proper comparison
                // For folders, use 0 as the size or item_count if available
                aValue = type === 'folder' && a.folder_id ?
                    (a.file_size ? Number(a.file_size) : (a.item_count || 0)) :
                    (a[sortKey] ? Number(a[sortKey]) : 0);

                bValue = type === 'folder' && b.folder_id ?
                    (b.file_size ? Number(b.file_size) : (b.item_count || 0)) :
                    (b[sortKey] ? Number(b[sortKey]) : 0);
            } else {
                // For dates, ensure we're comparing date objects
                if (sortKey === 'created_at' || sortKey === 'modified_date') {
                    aValue = a[sortKey] ? new Date(a[sortKey]) : new Date(0);
                    bValue = b[sortKey] ? new Date(b[sortKey]) : new Date(0);
                } else {
                    // For other fields, use the value or empty string/0
                    aValue = a[sortKey] !== undefined ? a[sortKey] : (typeof a[sortKey] === 'string' ? '' : 0);
                    bValue = b[sortKey] !== undefined ? b[sortKey] : (typeof b[sortKey] === 'string' ? '' : 0);
                }
            }

            // Determine sort direction
            const direction = order === 'asc' ? 1 : -1;

            // Compare values
            if (aValue instanceof Date && bValue instanceof Date) {
                return (aValue.getTime() - bValue.getTime()) * direction;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue) * direction;
            } else {
                return (aValue - bValue) * direction;
            }
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


    // Add a click handler for file items
    const handleItemClick = (item, type) => {
        // If we're in selection mode, clicking should select the item instead of opening it
        if (selectionMode) {
            const itemId = type === 'folder' ? item.folder_id : item.file_id;
            toggleSelectItem(itemId, type);
            return;
        }

        // Normal behavior when not in selection mode
        if (type === 'folder') {
            navigateToFolder(item.folder_id, item.folder_name);
        } else {
            // Show file preview instead of downloading
            setPreviewFile(item);
        }
    };

    const handleSearch = () => {
        setSearchTerm(searchTerm);
    };

    // Close file preview
    const closePreview = () => {
        setPreviewFile(null);
    };

    // Get current folder name for display
    // const getCurrentFolderName = () => {
    //     if (breadcrumbPath.length === 0) {
    //         return null;
    //     }
    //     return breadcrumbPath[breadcrumbPath.length - 1].name;
    // };

    // Function to handle global popup management
    const handleSetActivePopup = (popupId) => {
        setActivePopup(popupId);
    };

    useEffect(() => {
        if (sharePopup.show) {
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = 'auto';
        }
    }, [sharePopup.show]);

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };

        if (showSortDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortDropdown]);

    // Function to get human-readable sort field name
    const getSortFieldName = (field) => {
        switch (field) {
            case 'name':
                return 'Name';
            case 'created_at':
                return 'Date created';
            case 'file_size':
                return 'File size';
            case 'is_starred':
                return 'Starred';
            default:
                return 'Date created';
        }
    };

    // Function to handle sorting
    const handleSort = (field) => {
        if (sortBy === field) {
            // Toggle sort order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setSortBy(field);
            setSortOrder('asc');
        }
        setShowSortDropdown(false);
    };

    // Add this state and handler at the appropriate location in your component
    const [selectAll, setSelectAll] = useState(false);

    // Add this handleSelectAll function to your component
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            // Select all visible items
            const allItems = [...sortedFolders, ...sortedFiles].map(item => {
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

    const handleShare = (id, type, name) => {
        const item = {
            [type === 'file' ? 'file_id' : 'folder_id']: id,
            type,
            name
        };
        setSharePopup({ show: true, item });
    };

    const handleShareSuccess = () => {
        refreshDrive();
    };

    return (
        <div className="drive-home-container" onClick={() => setActivePopup(null)}>
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
                            maxLength={100}
                            placeholder={dialogMode === 'rename' ? "New name" : "Folder name"}
                            value={renameItemNewName || (dialogMode === 'rename' ? renameItemOldName : '')}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= 100) {
                                    setRenameItemNewName(newValue);
                                }
                            }}
                            autoFocus
                            onFocus={(e) => {
                                // Select all text when focused for easier editing
                                if (dialogMode === 'rename') {
                                    e.target.select();
                                }
                            }}
                        />
                        <div className="character-count">
                            {renameItemNewName.length}/100 characters
                        </div>
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

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && deleteItem && (
                <ConfirmMessage
                    message_title={`Delete ${deleteItem.type === 'multiple' ? 'Multiple Items' : (deleteItem.type === 'file' ? 'File' : 'Folder')}`}
                    message={deleteItem.type === 'multiple'
                        ? `Are you sure you want to delete ${deleteItem.count} item(s)? This action cannot be undone.`
                        : `Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    button_text="Delete"
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
                <h1>My Files</h1>

                <div className="drive-actions">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <button className="search-btn" onClick={handleSearch}>
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
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

                    <div className="view-mode-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <FontAwesomeIcon icon={faThLarge} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FontAwesomeIcon icon={faList} />
                        </button>
                    </div>

                    <div className="sort-dropdown" ref={sortDropdownRef}>
                        <button
                            className="sort-btn"
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                        >
                            Sort by: {getSortFieldName(sortBy)} <FontAwesomeIcon icon={faCaretDown} />
                        </button>

                        {showSortDropdown && (
                            <div className="sort-dropdown-menu">
                                <div
                                    className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                                    onClick={() => handleSort('name')}
                                >
                                    <FontAwesomeIcon icon={sortBy === 'name' ? (sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp) : faSort} />
                                    <span>Name</span>
                                    {sortBy === 'name' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                </div>

                                <div
                                    className={`sort-option ${sortBy === 'created_at' ? 'active' : ''}`}
                                    onClick={() => handleSort('created_at')}
                                >
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    <span>Date created</span>
                                    {sortBy === 'created_at' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                </div>

                                <div
                                    className={`sort-option ${sortBy === 'file_size' ? 'active' : ''}`}
                                    onClick={() => handleSort('file_size')}
                                >
                                    <FontAwesomeIcon icon={faFileAlt} />
                                    <span>File size</span>
                                    {sortBy === 'file_size' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                </div>

                                <div
                                    className={`sort-option ${sortBy === 'is_starred' ? 'active' : ''}`}
                                    onClick={() => handleSort('is_starred')}
                                >
                                    <FontAwesomeIcon icon={faStar} />
                                    <span>Starred</span>
                                    {sortBy === 'is_starred' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Path Navigation */}
            <div className="path-navigation">
                <button onClick={navigateUp} disabled={!currentFolder || isLoading}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                {/* Breadcrumb navigation */}
                <div className="breadcrumb-container">
                    <span
                        className="breadcrumb-item clickable"
                        onClick={() => {
                            navigationProcessedRef.current = false;
                            directFolderOpenRef.current = false;
                            setCurrentFolder(null);
                            setCurrentPath('/');
                            setBreadcrumbPath([]);
                            // Instead of manually setting files/folders, trigger a fetch
                            setIsLoading(true);
                            refreshDrive();
                        }}
                    >
                        Home
                    </span>

                    {breadcrumbPath && breadcrumbPath.length > 0 && breadcrumbPath.map((item, index) => (
                        <span key={item.id || index}>
                            <span className="breadcrumb-separator">/</span>
                            <span
                                className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : 'clickable'}`}
                                onClick={() => {
                                    if (index < breadcrumbPath.length - 1) {
                                        // Navigate to this folder in the path
                                        navigationProcessedRef.current = false;
                                        directFolderOpenRef.current = false;
                                        setCurrentFolder(item.id);
                                        // Update breadcrumb to include only up to this point
                                        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));

                                        // Update current path
                                        const newPath = '/' + breadcrumbPath.slice(0, index + 1).map(p => p.name).join('/');
                                        setCurrentPath(newPath);
                                    }
                                }}
                                title={item.name} // Add tooltip for long folder names
                            >
                                {item.name}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Total Items Count */}
            <div className="total-items-count">
                {getTotalItemsCount()} {getTotalItemsCount() === 1 ? 'item' : 'items'}
            </div>

            {/* Selection Bar */}
            {selectedItems.length > 0 && (
                <div className="selection-bar">
                    <div className="selection-count">
                        <button className="clear-selection" onClick={clearSelections}>×</button>
                        <span>{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected</span>
                    </div>
                    <div className="selection-actions">
                        <button
                            className="action-btn star-btn"
                            onClick={() => {
                                // Star all selected items
                                selectedItems.forEach(item => {
                                    const itemObj = item.type === 'file'
                                        ? files.find(f => f.file_id === item.id)
                                        : folders.find(f => f.folder_id === item.id);

                                    if (itemObj) {
                                        handleStar(item.id, item.type, itemObj.is_starred);
                                    }
                                });
                            }}
                            title="Star selected items"
                        >
                            <FiStar />
                        </button>
                        <button
                            className="action-btn trash-btn"
                            onClick={handleDeleteSelected}
                            title="Delete selected items"
                        >
                            <FiTrash />
                        </button>
                    </div>
                </div>
            )}

            <div className={`files-container ${viewMode}-view`} onClick={(e) => e.stopPropagation()}>
                {viewMode === 'list' ? (
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
                                        onClick={() => {
                                            setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                                            setSortBy('name');
                                        }}
                                    >
                                        <span>NAME</span>
                                        {getSortIcon('name')}
                                    </th>
                                    <th className="shared-header">
                                        <span>SHARED</span>
                                    </th>
                                    <th
                                        className="date-header"
                                        onClick={() => {
                                            setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                                            setSortBy('created_at');
                                        }}
                                    >
                                        <span>LAST MODIFIED</span>
                                        {getSortIcon('created_at')}
                                    </th>
                                    <th
                                        className="size-header"
                                        onClick={() => {
                                            setSortOrder(sortBy === 'file_size' && sortOrder === 'asc' ? 'desc' : 'asc');
                                            setSortBy('file_size');
                                        }}
                                    >
                                        <span>FILE SIZE</span>
                                        {getSortIcon('file_size')}
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
                                ) : sortedFolders.length === 0 && sortedFiles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-cell">
                                            <div className="empty-state">
                                                {currentFolder ? (
                                                    <>
                                                        <div className="empty-icon">
                                                            <FontAwesomeIcon icon={faFolder} size="3x" />
                                                        </div>
                                                        <p>This folder is empty</p>
                                                        <p>Upload files or create folders to get started</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="empty-icon">
                                                            <FontAwesomeIcon icon={faFile} size="3x" />
                                                        </div>
                                                        <p>Your drive is empty</p>
                                                        <p>Upload files or create folders to get started</p>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Render all items in table rows
                                    [...sortedFolders, ...sortedFiles].map(item => {
                                        // Determine if it's a folder or file
                                        const itemType = 'folder_id' in item ? 'folder' : 'file';
                                        const itemId = itemType === 'folder' ? item.folder_id : item.file_id;

                                        return (
                                            <FileItem
                                                key={`${itemType}-${itemId}`}
                                                item={item}
                                                type={itemType}
                                                viewMode={viewMode}
                                                isSelected={selectedItems.some(selectedItem =>
                                                    selectedItem.id === itemId &&
                                                    selectedItem.type === itemType
                                                )}
                                                onSelect={toggleSelectItem}
                                                onNavigate={navigateToFolder}
                                                onDownload={itemType === 'file' ? handleDownloadFile : null}
                                                onStar={handleStar}
                                                onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                                onShare={handleShare}
                                                onEdit={handleOpenRenameDialog}
                                                formatFileSize={itemType === 'file' ? formatFileSize : formatFolderSize}
                                                formatDate={formatDate}
                                                onClick={handleItemClick}
                                                selectionMode={selectionMode}
                                                globalActivePopup={activePopup}
                                                setGlobalActivePopup={handleSetActivePopup}
                                            />
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Grid view remains unchanged
                    <div className={`files-list ${viewMode}-layout`} onClick={(e) => {
                        // Only clear popups if clicked directly on the files-list
                        if (e.target.className === `files-list ${viewMode}-layout`) {
                            setActivePopup(null);
                        }
                    }}>
                        {isLoading ? (
                            <div className="loading">
                                <div className="loading-spinner"></div>
                                <p>Loading your files...</p>
                            </div>
                        ) : sortedFolders.length === 0 && sortedFiles.length === 0 ? (
                            <div className="empty-state">
                                {currentFolder ? (
                                    <>
                                        <div className="empty-icon">
                                            <FontAwesomeIcon icon={faFolder} size="3x" />
                                        </div>
                                        <p>This folder is empty</p>
                                        <p>Upload files or create folders to get started</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="empty-icon">
                                            <FontAwesomeIcon icon={faFile} size="3x" />
                                        </div>
                                        <p>Your drive is empty</p>
                                        <p>Upload files or create folders to get started</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            // Grid view items
                            [...sortedFolders, ...sortedFiles].map(item => {
                                // Determine if it's a folder or file
                                const itemType = 'folder_id' in item ? 'folder' : 'file';
                                const itemId = itemType === 'folder' ? item.folder_id : item.file_id;

                                return (
                                    <FileItem
                                        key={`${itemType}-${itemId}`}
                                        item={item}
                                        type={itemType}
                                        viewMode={viewMode}
                                        isSelected={selectedItems.some(selectedItem =>
                                            selectedItem.id === itemId &&
                                            selectedItem.type === itemType
                                        )}
                                        onSelect={toggleSelectItem}
                                        onNavigate={navigateToFolder}
                                        onDownload={itemType === 'file' ? handleDownloadFile : null}
                                        onStar={handleStar}
                                        onDelete={itemType === 'file' ? handleDeleteFile : handleDeleteFolder}
                                        onShare={handleShare}
                                        onEdit={handleOpenRenameDialog}
                                        formatFileSize={itemType === 'file' ? formatFileSize : formatFolderSize}
                                        formatDate={formatDate}
                                        onClick={handleItemClick}
                                        selectionMode={selectionMode}
                                        globalActivePopup={activePopup}
                                        setGlobalActivePopup={handleSetActivePopup}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

export default DriveHome 