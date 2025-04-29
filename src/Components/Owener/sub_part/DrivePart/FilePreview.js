import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiX } from 'react-icons/fi';
import './DriveStyles.css';
import { Server_url } from '../../../../redux/AllData';

const FilePreview = ({ file, onClose }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [skeletonVisible, setSkeletonVisible] = useState(true);

    useEffect(() => {
        console.log('FilePreview component mounted');
        console.log('File:', file);
    }, [file]);

    // List of supported file formats
    const supportedFormats = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
        video: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'mkv'],
        audio: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
        pdf: ['pdf'],
        text: ['txt', 'rtf', 'md', 'csv'],
        code: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'java', 'py', 'c', 'cpp', 'php'],
        archive: ['zip', 'rar', '7z', 'tar', 'gz']
    };

    // Extract file extension from file name or file_type
    const getFileExtension = (fileName, fileType) => {
        // First try to get from the file_type if it's set correctly
        if (fileType && fileType !== 'file') {
            return fileType.toLowerCase().replace('.', '');
        }

        // If file_type isn't helpful, extract from file name
        if (fileName) {
            const parts = fileName.split('.');
            if (parts.length > 1) {
                return parts[parts.length - 1].toLowerCase();
            }
        }

        return 'unknown';
    };

    // Get file type category
    const getFileCategory = (fileType, fileName) => {
        const extension = getFileExtension(fileName, fileType);

        for (const [category, extensions] of Object.entries(supportedFormats)) {
            if (extensions.includes(extension)) {
                return category;
            }
        }
        return 'other';
    };

    // Check if the file format is supported for preview
    const isFormatSupported = (fileType, fileName) => {
        const category = getFileCategory(fileType, fileName);
        return category !== 'other' && category !== 'archive';
    };

    useEffect(() => {
        const preCheckAndFetchFile = async () => {
            setLoading(true);
            setSkeletonVisible(true);

            // Make sure we have valid file data
            if (!file || !file.file_id) {
                setError('Invalid file data');
                setLoading(false);
                setSkeletonVisible(false);
                return;
            }

            // Pre-check file format
            const fileExtension = getFileExtension(file.file_name, file.file_type);
            const category = getFileCategory(file.file_type, file.file_name);


            setSkeletonVisible(false);


            // If format isn't supported, show error without making server request
            if (category === 'other' || category === 'archive') {
                setError(`Preview not available for ${fileExtension.toUpperCase()} files`);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${Server_url}/file_preview/preview/${file.file_id}`, {
                    responseType: 'blob'
                });

                const url = URL.createObjectURL(response.data);
                setFileUrl(url);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching file preview:', err);
                setError('Failed to load file preview');
                setLoading(false);
            }
        };

        if (file) {
            preCheckAndFetchFile();
        }

        return () => {
            // Clean up blob URL on component unmount
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [file]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Skeleton loader component
    const SkeletonLoader = () => {
        const fileCategory = getFileCategory(file.file_type || '', file.file_name);

        return (
            <div className="file-preview-skeleton">
                <div className="preview-skeleton-header">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-button"></div>
                </div>

                <div className="preview-skeleton-content">
                    {fileCategory === 'image' && (
                        <div className="skeleton-image pulse"></div>
                    )}

                    {fileCategory === 'video' && (
                        <div className="skeleton-video">
                            <div className="skeleton-video-controls pulse"></div>
                        </div>
                    )}

                    {fileCategory === 'audio' && (
                        <div className="skeleton-audio pulse"></div>
                    )}

                    {fileCategory === 'pdf' && (
                        <div className="skeleton-document pulse"></div>
                    )}

                    {(fileCategory === 'text' || fileCategory === 'code') && (
                        <div className="skeleton-text">
                            <div className="skeleton-line pulse"></div>
                            <div className="skeleton-line pulse"></div>
                            <div className="skeleton-line pulse"></div>
                            <div className="skeleton-line pulse" style={{ width: '75%' }}></div>
                        </div>
                    )}
                </div>

                <div className="preview-skeleton-footer">
                    <div className="skeleton-button pulse"></div>
                </div>
            </div>
        );
    };

    if (skeletonVisible) {
        return (
            <div className="file-preview-overlay">
                <div className="file-preview-container">
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    if (loading && !skeletonVisible) {
        return (
            <div className="file-preview-overlay">
                <div className="file-preview-container">
                    <div className="file-preview-loading">Loading preview...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="file-preview-overlay" onClick={onClose}>
                <div className="file-preview-container" onClick={(e) => e.stopPropagation()}>
                    <div className="file-preview-header">
                        <h3>{file?.file_name || 'File Preview'}</h3>
                        <button className="preview-close-btn" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>
                    <div className="file-preview-error">
                        <div className="error-icon">!</div>
                        <p>{error}</p>
                        {!isFormatSupported(file?.file_type, file?.file_name) && (
                            <p className="error-tip">This file type cannot be previewed, but you can download it.</p>
                        )}
                    </div>
                    <div className="file-preview-actions">
                        <button className="preview-download-btn" onClick={handleDownload}>
                            <FiDownload /> Download
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const fileCategory = getFileCategory(file.file_type || '', file.file_name);
    const fileExtension = getFileExtension(file.file_name, file.file_type);
    console.log("File category:", fileCategory, "Extension:", fileExtension);

    return (
        <div className="file-preview-overlay" onClick={onClose}>
            <div className="file-preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="file-preview-header">
                    <h3>{file.file_name}</h3>
                    <button className="preview-close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="file-preview-content">
                    {fileCategory === 'image' && (
                        <img src={fileUrl} alt={file.file_name} className="preview-image" />
                    )}

                    {fileCategory === 'video' && (
                        <video controls className="preview-video">
                            <source src={fileUrl} type={`video/${fileExtension}`} />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {fileCategory === 'audio' && (
                        <audio controls className="preview-audio">
                            <source src={fileUrl} type={`audio/${fileExtension}`} />
                            Your browser does not support the audio tag.
                        </audio>
                    )}

                    {fileCategory === 'pdf' && (
                        <iframe
                            src={fileUrl}
                            title={file.file_name}
                            className="preview-pdf"
                        />
                    )}

                    {(fileCategory === 'text' || fileCategory === 'code') && (
                        <iframe
                            src={fileUrl}
                            title={file.file_name}
                            className="preview-text"
                        />
                    )}

                    {(fileCategory === 'archive' || fileCategory === 'other') && (
                        <div className="preview-unsupported">
                            <p>Preview not available for this file type</p>
                            <p>File type: {fileExtension}</p>
                        </div>
                    )}
                </div>

                <div className="file-preview-actions">
                    <button className="preview-download-btn" onClick={handleDownload}>
                        <FiDownload /> Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilePreview; 