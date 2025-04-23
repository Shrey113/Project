import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../../redux/UIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder, faDownload, faShare, faStar, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import '../DriveStyles.css'
import { Server_url } from '../../../../../redux/AllData'
import { useSelector } from 'react-redux'

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

    const [showShareModal, setShowShareModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [shareEmail, setShareEmail] = useState('')
    const [sharePermission, setSharePermission] = useState('READ')

    useEffect(() => {
        if (activeProfileSection !== 'Shared Files') {
            setActiveProfileSection('Shared Files')
        }

        const fetchSharedItems = async () => {
            setIsLoading(true)
            try {
                if (activeTab === 'shared-with-me') {
                    const response = await fetch(`${Server_url}/owner/drive/shared-with-me?user_email=${user_email}`)
                    if (!response.ok) {
                        throw new Error(`Server responded with ${response.status}`)
                    }
                    const data = await response.json()
                    setSharedWithMe(data)
                } else {
                    const response = await fetch(`${Server_url}/drive/shared-by-me?user_email=${user_email}`)
                    if (!response.ok) {
                        throw new Error(`Server responded with ${response.status}`)
                    }
                    const data = await response.json()
                    setSharedByMe(data)
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab} items:`, error)
                // Set demo data
                if (activeTab === 'shared-with-me') {
                    setSharedWithMe([
                        {
                            id: 1,
                            name: 'Team Project Plan.pdf',
                            type: 'file',
                            file_type: 'pdf',
                            size: 3.2,
                            shared_by: 'manager@example.com',
                            permission: 'READ',
                            created_at: new Date().toISOString(),
                            shared_at: new Date().toISOString()
                        },
                        {
                            id: 2,
                            name: 'Marketing Assets',
                            type: 'folder',
                            shared_by: 'design@example.com',
                            permission: 'WRITE',
                            created_at: new Date().toISOString(),
                            shared_at: new Date().toISOString()
                        }
                    ])
                } else {
                    setSharedByMe([
                        {
                            id: 3,
                            name: 'Financial Report.xlsx',
                            type: 'file',
                            file_type: 'xlsx',
                            size: 1.7,
                            shared_with: ['finance@example.com', 'ceo@example.com'],
                            created_at: new Date().toISOString(),
                            shared_at: new Date().toISOString()
                        },
                        {
                            id: 4,
                            name: 'Client Presentations',
                            type: 'folder',
                            shared_with: ['sales@example.com'],
                            created_at: new Date().toISOString(),
                            shared_at: new Date().toISOString()
                        }
                    ])
                }
            } finally {
                setIsLoading(false)
            }
        }

        // Fetch shared items based on active tab
        fetchSharedItems()
    }, [activeProfileSection, setActiveProfileSection, activeTab,user_email])

    const fetchSharedItems = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'shared-with-me') {
                const response = await fetch(`${Server_url}/owner/drive/shared-with-me?user_email=${user_email}`)
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`)
                }
                const data = await response.json()
                setSharedWithMe(data)
            } else {
                const response = await fetch(`${Server_url}/drive/shared-by-me?user_email=${user_email}`)
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`)
                }
                const data = await response.json()
                setSharedByMe(data)
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab} items:`, error)
            // Set demo data
            if (activeTab === 'shared-with-me') {
                setSharedWithMe([
                    {
                        id: 1,
                        name: 'Team Project Plan.pdf',
                        type: 'file',
                        file_type: 'pdf',
                        size: 3.2,
                        shared_by: 'manager@example.com',
                        permission: 'READ',
                        created_at: new Date().toISOString(),
                        shared_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Marketing Assets',
                        type: 'folder',
                        shared_by: 'design@example.com',
                        permission: 'WRITE',
                        created_at: new Date().toISOString(),
                        shared_at: new Date().toISOString()
                    }
                ])
            } else {
                setSharedByMe([
                    {
                        id: 3,
                        name: 'Financial Report.xlsx',
                        type: 'file',
                        file_type: 'xlsx',
                        size: 1.7,
                        shared_with: ['finance@example.com', 'ceo@example.com'],
                        created_at: new Date().toISOString(),
                        shared_at: new Date().toISOString()
                    },
                    {
                        id: 4,
                        name: 'Client Presentations',
                        type: 'folder',
                        shared_with: ['sales@example.com'],
                        created_at: new Date().toISOString(),
                        shared_at: new Date().toISOString()
                    }
                ])
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
                    item_id: selectedItem.id,
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

    const getFileIcon = (fileType) => {
        // Add more file type icons as needed
        return <FontAwesomeIcon icon={faFile} className={`file-icon file-${fileType}`} />
    }

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
        }).filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    const sortedItems = getItemsToDisplay()

    return (
        <div className="shared-files-container">
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

            <div className="files-container">
                <div className="files-header">
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('name')
                    }}>
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'shared_at' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('shared_at')
                    }}>
                        {activeTab === 'shared-with-me' ? 'Shared By' : 'Shared With'}
                    </div>
                    <div className="header-item" onClick={() => {
                        setSortOrder(sortBy === 'shared_at' && sortOrder === 'asc' ? 'desc' : 'asc')
                        setSortBy('shared_at')
                    }}>
                        Date Shared {sortBy === 'shared_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-item">Actions</div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading shared items...</div>
                ) : (
                    <div className="files-list">
                        {sortedItems.length === 0 ? (
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
                                    <div className="file-owner">
                                        {activeTab === 'shared-with-me' ? (
                                            <span title={item.shared_by}>
                                                <FontAwesomeIcon icon={faUserFriends} /> {item.shared_by}
                                            </span>
                                        ) : (
                                            <span title={item.shared_with.join(', ')}>
                                                <FontAwesomeIcon icon={faUserFriends} /> {item.shared_with.length} user(s)
                                            </span>
                                        )}
                                    </div>
                                    <div className="file-date">
                                        {new Date(item.shared_at).toLocaleDateString()}
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
                                        <button className="action-btn">
                                            <FontAwesomeIcon icon={faStar} />
                                        </button>
                                        {activeTab === 'shared-by-me' && (
                                            <button
                                                className="action-btn"
                                                onClick={() => {
                                                    setSelectedItem(item)
                                                    setShowShareModal(true)
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faShare} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
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

                            {activeTab === 'shared-by-me' && selectedItem?.shared_with?.length > 0 && (
                                <div className="already-shared">
                                    <h4>Already shared with:</h4>
                                    <ul>
                                        {selectedItem.shared_with.map((email, index) => (
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
                                        ))}
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