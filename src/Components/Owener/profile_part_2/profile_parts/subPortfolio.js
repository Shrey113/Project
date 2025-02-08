import React, { useState, useEffect } from 'react';
import './subPortfolio.css';
import { Server_url,showWarningToast } from '../../../../redux/AllData';
import { useSelector } from 'react-redux';

import back_icon from './../../img/back.png'



function SubPortfolio({ Folder_name, folder_id, onBack }) {
  const user = useSelector(state => state.user);
  const [message, setMessage] = useState('');

  const [files, setFiles] = useState([]);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchFiles(folder_id);
  }, [folder_id]);

  const fetchFiles = async (id) => {
    try {
      const response = await fetch(`${Server_url}/owner/owner-folders/files/${id}`);
      const data = await response.json();
      if (response.ok) {
        setFiles(data);
      } else {
        setMessage('Error fetching files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setMessage('Error fetching files');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const processedFiles = await Promise.all(filePromises);

    try {
      const response = await fetch(`${Server_url}/owner/owner-folders/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_id,
          files: processedFiles.map(file => ({
            name: file.name,
            type: file.type,
            data: file.data
          }))
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Files uploaded successfully');
        fetchFiles(folder_id);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error uploading files');
      console.error('Upload error:', error);
    }
  };

  const handleDelete = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.file_id !== fileId));
  };

  const FileItem = ({ file, onDelete }) => {
   

    const handleDelete = async () => {
      if (!file.file_id) {
        showWarningToast({message: 'File ID is missing.'});
        return;
      }
      let confirm = window.confirm("Are you sure you want to delete this file?");
      if(!confirm){
        return;
      }

      try {
        const response = await fetch(`${Server_url}/owner/owner-folders-files/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_ids: [file.file_id],
            folder_id: folder_id,
            user_email: user.user_email
          }),
        });
    
        if (response.ok) {
          const data = await response.json();
          if (data.deletedCount > 0) {
            onDelete(file.file_id);
          } else {
            setMessage('No files were deleted.');
            console.error('No files were deleted.');
          }
        } else {
          const data = await response.json();
          console.error('Failed to delete file:', data.error);
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        setMessage('Error deleting file');
      }
    };
    

    return (
      <div key={file.file_id} className="file-item">
        <button 
          className="delete-btn_on_sub" 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          ×
        </button>
        <img src={file.file_data} alt={file.file_name} />
        <div className="file-info">
          <span>{file.file_name}</span>
          <span>{new Date(file.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  const handleAddClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className='sub-portfolio'>
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
          style={{ display: 'none' }}
        />
      </div>

      <div className="files-section">
        {files.length > 0 ? (
          files.map(file => (
            <FileItem 
              key={file.file_id} 
              file={file} 
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="no-files-messages">No files uploaded yet.</p>
        )}
      </div>

      {message && <p className="message">{message}</p>}

    </div>
  );
}

export default SubPortfolio;
