import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';

const Drive = () => {
    const [previewFile, setPreviewFile] = useState(null);

    // Handle file preview
    const handleFilePreview = (file) => {
        setPreviewFile(file);
    };

    // Close file preview
    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div className="drive-container">
            <div className="file-list">
                {previewFile && (
                    <FilePreview
                        file={previewFile}
                        onClose={closePreview}
                    />
                )}
            </div>
        </div>
    );
};

export default Drive; 