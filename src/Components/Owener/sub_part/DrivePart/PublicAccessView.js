import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Server_url, showRejectToast, showAcceptToast } from '../../../../redux/AllData';
import './PublicAccessView.css';

const PublicAccessView = () => {
    const { accessToken } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [item, setItem] = useState(null);
    const [owner, setOwner] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (!accessToken) {
            setError('Invalid access link');
            setIsLoading(false);
            return;
        }

        const fetchPublicItem = async () => {
            try {
                const response = await fetch(`${Server_url}/share_drive/public-access/${accessToken}`);
                
                if (!response.ok) {
                    throw new Error('Invalid or expired access link');
                }
                
                const data = await response.json();
                
                if (!data.item) {
                    throw new Error('Item not found');
                }
                
                setItem(data.item);
                setOwner(data.owner);
                
                // Check if authentication is required for this item
                if (data.requires_auth && !localStorage.getItem('public_access_token')) {
                    setShowLoginPrompt(true);
                }
                
            } catch (error) {
                console.error('Error fetching public item:', error);
                setError(error.message || 'Failed to load shared item');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicItem();
    }, [accessToken]);

    const handleDownloadFile = async () => {
        if (!item || item.type !== 'file') return;
        
        setIsDownloading(true);
        
        try {
            const response = await fetch(
                `${Server_url}/drive/public-download/${accessToken}`
            );
            
            if (!response.ok) {
                throw new Error('File download failed');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', item.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showAcceptToast({ message: 'File downloaded successfully' });
            
        } catch (error) {
            console.error('Download error:', error);
            showRejectToast({ message: 'Failed to download file' });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const navigateToFolder = async (folderId) => {
        setIsLoading(true);
        
        try {
            const response = await fetch(
                `${Server_url}/share_drive/public-folder/${accessToken}/${folderId}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to navigate to folder');
            }
            
            const data = await response.json();
            
            if (!data.item) {
                throw new Error('Folder not found');
            }
            
            setItem(data.item);
            
            // Update breadcrumb path
            if (data.path) {
                setCurrentPath(data.path);
            } else {
                // If path isn't provided, append to current path
                const folderName = item.contents.find(c => c.id === folderId && c.type === 'folder')?.name;
                if (folderName) {
                    setCurrentPath([...currentPath, { id: folderId, name: folderName }]);
                }
            }
            
        } catch (error) {
            console.error('Navigation error:', error);
            showRejectToast({ message: 'Failed to navigate to folder' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const navigateBack = () => {
        if (currentPath.length <= 1) {
            // If at root, reload the original shared item
            setIsLoading(true);
            setCurrentPath([]);
            
            fetch(`${Server_url}/share_drive/public-access/${accessToken}`)
                .then(response => {
                    if (!response.ok) throw new Error('Failed to navigate back');
                    return response.json();
                })
                .then(data => {
                    setItem(data.item);
                })
                .catch(error => {
                    console.error('Error navigating back:', error);
                    showRejectToast({ message: 'Failed to navigate back' });
                })
                .finally(() => setIsLoading(false));
        } else {
            // Navigate to parent folder
            const parentPath = currentPath.slice(0, -1);
            const parentId = parentPath.length > 0 ? parentPath[parentPath.length - 1].id : null;
            
            if (parentId) {
                navigateToFolder(parentId);
            } else {
                // If no parent ID, reload the original shared item
                setIsLoading(true);
                setCurrentPath([]);
                
                fetch(`${Server_url}/share_drive/public-access/${accessToken}`)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to navigate back');
                        return response.json();
                    })
                    .then(data => {
                        setItem(data.item);
                    })
                    .catch(error => {
                        console.error('Error navigating back:', error);
                        showRejectToast({ message: 'Failed to navigate back' });
                    })
                    .finally(() => setIsLoading(false));
            }
        }
    };
    
    const handleAuthentication = async (e) => {
        e.preventDefault();
        
        if (!loginCredentials.email || !loginCredentials.password) {
            setAuthError('Please enter both email and password');
            return;
        }
        
        setIsAuthenticating(true);
        setAuthError(null);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/authenticate-public-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginCredentials.email,
                    password: loginCredentials.password,
                    access_token: accessToken
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Authentication failed');
            }
            
            const data = await response.json();
            
            // Store authentication token
            localStorage.setItem('public_access_token', data.token);
            
            // Hide login prompt and reload data
            setShowLoginPrompt(false);
            setIsLoading(true);
            
            const itemResponse = await fetch(`${Server_url}/share_drive/public-access/${accessToken}`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            if (!itemResponse.ok) {
                throw new Error('Failed to load item after authentication');
            }
            
            const itemData = await itemResponse.json();
            setItem(itemData.item);
            setOwner(itemData.owner);
            
        } catch (error) {
            console.error('Authentication error:', error);
            setAuthError(error.message || 'Authentication failed');
        } finally {
            setIsAuthenticating(false);
            setIsLoading(false);
        }
    };

    const renderLoading = () => (
        <div className="public-access-loading">
            <div className="loading-spinner"></div>
            <p>Loading shared content...</p>
        </div>
    );

    const renderError = () => (
        <div className="public-access-error">
            <div className="error-icon">⚠️</div>
            <h2>Access Error</h2>
            <p>{error}</p>
            <p className="error-help">This link may be invalid or expired. Please contact the person who shared this with you for a new link.</p>
            <button 
                className="back-to-home-btn"
                onClick={() => navigate('/')}
            >
                Back to Home
            </button>
        </div>
    );
    
    const renderAuthenticationPrompt = () => (
        <div className="auth-prompt-overlay">
            <div className="auth-prompt-container">
                <div className="auth-prompt-header">
                    <h2>Authentication Required</h2>
                    <p>Please enter your credentials to access this shared item</p>
                </div>
                
                {authError && (
                    <div className="auth-error-message">
                        {authError}
                    </div>
                )}
                
                <form onSubmit={handleAuthentication}>
                    <div className="auth-input-group">
                        <label htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            value={loginCredentials.email}
                            onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                            placeholder="Enter your email"
                            disabled={isAuthenticating}
                        />
                    </div>
                    
                    <div className="auth-input-group">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            value={loginCredentials.password}
                            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                            placeholder="Enter your password"
                            disabled={isAuthenticating}
                        />
                    </div>
                    
                    <div className="auth-actions">
                        <button
                            type="button"
                            className="auth-cancel-btn"
                            onClick={() => navigate('/')}
                            disabled={isAuthenticating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isAuthenticating}
                        >
                            {isAuthenticating ? 'Authenticating...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    const renderFilePreview = () => {
        const fileType = item.file_type ? item.file_type.toLowerCase() : '';
        
        // For images
        if (fileType.includes('image')) {
            return (
                <div className="file-preview image-preview">
                    <img 
                        src={`${Server_url}/drive/public-preview/${accessToken}`}
                        alt={item.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300?text=Preview+Unavailable";
                        }}
                    />
                </div>
            );
        }
        
        // For PDF
        if (fileType.includes('pdf')) {
            return (
                <div className="file-preview pdf-preview">
                    <iframe 
                        src={`${Server_url}/drive/public-preview/${accessToken}`}
                        title={item.name}
                        width="100%"
                        height="500px"
                    ></iframe>
                </div>
            );
        }
        
        // For video
        if (fileType.includes('video')) {
            return (
                <div className="file-preview video-preview">
                    <video controls width="100%">
                        <source src={`${Server_url}/drive/public-preview/${accessToken}`} type={item.file_type} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }
        
        // Default file icon for non-previewable files
        return (
            <div className="file-preview generic-preview">
                <div className="file-icon">
                    <span className="file-icon-symbol">{getFileIconSymbol(fileType)}</span>
                </div>
                <p className="file-name">{item.name}</p>
                <p className="file-type">{fileType.toUpperCase()}</p>
                <p className="preview-message">Preview not available for this file type</p>
                <button 
                    className="download-file-btn"
                    onClick={handleDownloadFile}
                    disabled={isDownloading}
                >
                    {isDownloading ? 'Downloading...' : 'Download File'}
                </button>
            </div>
        );
    };
    
    const renderFolderView = () => {
        return (
            <div className="folder-view">
                {currentPath.length > 0 && (
                    <div className="folder-breadcrumb">
                        <button 
                            className="breadcrumb-item home"
                            onClick={() => navigateBack()}
                        >
                            Home
                        </button>
                        {currentPath.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                                <span className="breadcrumb-separator">/</span>
                                <button 
                                    className={`breadcrumb-item ${index === currentPath.length - 1 ? 'active' : ''}`}
                                    onClick={() => {
                                        if (index < currentPath.length - 1) {
                                            navigateToFolder(folder.id);
                                        }
                                    }}
                                    disabled={index === currentPath.length - 1}
                                >
                                    {folder.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                )}
                
                <div className="folder-header">
                    <h3>{item.name}</h3>
                    <p>{item.itemCount || 0} items</p>
                </div>
                
                <div className="folder-items-list">
                    {item.contents && item.contents.length > 0 ? (
                        item.contents.map((content, index) => (
                            <div 
                                key={index} 
                                className="folder-item"
                                onClick={() => {
                                    if (content.type === 'folder') {
                                        navigateToFolder(content.id);
                                    }
                                }}
                            >
                                <div className="item-icon">
                                    {content.type === 'folder' 
                                        ? <span className="folder-icon-symbol">📁</span>
                                        : <span className="file-icon-symbol">{getFileIconSymbol(content.file_type)}</span>
                                    }
                                </div>
                                <div className="item-details">
                                    <span className="item-name">{content.name}</span>
                                    <span className="item-type">
                                        {content.type === 'folder' 
                                            ? 'Folder' 
                                            : content.file_type?.toUpperCase() || 'File'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-folder">
                            <p>This folder is empty</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    const renderPermissionBadge = () => {
        if (!item || !item.permission) return null;
        
        let badge;
        switch(item.permission) {
            case 'read':
                badge = { 
                    label: 'View only', 
                    color: '#059669',
                    bgColor: '#d1fae5'
                };
                break;
            case 'write':
                badge = { 
                    label: 'Can edit', 
                    color: '#d97706',
                    bgColor: '#fef3c7'
                };
                break;
            case 'admin':
                badge = { 
                    label: 'Owner access', 
                    color: '#dc2626',
                    bgColor: '#fee2e2'
                };
                break;
            default:
                badge = { 
                    label: 'View only', 
                    color: '#059669',
                    bgColor: '#d1fae5'
                };
        }
        
        return (
            <div 
                className="permission-badge"
                style={{ 
                    backgroundColor: badge.bgColor, 
                    color: badge.color,
                    border: `1px solid ${badge.color}`
                }}
            >
                {badge.label}
            </div>
        );
    };

    const renderContent = () => {
        if (!item) return null;
        
        const itemType = item.type || (item.file_id ? 'file' : 'folder');
        
        return (
            <div className="public-item-container">
                <div className="public-item-header">
                    <div className="item-title">
                        <h2>{item.name}</h2>
                        <div className="item-metadata">
                            <p>Shared by {owner?.name || 'Unknown'}</p>
                            {renderPermissionBadge()}
                        </div>
                    </div>
                    
                    {itemType === 'file' && (
                        <button 
                            className="download-button"
                            onClick={handleDownloadFile}
                            disabled={isDownloading}
                        >
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </button>
                    )}
                </div>
                
                <div className="public-item-content">
                    {itemType === 'file' ? (
                        renderFilePreview()
                    ) : (
                        renderFolderView()
                    )}
                </div>
            </div>
        );
    };
    
    // Helper function to determine file icon based on type
    const getFileIconSymbol = (fileType = '') => {
        if (!fileType) return '📄';
        
        const typeToIcon = {
            'pdf': '📕',
            'doc': '📝', 'docx': '📝', 'word': '📝',
            'xls': '📊', 'xlsx': '📊', 'excel': '📊', 'sheet': '📊',
            'ppt': '📺', 'pptx': '📺', 'powerpoint': '📺', 'presentation': '📺',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'image': '🖼️',
            'mp4': '🎥', 'mov': '🎥', 'avi': '🎥', 'mkv': '🎥', 'video': '🎥',
            'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵', 'audio': '🎵',
            'zip': '🗄️', 'rar': '🗄️', 'tar': '🗄️', 'gz': '🗄️', 'compressed': '🗄️',
            'html': '💻', 'css': '💻', 'js': '💻', 'json': '💻', 'code': '💻'
        };
        
        for (const [key, value] of Object.entries(typeToIcon)) {
            if (fileType.toLowerCase().includes(key)) {
                return value;
            }
        }
        
        return '📄';
    };

    return (
        <div className="public-access-container">
            <div className="public-access-header">
                <div className="site-logo" onClick={() => navigate('/')}>
                    Drive Share
                </div>
            </div>
            
            <div className="public-access-content">
                {isLoading ? renderLoading() : error ? renderError() : renderContent()}
            </div>
            
            <footer className="public-access-footer">
                <p>Secure file sharing powered by Your Company</p>
            </footer>
            
            {showLoginPrompt && renderAuthenticationPrompt()}
        </div>
    );
};

export default PublicAccessView; 