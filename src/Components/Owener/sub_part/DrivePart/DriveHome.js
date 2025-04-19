import React, { useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'

function DriveHome() {
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    
    useEffect(() => {
        if (activeProfileSection !== 'Drive Home') {
            setActiveProfileSection('Drive Home')
        }
    }, [activeProfileSection, setActiveProfileSection])
    
    return (
        <div className="drive-home-container">
            <h1>{activeProfileSection}</h1>
            
            <div className="drive-stats">
                <div className="stat-card">
                    <h3>Storage</h3>
                    <p>0 MB used of 1 GB</p>
                    <div className="progress-bar">
                        <div className="progress" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>
            
            <div className="recent-files">
                <h2>Recent Files</h2>
                <p>No recent files.</p>
            </div>
        </div>
    )
}

export default DriveHome 