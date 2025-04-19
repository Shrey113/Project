import React, { useState, useEffect } from 'react'
import { useUIContext } from '../../../../../redux/UIContext'

function SharedFilesPage() {
    const [activeTab, setActiveTab] = useState('shared-with-me')
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    
    useEffect(() => {
        if (activeProfileSection !== 'Shared Files') {
            setActiveProfileSection('Shared Files')
        }
    }, [activeProfileSection, setActiveProfileSection])
    
    return (
        <div className="shared-files-container">
            <h1>{activeProfileSection}</h1>
            
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
            
            <div className="tab-content">
                {activeTab === 'shared-with-me' ? (
                    <div className="shared-with-me">
                        <h2>Files shared with me</h2>
                        <p>No files have been shared with you yet.</p>
                    </div>
                ) : (
                    <div className="shared-by-me">
                        <h2>Files I've shared</h2>
                        <p>You haven't shared any files yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SharedFilesPage 