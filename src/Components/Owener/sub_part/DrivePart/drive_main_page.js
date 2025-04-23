import React, { useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { useLocation, useNavigate, Routes, Route, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faStar, faShare, faTrash, faUpload, faCloud } from '@fortawesome/free-solid-svg-icons'
import DriveHome from './DriveHome'
import StarredItems from './StarredItems'
import SharedFilesPage from './SharedFiles/SharedFilesPage'
import './DriveStyles.css'

function DriveMainPage() {
    const { setActiveProfileSection } = useUIContext()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        // Set default section when drive page loads
        setActiveProfileSection('Drive Home')

        // If we're at the root drive URL, redirect to the home page
        if (location.pathname === '/Owner/drive') {
            navigate('/Owner/drive/home')
        }
    }, [setActiveProfileSection, location.pathname, navigate])

    // Determine which sidebar item is active
    const getActiveMenuItem = () => {
        const path = location.pathname
        if (path.includes('/home')) return 'home'
        if (path.includes('/starred')) return 'starred'
        if (path.includes('/shared')) return 'shared'
        if (path.includes('/trash')) return 'trash'
        if (path.includes('/upload')) return 'upload'
        return ''
    }

    const activeMenuItem = getActiveMenuItem()

    return (
        <div className="drive-main-layout">
            <div className="drive-sidebar">
                <div className="sidebar-header">
                    <h2><FontAwesomeIcon icon={faCloud} /> My Drive</h2>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/Owner/drive/home"
                        className={`sidebar-item ${activeMenuItem === 'home' ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faHome} />
                        <span>Drive Home</span>
                    </Link>

                    <Link
                        to="/Owner/drive/starred"
                        className={`sidebar-item ${activeMenuItem === 'starred' ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faStar} />
                        <span>Starred Items</span>
                    </Link>

                    <Link
                        to="/Owner/drive/shared"
                        className={`sidebar-item ${activeMenuItem === 'shared' ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faShare} />
                        <span>Shared Files</span>
                    </Link>

                    <Link
                        to="/Owner/drive/trash"
                        className={`sidebar-item ${activeMenuItem === 'trash' ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Trash</span>
                    </Link>

                    <Link
                        to="/Owner/drive/upload"
                        className={`sidebar-item ${activeMenuItem === 'upload' ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faUpload} />
                        <span>Quick Upload</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-upgrade">
                        Upgrade Storage
                    </button>
                </div>
            </div>

            <div className="drive-content">
                <Routes>
                    <Route path="home" element={<DriveHome />} />
                    <Route path="starred" element={<StarredItems />} />
                    <Route path="shared" element={<SharedFilesPage />} />
                    <Route path="trash" element={<p>Trash feature coming soon</p>} />
                    <Route path="upload" element={
                        <div className="upload-page">
                            <h1>Quick Upload</h1>
                            <div className="upload-zone">
                                <FontAwesomeIcon icon={faUpload} size="3x" />
                                <p>Drop files here or click to upload</p>
                                <input type="file" multiple className="file-input" />
                            </div>
                        </div>
                    } />
                    <Route path="*" element={<DriveHome />} />
                </Routes>
            </div>
        </div>
    )
}

export default DriveMainPage