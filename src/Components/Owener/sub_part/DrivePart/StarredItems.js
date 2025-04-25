import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder, faStar, faDownload, faShare, faSpinner, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

function StarredItems() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [starredItems, setStarredItems] = useState([])
    const [starredFolders, setStarredFolders] = useState([]);
    const [starredFiles, setStarredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [downloadProgress, setDownloadProgress] = useState({ isDownloading: false, progress: 0, fileName: '' })

    const fetchStarredItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${Server_url}/starred/drive/get_starred_items?user_email=${user_email}`);
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const data = await response.json();
            // Separate starred folders and files
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
                    created_date: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    created_by: 'user1',
                    modified_by: 'user1',
                    is_shared: 0,
                    is_starred: 1
                }
            ]);
            setStarredFiles([
                {
                    file_id: 1,
                    file_name: 'Important Document.pdf',
                    file_size: 2.4,
                    file_type: 'pdf',
                    parent_folder_id: 1,
                    file_data: null,
                    is_shared: 0,
                    created_date: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    created_by: 'user1',
                    modified_by: 'user1',
                    is_root: 0,
                    file_path: '/documents/important.pdf',
                    user_email: user_email,
                    is_starred: 1
                }
            ]);
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

    const handleUnstar = async (itemId, itemType) => {
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
                    is_starred: false,
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
            fetchStarredItems(); // Refresh the data
        }
    }

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            setDownloadProgress({
                isDownloading: true,
                progress: 0,
                fileName: fileName
            });

            // Create a new AbortController
            const controller = new AbortController();
            const signal = controller.signal;

            const response = await fetch(`${Server_url}/drive/files/${fileId}?user_email=${user_email}&download=true`, {
                signal
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            // Get total file size for progress calculation
            const contentLength = response.headers.get('Content-Length');
            const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

            // Create a reader to track progress
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;

            // Read the stream
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                // Update progress
                if (totalSize) {
                    setDownloadProgress(prev => ({
                        ...prev,
                        progress: Math.round((receivedLength / totalSize) * 100)
                    }));
                }
            }

            // Combine all chunks into a single Uint8Array
            const chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            // Create Blob and download the file
            const blob = new Blob([chunksAll]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            // Use downloads folder if supported by browser
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Indicate completion
            setDownloadProgress(prev => ({
                ...prev,
                isDownloading: false,
                progress: 100
            }));

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
        if (size < 1) return `${(size * 1024).toFixed(0)} KB`
        return `${size.toFixed(1)} MB`
    }

    const getFileIcon = (fileType) => {
        // Add more file type icons as needed
        return <FontAwesomeIcon icon={faFile} className={`file-icon file-${fileType}`} />
    }

    const getSortIcon = (column) => {
        if (sortBy !== column) return <FontAwesomeIcon icon={faSort} className="sort-icon" />;
        return sortOrder === 'asc'
            ? <FontAwesomeIcon icon={faSortUp} className="sort-icon active" />
            : <FontAwesomeIcon icon={faSortDown} className="sort-icon active" />;
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const sortedFolders = [...starredFolders]
        .map(folder => ({ ...folder, type: 'folder', starred_at: folder.modified_date }))
        .filter(folder => folder.folder_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aValue = sortBy === 'name' ? a.folder_name : sortBy === 'starred_at' ? a.starred_at : 0;
            const bValue = sortBy === 'name' ? b.folder_name : sortBy === 'starred_at' ? b.starred_at : 0;
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return sortOrder === 'asc' ? compareResult : -compareResult;
        });

    const sortedFiles = [...starredFiles]
        .map(file => ({ ...file, type: 'file', starred_at: file.modified_date }))
        .filter(file => file.file_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aValue = sortBy === 'name' ? a.file_name : sortBy === 'starred_at' ? a.starred_at : a.file_size;
            const bValue = sortBy === 'name' ? b.file_name : sortBy === 'starred_at' ? b.starred_at : b.file_size;
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return sortOrder === 'asc' ? compareResult : -compareResult;
        });

    const allItems = [...sortedFolders, ...sortedFiles];
    return (
        <div className="starred-items-container">
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

            <div className="files-container">
                <div className="files-header">
                    <div className="header-select"></div>
                    <div
                        className="header-item header-name"
                        onClick={() => handleSort('name')}
                    >
                        Name {getSortIcon('name')}
                    </div>
                    <div
                        className="header-item header-date"
                        onClick={() => handleSort('starred_at')}
                    >
                        Starred Date {getSortIcon('starred_at')}
                    </div>
                    <div
                        className="header-item header-size"
                        onClick={() => handleSort('size')}
                    >
                        Size {getSortIcon('size')}
                    </div>
                    <div className="header-item header-actions">Actions</div>
                </div>

                {isLoading ? (
                    <div className="loader">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    </div>
                ) : (
                    <div className="files-list">
                        {downloadProgress.isDownloading && (
                            <div className="download-progress-overlay">
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
                            </div>
                        )}

                        {allItems.length === 0 ? (
                            <div className="starred-content">
                                <p>No starred items yet.</p>
                                <p>Mark important files with a star to find them quickly here.</p>
                            </div>
                        ) : (
                            allItems.map(item => (
                                <div key={`${item.type}-${item.type === 'file' ? item.file_id : item.folder_id}`} className={`file-item ${item.type === 'folder' ? 'folder' : ''}`}>
                                    <div className="file-select"></div>
                                    <div className="file-name">
                                        {item.type === 'folder' ? (
                                            <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                                        ) : (
                                            getFileIcon(item.file_type)
                                        )}
                                        <span>{item.type === 'folder' ? item.folder_name : item.file_name}</span>
                                    </div>
                                    <div className="file-date">
                                        {new Date(item.starred_at).toLocaleDateString()}
                                    </div>
                                    <div className="file-size">
                                        {item.type === 'folder' ? '—' : formatFileSize(item.file_size)}
                                    </div>
                                    <div className="file-actions">
                                        {item.type === 'file' && (
                                            <button
                                                className="action-btn action-download"
                                                onClick={() => handleDownloadFile(item.file_id, item.file_name)}
                                                disabled={downloadProgress.isDownloading}
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </button>
                                        )}
                                        <button
                                            className="action-btn action-star"
                                            onClick={() => handleUnstar(item.type === 'file' ? item.file_id : item.folder_id, item.type)}
                                        >
                                            <FontAwesomeIcon icon={faStar} style={{ color: '#FFD700' }} />
                                        </button>
                                        <button className="action-btn action-share">
                                            <FontAwesomeIcon icon={faShare} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StarredItems 