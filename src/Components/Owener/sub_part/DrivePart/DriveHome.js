import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder, faStar, faTrash, faUpload, faShare, faPlusSquare, faDownload, faEdit } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url, FileLoaderToast } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'

function DriveHome() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;
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

    useEffect(() => {
        if (activeProfileSection !== 'Drive Home') {
            setActiveProfileSection('Drive Home')
        }

        // Load initial files and folders
        fetchFilesAndFolders()

        // Get storage info
        fetchStorageInfo()
    }, [activeProfileSection, setActiveProfileSection])

    const fetchFilesAndFolders = async () => {
        setIsLoading(true)
        try {
            // Fetch folders
            const folderResponse = await fetch(`${Server_url}/drive/folders?user_email=${user_email}`)
            const folderData = await folderResponse.json()

            // Fetch files - if currentFolder is set use that, otherwise fetch root files
            const fileUrl = `${Server_url}/drive/files?user_email=${user_email}${currentFolder ? `&parent_folder_id=${currentFolder}` : '&is_root=true'
                }`
            const fileResponse = await fetch(fileUrl)
            const fileData = await fileResponse.json()

            // Filter for current location
            const currentFolders = folderData.filter(folder =>
                currentFolder ? folder.parent_folder_id === currentFolder : folder.is_root)

            setFolders(currentFolders)
            setFiles(fileData)
        } catch (error) {
            console.error('Error fetching files and folders:', error)
            // For demo purposes, set sample data
            setFolders([
                { folder_id: 1, folder_name: 'Documents', created_at: new Date().toISOString() },
                { folder_id: 2, folder_name: 'Images', created_at: new Date().toISOString() }
            ])
            setFiles([
                { file_id: 1, file_name: 'Report.pdf', file_size: 2.4, file_type: 'pdf', created_at: new Date().toISOString() },
                { file_id: 2, file_name: 'Presentation.pptx', file_size: 5.7, file_type: 'pptx', created_at: new Date().toISOString() }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStorageInfo = async () => {
        try {
            const response = await fetch(`${Server_url}/drive/storage?user_email=${user_email}`)
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
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Read file as base64
                const reader = new FileReader();

                await new Promise((resolve, reject) => {
                    reader.onload = async (e) => {
                        try {
                            const base64Data = e.target.result;

                            // Prepare file data for API
                            const fileData = {
                                file_name: file.name,
                                file_data: base64Data,
                                file_size: file.size / (1024 * 1024), // Convert to MB
                                file_type: file.name.split('.').pop(),
                                parent_folder_id: currentFolder || null,
                                is_root: !currentFolder,
                                is_shared: false,
                                created_by: user_email,
                                modified_by: user_email
                            };

                            // Send file to server
                            const response = await fetch(`${Server_url}/drive/upload-file?user_email=${user_email}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(fileData)
                            });

                            if (response.ok) {
                                completedFiles++;
                                setUploadProgress({ completed: completedFiles, total: totalFiles });
                            } else {
                                const errorText = await response.text();
                                console.error(`Upload failed for ${file.name}:`, errorText);
                            }

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    };

                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            // All uploads completed
            setUploadProgress({ completed: 0, total: 0 });
            fetchFilesAndFolders();
            fetchStorageInfo();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        try {
            const response = await fetch(`${Server_url}/drive/create-folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    folder_name: newFolderName,
                    user_email: user_email,
                    created_by: user_email,
                    modified_by: user_email,
                    is_root: !currentFolder,
                    parent_folder_id: currentFolder || null,
                    is_shared: false
                })
            })

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
            }

            setNewFolderName('')
            setShowCreateFolder(false)
            fetchFilesAndFolders()
        } catch (error) {
            console.error('Error creating folder:', error)
        }
    }

    const navigateToFolder = (folderId, folderName) => {
        setCurrentFolder(folderId)
        setCurrentPath(currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`)
        // Refetch files and folders for this folder
        fetchFilesAndFolders()
    }

    const navigateUp = () => {
        if (currentPath === '/') return

        // Get parent folder ID
        const pathParts = currentPath.split('/')
        pathParts.pop() // Remove current folder name
        const newPath = pathParts.join('/') || '/'

        setCurrentFolder(null) // This would need to be the actual parent ID in a real app
        setCurrentPath(newPath)

        // Refetch files and folders for parent folder
        fetchFilesAndFolders()
    }

    const toggleSelectItem = (id, type) => {
        const existingIndex = selectedItems.findIndex(item => item.id === id && item.type === type)

        if (existingIndex >= 0) {
            setSelectedItems(selectedItems.filter((_, index) => index !== existingIndex))
        } else {
            setSelectedItems([...selectedItems, { id, type }])
        }
    }

    const handleDeleteSelected = async () => {
        if (!selectedItems.length) return

        const confirmed = window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)
        if (!confirmed) return

        for (const item of selectedItems) {
            try {
                if (item.type === 'file') {
                    await fetch(`${Server_url}/drive/files/${item.id}?user_email=${user_email}`, {
                        method: 'DELETE'
                    })
                } else {
                    await fetch(`${Server_url}/drive/folders/${item.id}?user_email=${user_email}`, {
                        method: 'DELETE'
                    })
                }
            } catch (error) {
                console.error(`Error deleting ${item.type}:`, error)
            }
        }

        setSelectedItems([])
        fetchFilesAndFolders()
        fetchStorageInfo()
    }

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const response = await fetch(`${Server_url}/drive/files/${fileId}?user_email=${user_email}&download=true`)
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

    const handleStar = async (itemId, itemType, isStarred) => {
        try {
            await fetch(`${Server_url}/drive/${itemType === 'file' ? 'files' : 'folders'}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_starred: !isStarred,
                    modified_by: user_email
                })
            })

            // Refresh data
            fetchFilesAndFolders()
        } catch (error) {
            console.error('Error starring item:', error)
        }
    }

    const formatFileSize = (size) => {
        if (size < 1) return `${(size * 1024).toFixed(0)} KB`
        return `${size.toFixed(1)} MB`
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
                    <button onClick={handleCreateFolder}>Create</button>
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
                <button onClick={navigateUp} disabled={currentPath === '/'}>Up</button>
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
                                                <FontAwesomeIcon
                                                    icon={faStar}
                                                    style={{ color: file.is_starred ? '#FFD700' : '#666' }}
                                                />
                                            </button>
                                            <button className="action-btn">
                                                <FontAwesomeIcon icon={faShare} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriveHome 