import React, { useEffect } from 'react'
import { useUIContext } from '../../../../redux/UIContext'

function StarredItems() {
    const { activeProfileSection, setActiveProfileSection } = useUIContext()
    
    useEffect(() => {
        if (activeProfileSection !== 'Starred Items') {
            setActiveProfileSection('Starred Items')
        }
    }, [activeProfileSection, setActiveProfileSection])
    
    return (
        <div className="starred-items-container">
            <h1>{activeProfileSection}</h1>
            <div className="starred-content">
                <p>No starred items yet.</p>
                <p>Mark important files with a star to find them quickly here.</p>
            </div>
        </div>
    )
}

export default StarredItems 