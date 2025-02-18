import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Server_url } from '../../../../redux/AllData';

import './test_data.css';
import not_find_data from './../../img/not_find_data.jpg';

function Uploadfile() {
  const user = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(null);

  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${Server_url}/owner_drive/get-files/${user.user_email}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Content = reader.result.split(',')[1];
      const payload = {
        user_email: user.user_email,
        file_name: file.name,
        file_type: file.type,
        file_content: base64Content,
      };

      try {
        const response = await fetch(`${Server_url}/owner_drive/upload-file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
        fetchUserFiles();
        setFile(null);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      alert('Failed to read file');
    };

    reader.readAsDataURL(file); // Convert the file to Base64
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  function get_img_src(id) {  
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
}

  return (
    <div className="upload-container">
      <div className="upload-area">
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Choose a file or drag it here</span>
        </label>
        
        {file && (
          <div className="selected-file">
            <div className="file-preview">
              <span className="file-name">{file.name}</span>
              <button 
                className="remove-file" 
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                  document.getElementById('file-input').value = '';
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpload}
          className="upload-button"
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
      {isUploading && (
        <div className="upload-overlay">
            <div className="loader-container">
            <svg viewBox="25 25 50 50">
              <circle r="20" cy="50" cx="50"></circle>
            </svg>
                <p>Uploading your file, please wait...</p>
            </div>
        </div>
      )}

      <div className="upload_file_container">
        <div className="title">User Folder: {user.user_email}</div>
        <button onClick={fetchUserFiles}>Fetch Files</button>
        <div className="upload_file_list">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="file-item skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-name"></div>
                <div className="skeleton-info">
                  <div className="skeleton-type"></div>
                  <div className="skeleton-date"></div>
                </div>
              </div>
            ))
          ) : (
            files.map((file, index) => (
              <div key={index} className="file-item">
                <img 
                  src={get_img_src(file.id)} 
                  alt={file.name || "No Name"} 
                  onClick={() => handleImageClick(get_img_src(file.id))}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = not_find_data;
                  }}
                />
                <div className="file-name">{file.name || "No Name"}</div>
                <div className="file-info">
                  <span>{file.mimeType || "No Type"}</span>
                  <span>{new Date(file.createdTime).toLocaleDateString() || "No Date"}</span>
                </div>   
              </div>
            ))
          )}
        </div>

        <iframe src={`https://drive.usercontent.google.com/download?id=1mOEzQl8Hy1TYfW-ch8gzqqnaIUvU9-OP`} title="Portfolio" height="fit-content" width="100%" />


        {/* <img src="" alt="sssssssss" /> */}


        <img 
  src="https://drive.google.com/thumbnail?id=1mOEzQl8Hy1TYfW-ch8gzqqnaIUvU9-OP" 
  alt="sssswwssssss" 
/>

      </div>

      {selectedImage && (
        <div className="fullscreen-preview" onClick={handleClosePreview}>
          <button className="close-button" onClick={handleClosePreview}>
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Full-screen preview" 
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = not_find_data;
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Uploadfile;


