import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiX } from 'react-icons/fi';
import './DriveStyles.css';
import { Server_url } from '../../../../redux/AllData';

const FilePreview = ({ file, onClose }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Get file type category
    const getFileCategory = (fileType) => {
        const type = fileType.toLowerCase().replace('.', '');
        for (const [category, extensions] of Object.entries(supportedFormats)) {
            if (extensions.includes(type)) {
                return category;
            }
        }
        return 'other';
    };

    useEffect(() => {
        const fetchFileForPreview = async () => {
            try {
                setLoading(true);
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
            fetchFileForPreview();
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

    if (loading) {
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
                        <h3>{file.file_name}</h3>
                        <button className="preview-close-btn" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>
                    <div className="file-preview-error">{error}</div>
                    <div className="file-preview-actions">
                        <button className="preview-download-btn" onClick={handleDownload}>
                            <FiDownload /> Download
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const fileCategory = getFileCategory(file.file_type);

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
                            <source src={fileUrl} type={`video/${file.file_type.toLowerCase()}`} />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {fileCategory === 'audio' && (
                        <audio controls className="preview-audio">
                            <source src={fileUrl} type={`audio/${file.file_type.toLowerCase()}`} />
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
                            <p>File type: {file.file_type}</p>
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