import React, { useState, useEffect } from "react";
import "./subPortfolio.css";
import { Server_url, showWarningToast, FileLoaderToast } from "../../../../redux/AllData";
import { useSelector } from "react-redux";

import back_icon from "./../../img/back.png";

function SubPortfolio({ Folder_name, folder_id, onBack }) {
  const user = useSelector((state) => state.user);
  // const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, completed: 0 });
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  const [files, setFiles] = useState([]);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchFiles(folder_id);
  }, [folder_id]);

  const fetchFiles = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${Server_url}/owner/owner-folders/files/${id}`
      );
      const data = await response.json();
      if (response.ok) {
        setFiles(data);
      } else {
        // setMessage('Error fetching files');
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      // setMessage('Error fetching files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    setIsLoading(true);
    const selectedFiles = Array.from(event.target.files);
    
    console.log("Selected files:", selectedFiles.map(f => f.name));
    
    if (selectedFiles.length === 0) {
      setIsLoading(false);
      return;
    }

    // Initialize upload progress and show progress loader
    setUploadProgress({ total: selectedFiles.length, completed: 0 });
    setShowUploadProgress(true);

    const formData = new FormData();
    formData.append('folder_id', folder_id);
    formData.append('user_email', user.user_email);
    formData.append('folder_name', Folder_name);
    
    // Append each file to the FormData
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    // Log the form data (for debugging)
    console.log("Form data entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }

    // Create XHR request to track upload progress
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(`Upload progress: ${percentComplete}%`);
        
        // Update progress based on percentage of total upload
        // For multiple files, this shows overall upload progress
        const filesComplete = Math.floor((percentComplete / 100) * selectedFiles.length);
        setUploadProgress(prev => ({ 
          ...prev, 
          completed: filesComplete 
        }));
      }
    });

    // Setup promise to handle the XHR
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.open('POST', `${Server_url}/owner/owner-folders/upload-direct`, true);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(errorData);
          } catch (e) {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error occurred'));
      };
      
      // Send the form data
      xhr.send(formData);
    });

    try {
      console.log(`Uploading to ${Server_url}/owner/owner-folders/upload-direct`);
      
      const data = await uploadPromise;
      console.log("Upload response:", data);
      
      // Ensure progress shows all files completed
      setUploadProgress(prev => ({ ...prev, completed: prev.total }));
      
      // Wait a moment before hiding progress indicator
      setTimeout(() => {
        setShowUploadProgress(false);
        fetchFiles(folder_id);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setShowUploadProgress(false);
      showWarningToast({ message: error.error || error.message || 'Error uploading files' });
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = (fileId) => {
    console.log(`Removing file with ID ${fileId} from UI`);
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.file_id !== fileId)
    );
  };

  const FileItem = ({ file, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      if (!file.file_id) {
        showWarningToast({ message: "File ID is missing." });
        return;
      }
      let confirm = window.confirm(
        "Are you sure you want to delete this file?"
      );
      if (!confirm) {
        return;
      }

      setIsDeleting(true);

      try {
        const response = await fetch(
          `${Server_url}/owner/owner-folders-files/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_ids: [file.file_id],
              folder_id: folder_id,
              user_email: user.user_email,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Delete response:", data);
          
          if (data.deletedCount > 0) {
            onDelete(file.file_id);
            // Optional: show success message
            // showWarningToast({ message: "File deleted successfully" });
          } else {
            console.error("No files were deleted.");
            showWarningToast({ message: "Error: No files were deleted" });
          }
        } else {
          const data = await response.json();
          console.error("Failed to delete file:", data.error);
          showWarningToast({ message: data.error || "Error deleting file" });
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        showWarningToast({ message: "Network error while deleting file" });
      } finally {
        setIsDeleting(false);
      }
    };

    // Determine if the file_data is a base64 string or a file path
    const isBase64 = file.file_data && file.file_data.startsWith('data:');
    
    // For file paths, construct the URL to fetch the image
    let imageUrl;
    if (isBase64) {
      imageUrl = file.file_data;
    } else {
      // Get full path to the image file on the server
      imageUrl = `${Server_url}/owner/portfolio-image-file?path=${encodeURIComponent(file.file_data)}`;
    }

    return (
      <div key={file.file_id} className="file-item">
        <button
          className={`delete-btn_on_sub ${isDeleting ? 'deleting' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDeleting) handleDelete();
          }}
          disabled={isDeleting}
        >
          {isDeleting ? '...' : '×'}
        </button>
        <img src={imageUrl} alt={file.file_name} />
      </div>
    );
  };

  const handleAddClick = () => {
    fileInputRef.current.click();
  };

  const SkeletonLoader = () => {
    return Array(6)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-info">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      ));
  };

  return (
    <div className="sub-portfolio">
      {showUploadProgress && <FileLoaderToast uploadProgress={uploadProgress} />}
      
      <div className="portfolio-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <img src={back_icon} alt="back" />
          </button>
          <h2>{Folder_name}</h2>
        </div>
        <button className="add-files-btn" onClick={handleAddClick}>
          <span>+</span> Add Files
        </button>
      </div>

      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          accept="image/*,video/*,application/pdf"
          style={{ display: "none" }}
        />
      </div>

      <div className="files-section">
        {isLoading ? (
          <SkeletonLoader />
        ) : files.length > 0 ? (
          files.map((file) => (
            <FileItem key={file.file_id} file={file} onDelete={handleDelete} />
          ))
        ) : (
          <p className="no-files-messages">No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default SubPortfolio;
