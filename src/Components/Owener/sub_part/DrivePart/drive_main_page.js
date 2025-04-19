import React, { useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'
import { useLocation, useNavigate } from 'react-router-dom'

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

    return (
        <div className="drive-container">
            <h1>Drive Main Page</h1>
            <p>Select a section from the sidebar to manage your files.</p>
        </div>
    )
}

export default DriveMainPage