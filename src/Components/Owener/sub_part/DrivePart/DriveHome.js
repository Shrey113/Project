import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder, faStar, faTrash, faUpload, faShare, faPlusSquare, faDownload, faEdit, faSync } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url, FileLoaderToast } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'

function DriveHome() {
    const user = useSelector((state) => state.user);
    const created_by = user.user_email;
    const user_email = user.user_email; // Keep both variables for compatibility
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])
    const [currentPath, setCurrentPath] = useState('/')
    const [currentFolder, setCurrentFolder] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 })
    const [showCreateFolder, setShowCreateFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [selectedItems, setSelectedItems] = useState([])
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [storageUsed, setStorageUsed] = useState(0)
    const [storageLimit, setStorageLimit] = useState(1024) // 1GB in MB
    const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-renders

    // Function to trigger a refresh
    const refreshDrive = () => {
        console.log("Refreshing drive content...");
        setRefreshKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        if (activeProfileSection !== 'Drive Home') {
            setActiveProfileSection('Drive Home')
        }

        // Load initial files and folders
        fetchFilesAndFolders()

        // Get storage info
        fetchStorageInfo()
    }, [activeProfileSection, setActiveProfileSection, refreshKey]) // Add refreshKey to dependencies

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

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        setIsLoading(true);
        try {
            console.log(`Creating folder: ${newFolderName}`);
            
            const response = await fetch(`${Server_url}/drive/create-folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    folder_name: newFolderName,
                    created_by: created_by,
                    user_email: user_email,
                    modified_by: created_by
                })
            })

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Server error: ${response.status}`, errorText);
                throw new Error(`Server responded with ${response.status}: ${errorText}`)
            }

            const result = await response.json();
            console.log("Folder created successfully:", result);

            setNewFolderName('')
            setShowCreateFolder(false)
            refreshDrive(); // Use the refresh function
        } catch (error) {
            console.error('Error creating folder:', error)
            alert(`Failed to create folder: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

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

    const getFileIcon = (fileType) => {
        // Add more file type icons as needed
        return <FontAwesomeIcon icon={faFile} className={`file-icon file-${fileType}`} />
    }

    // Sort and filter files and folders
    const sortedFolders = Array.isArray(folders)
        ? [...folders].sort((a, b) => {
            const aValue = a[sortBy] || ''
            const bValue = b[sortBy] || ''
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            return sortOrder === 'asc' ? compareResult : -compareResult
        }).filter(folder => folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

    const sortedFiles = Array.isArray(files)
        ? [...files].sort((a, b) => {
            const aValue = a[sortBy] || ''
            const bValue = b[sortBy] || ''
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            return sortOrder === 'asc' ? compareResult : -compareResult
        }).filter(file => file.file_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

    const percentUsed = (storageUsed / storageLimit) * 100

    const renderFileItems = () => {
        return (
            <>
                {sortedFolders.map(folder => (
                    <div key={folder.folder_id} className="file-item folder">
                        <div className="file-select">
                            <input
                                type="checkbox"
                                checked={selectedItems.some(item =>
                                    item.id === folder.folder_id && item.type === 'folder'
                                )}
                                onChange={() => toggleSelectItem(folder.folder_id, 'folder')}
                            />
                        </div>
                        <div
                            className="file-name"
                            onClick={() => navigateToFolder(folder.folder_id, folder.folder_name)}
                        >
                            <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                            <span>{folder.folder_name}</span>
                        </div>
                        <div className="file-date">
                            {new Date(folder.created_at || folder.created_date).toLocaleDateString()}
                        </div>
                        <div className="file-size">—</div>
                        <div className="file-actions">
                            <button className="action-btn">
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                                className="action-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStar(folder.folder_id, 'folder', folder.is_starred);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faStar}
                                    style={{ color: folder.is_starred ? '#FFD700' : '#666' }}
                                />
                            </button>
                            <button className="action-btn">
                                <FontAwesomeIcon icon={faShare} />
                            </button>
                        </div>
                    </div>
                ))}

                {sortedFiles.map(file => (
                    <div key={file.file_id} className="file-item">
                        <div className="file-select">
                            <input
                                type="checkbox"
                                checked={selectedItems.some(item =>
                                    item.id === file.file_id && item.type === 'file'
                                )}
                                onChange={() => toggleSelectItem(file.file_id, 'file')}
                            />
                        </div>
                        <div className="file-name">
                            {getFileIcon(file.file_type)}
                            <span>{file.file_name}</span>
                        </div>
                        <div className="file-date">
                            {new Date(file.created_at || file.created_date).toLocaleDateString()}
                        </div>
                        <div className="file-size">
                            {formatFileSize(file.file_size)}
                        </div>
                        <div className="file-actions">
                            <button
                                className="action-btn"
                                onClick={() => handleDownloadFile(file.file_id, file.file_name)}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                            <button
                                className="action-btn"
                                onClick={() => handleStar(file.file_id, 'file', file.is_starred)}
                            >
                               <FontAwesomeIcon icon={faStar} style={{ color: file.is_starred ? '#FFD700' : '#666' }} />
                            </button>
                            <button 
                                className="action-btn"
                                onClick={() => handleDeleteFile(file.file_id, file.file_name)}
                            >
                                <FontAwesomeIcon icon={faTrash} style={{ color: '#ff6b6b' }} />
                            </button>
                            <button className="action-btn" title="Share">
                                <FontAwesomeIcon icon={faShare} />
                            </button>
                        </div>
                    </div>
                ))}
            </>
        )
    }

    return (
        <div className="drive-home-container">
            {uploadProgress.total > 0 && <FileLoaderToast uploadProgress={uploadProgress} />}

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

                    <button className="btn-create-folder" onClick={() => setShowCreateFolder(true)}>
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

            {showCreateFolder && (
                <div className="create-folder-form">
                    <input
                        type="text"
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <button onClick={handleCreateFolder} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                    <button onClick={() => setShowCreateFolder(false)}>Cancel</button>
                </div>
            )}

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
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('name')
                    }}>
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('created_at')
                    }}>
                        Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'file_size' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('file_size')
                    }}>
                        Size {sortBy === 'file_size' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item">Actions</div>
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
                            <>
                                {renderFileItems()}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriveHome 