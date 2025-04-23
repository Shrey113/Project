import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder, faStar, faDownload, faShare } from '@fortawesome/free-solid-svg-icons'
import './DriveStyles.css'
import { Server_url } from '../../../../redux/AllData'
import { useSelector } from 'react-redux'

function StarredItems() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    const [starredItems, setStarredItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (activeProfileSection !== 'Starred Items') {
            setActiveProfileSection('Starred Items')
        }

        // Fetch starred items
        fetchStarredItems()
    }, [activeProfileSection, setActiveProfileSection])

    const fetchStarredItems = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${Server_url}/starred/drive/starred?user_email=${user_email}`)
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }
            const data = await response.json()
            setStarredItems(data)
        } catch (error) {
            console.error('Error fetching starred items:', error)
            // Set demo data for now
            setStarredItems(
                [
                    {
                        id: 1,
                        name: 'Important Document.pdf',
                        type: 'file',
                        file_type: 'pdf',
                        size: 2.4,
                        created_at: new Date().toISOString(),
                        starred_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Project Materials',
                        type: 'folder',
                        file_type: 'pdf',
                        size: 10.5,
                        created_at: new Date().toISOString(),
                        starred_at: new Date().toISOString()
                    }
                ]
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnstar = async (itemId, itemType) => {
        try {
            const response = await fetch(`${Server_url}/drive/${itemType === 'file' ? 'files' : 'folders'}/${itemId}`, {
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

            // Remove from list
            setStarredItems(starredItems.filter(item =>
                !(item.id === itemId && item.type === itemType)
            ))
        } catch (error) {
            console.error('Error unstarring item:', error)
        }
    }

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const response = await fetch(`${Server_url}/drive/files/${fileId}?user_email=${user_email}&download=true`)
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

    const formatFileSize = (size) => {
        if (size < 1) return `${(size * 1024).toFixed(0)} KB`
        return `${size.toFixed(1)} MB`
    }

    const getFileIcon = (fileType) => {
        // Add more file type icons as needed
        return <FontAwesomeIcon icon={faFile} className={`file-icon file-${fileType}`} />
    }

    // Sort and filter starred items
    const sortedItems = Array.isArray(starredItems)
        ? [...starredItems].sort((a, b) => {
            const aValue = a[sortBy] || ''
            const bValue = b[sortBy] || ''
            const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            return sortOrder === 'asc' ? compareResult : -compareResult
        }).filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

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
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('name')
                    }}>
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'starred_at' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('starred_at')
                    }}>
                        Starred Date {sortBy === 'starred_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'size' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('size')
                    }}>
                        Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item">Actions</div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading starred items...</div>
                ) : (
                    <div className="files-list">
                        {sortedItems.length === 0 ? (
                            <div className="starred-content">
                                <p>No starred items yet.</p>
                                <p>Mark important files with a star to find them quickly here.</p>
                            </div>
                        ) : (
                            sortedItems.map(item => (
                                <div key={`${item.type}-${item.id}`} className={`file-item ${item.type === 'folder' ? 'folder' : ''}`}>
                                    <div></div>
                                    <div className="file-name">
                                        {item.type === 'folder' ? (
                                            <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                                        ) : (
                                            getFileIcon(item.file_type)
                                        )}
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="file-date">
                                        {new Date(item.starred_at).toLocaleDateString()}
                                    </div>
                                    <div className="file-size">
                                        {item.type === 'folder' ? '—' : formatFileSize(item.size)}
                                    </div>
                                    <div className="file-actions">
                                        {item.type === 'file' && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleDownloadFile(item.id, item.name)}
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </button>
                                        )}
                                        <button
                                            className="action-btn"
                                            onClick={() => handleUnstar(item.id, item.type)}
                                        >
                                            <FontAwesomeIcon icon={faStar} style={{ color: '#FFD700' }} />
                                        </button>
                                        <button className="action-btn">
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
    )
}

export default StarredItems 