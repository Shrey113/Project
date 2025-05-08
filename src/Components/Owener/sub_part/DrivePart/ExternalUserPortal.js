import React, { useState, useEffect } from "react";
import { Server_url, showAcceptToast, showRejectToast } from "../../../../redux/AllData";
import "./ExternalUserPortal.css";

const ExternalUserPortal = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingItems, setIsFetchingItems] = useState(false);
    const [isDownloading, setIsDownloading] = useState(null);
    const [sharedItems, setSharedItems] = useState({ folders: [], files: [] });
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Check if user is already logged in (from localStorage)
    useEffect(() => {
        const storedUser = localStorage.getItem("external_user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsLoggedIn(true);
                fetchSharedItems(userData.email);
            } catch (error) {
                console.error("Error parsing stored user data", error);
                localStorage.removeItem("external_user");
            }
        }
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await fetch(`${Server_url}/share_drive/validate-external-user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Invalid email or password");
            }
            
            setUser(data.user);
            setIsLoggedIn(true);
            localStorage.setItem("external_user", JSON.stringify(data.user));
            showAcceptToast({ message: "Login successful" });
            
            // Fetch shared items for this user
            fetchSharedItems(data.user.email);
            
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("external_user");
        setSharedItems({ folders: [], files: [] });
    };
    
    const fetchSharedItems = async (userEmail) => {
        setIsFetchingItems(true);
        try {
            const response = await fetch(`${Server_url}/share_drive/external-user-items/${userEmail}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch shared items");
            }
            
            const data = await response.json();
            setSharedItems(data);
            
        } catch (error) {
            console.error("Error fetching shared items:", error);
            showRejectToast({ message: "Error loading shared items" });
        } finally {
            setIsFetchingItems(false);
        }
    };
    
    const handleDownloadFile = async (fileId, fileName) => {
        setIsDownloading(fileId);
        try {
            const response = await fetch(
                `${Server_url}/drive/download/${fileId}?external=true&email=${user.email}`
            );
            
            if (!response.ok) {
                throw new Error("File download failed");
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showAcceptToast({ message: "Download started" });
            
        } catch (error) {
            console.error("Download error:", error);
            showRejectToast({ message: "Failed to download file" });
        } finally {
            setIsDownloading(null);
        }
    };
    
    const getPermissionLabel = (permission) => {
        const permLower = typeof permission === 'string' ? permission.toLowerCase() : '';
        switch (permLower) {
            case 'read': return 'View only';
            case 'write': return 'Can edit';
            case 'admin': return 'Full access';
            default: return 'View only';
        }
    };

    const getPermissionClass = (permission) => {
        const permLower = typeof permission === 'string' ? permission.toLowerCase() : '';
        switch (permLower) {
            case 'read': return 'permission-read';
            case 'write': return 'permission-write';
            case 'admin': return 'permission-admin';
            default: return 'permission-read';
        }
    };
    
    const getFileIcon = (fileType) => {
        if (!fileType) return "file";
        
        fileType = fileType.toLowerCase();
        
        if (fileType.includes("pdf")) return "pdf";
        if (fileType.includes("word") || fileType.includes("doc")) return "doc";
        if (fileType.includes("excel") || fileType.includes("xlsx") || fileType.includes("sheet")) return "excel";
        if (fileType.includes("powerpoint") || fileType.includes("presentation") || fileType.includes("ppt")) return "ppt";
        if (fileType.includes("image") || fileType.includes("jpg") || fileType.includes("png") || fileType.includes("gif")) return "image";
        if (fileType.includes("video")) return "video";
        if (fileType.includes("audio")) return "audio";
        if (fileType.includes("zip") || fileType.includes("compressed")) return "zip";
        if (fileType.includes("code") || fileType.includes("json") || fileType.includes("html") || fileType.includes("css")) return "code";
        
        return "file";
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown size";
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Filter items by search term
    const filteredFolders = sharedItems.folders.filter(folder => 
        folder.folder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        folder.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredFiles = sharedItems.files.filter(file => 
        file.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.file_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderFileTypeIcon = (fileType) => {
        const type = getFileIcon(fileType);
        return (
            <div className={`file-type-icon ${type}-icon`}>
                <i className={`file-icon-inner ${type}-inner`}></i>
            </div>
        );
    };
    
    const renderLoginForm = () => (
        <div className="external-login-container">
            <div className="external-login-box">
                <div className="external-login-header">
                    <div className="login-logo">
                        <div className="logo-icon">🔐</div>
                        <div className="logo-text">External Portal</div>
                    </div>
                    <p>Sign in to access your shared files and folders</p>
                </div>
                
                {error && (
                    <div className="login-error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="external-login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={togglePasswordVisibility}
                                tabIndex="-1"
                            >
                                <span className="password-eye-icon">
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="button-loading">
                                <span className="loading-spinner"></span>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
                
                <div className="external-login-footer">
                    <p>This portal is for authorized external users only. Contact your administrator if you're having trouble signing in.</p>
                </div>
            </div>
        </div>
    );
    
    const renderDashboard = () => (
        <div className="external-dashboard">
            <div className="external-dashboard-header">
                <div className="user-welcome">
                    <h2>Welcome, {user?.username}</h2>
                    <p>{user?.email}</p>
                </div>
                
                <div className="dashboard-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search files and folders"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    
                    <button 
                        className="refresh-button"
                        onClick={() => fetchSharedItems(user.email)}
                        disabled={isFetchingItems}
                        title="Refresh"
                    >
                        {isFetchingItems ? "⟳" : "↻"}
                    </button>
                    
                    <button 
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
            
            <div className="shared-items-container">
                <h3>Shared with you</h3>
                
                {isFetchingItems ? (
                    <div className="loading-items">
                        <div className="loading-spinner"></div>
                        <p>Loading your shared items...</p>
                    </div>
                ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                    searchTerm ? (
                        <div className="no-items-message">
                            <div className="no-results-icon">🔍</div>
                            <p>No results found for "{searchTerm}"</p>
                            <button 
                                className="clear-search-button"
                                onClick={() => setSearchTerm("")}
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="no-items-message">
                            <div className="empty-state-icon">📂</div>
                            <p>No items have been shared with you yet.</p>
                            <p className="empty-state-note">When someone shares files or folders with you, they'll appear here.</p>
                        </div>
                    )
                ) : (
                    <>
                        {filteredFolders.length > 0 && (
                            <div className="items-section">
                                <h4 className="section-title">Folders</h4>
                                <div className="items-grid">
                                    {filteredFolders.map(folder => (
                                        <div key={`folder-${folder.folder_id}`} className="shared-item folder-item">
                                            <div className="item-icon folder-icon">
                                                <span>📁</span>
                                            </div>
                                            <div className="item-details">
                                                <div className="item-name">{folder.folder_name}</div>
                                                <div className="item-meta">
                                                    <span className="item-owner">
                                                        <span className="owner-label">Shared by:</span> {folder.owner_name}
                                                    </span>
                                                    <span className={`item-permission ${getPermissionClass(folder.permission)}`}>
                                                        {getPermissionLabel(folder.permission)}
                                                    </span>
                                                </div>
                                                {folder.shared_date && (
                                                    <div className="item-date">
                                                        Shared on {formatDate(folder.shared_date)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {filteredFiles.length > 0 && (
                            <div className="items-section">
                                <h4 className="section-title">Files</h4>
                                <div className="items-grid">
                                    {filteredFiles.map(file => (
                                        <div key={`file-${file.file_id}`} className="shared-item file-item">
                                            <div className="item-icon file-icon">
                                                {renderFileTypeIcon(file.file_type)}
                                            </div>
                                            <div className="item-details">
                                                <div className="item-name">{file.file_name}</div>
                                                <div className="item-meta">
                                                    <span className="item-owner">
                                                        <span className="owner-label">Shared by:</span> {file.owner_name}
                                                    </span>
                                                    <span className={`item-permission ${getPermissionClass(file.permission)}`}>
                                                        {getPermissionLabel(file.permission)}
                                                    </span>
                                                </div>
                                                <div className="item-info">
                                                    {file.file_size && (
                                                        <span className="file-size">{formatFileSize(file.file_size)}</span>
                                                    )}
                                                    {file.shared_date && (
                                                        <span className="shared-date">{formatDate(file.shared_date)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                className={`download-button ${isDownloading === file.file_id ? 'downloading' : ''}`}
                                                onClick={() => handleDownloadFile(file.file_id, file.file_name)}
                                                disabled={isDownloading === file.file_id}
                                                title="Download file"
                                            >
                                                {isDownloading === file.file_id ? (
                                                    <span className="download-spinner"></span>
                                                ) : (
                                                    <span className="download-icon">↓</span>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <div className="external-portal-footer">
                <p>© {new Date().getFullYear()} Secure File Sharing Portal. All rights reserved.</p>
                <p>For support, please contact your administrator.</p>
            </div>
        </div>
    );

    return (
        <div className="external-portal-container">
            {isLoggedIn ? renderDashboard() : renderLoginForm()}
        </div>
    );
};

export default ExternalUserPortal; 