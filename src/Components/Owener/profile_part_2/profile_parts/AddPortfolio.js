import React, { useState, useEffect } from 'react';
import './AddPortfolio.css';
import { useSelector } from 'react-redux';
import SubPortfolio from './subPortfolio';

import { Server_url,get_img_src } from '../../../../redux/AllData';

import not_find_data from './../../img/not_find_data.jpg';

function AddPortfolio() {
  const user = useSelector((state) => state.user);

  const [galleryData, setGalleryData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [folderData, setFolderData] = useState([]);
  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCover, setFolderCover] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        
        try {
          const response = await fetch(`${Server_url}/owner_drive/add_portfolio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: user.user_email, 
              file_name: file.name,
              file_type: file.type,
              file_content: base64Content
            })
          });

          const result = await response.json();
          if (result.success) {
            fetch_files(user.user_email);
          } else {
            console.error('Upload failed:', result.message);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFolder = () => {
    setShowFolderPopup(true);
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch(`${Server_url}/owner/portfolio/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_name: newFolderName,
          user_email: user.user_email
        })
      });

      const result = await response.json();
      if (result.folder_id) {
        // Refresh the folders list
        fetch_folders(user.user_email);
        setShowFolderPopup(false);
        setNewFolderName('');
        setFolderCover(null);
      } else {
        console.error('Failed to create folder:', result.error);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleFolderCoverUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFolderCover(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetch_files = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner_drive/get_portfolio/${user_email}`);
      const result = await response.json();
      console.log(result);
      if(result.success){
        setGalleryData(result.files || []);
      }else{
        console.error('Failed to fetch portfolio:', result.message);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const fetch_folders = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner/portfolio/folders/${user_email}`);
      const result = await response.json();
      setFolderData(result || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    fetch_files(user.user_email);
    fetch_folders(user.user_email);
  }, [user.user_email]);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      if (!itemToDelete) return;

      if (itemToDelete.type === 'folder') {
        // Delete folder
        const response = await fetch(`${Server_url}/owner/portfolio/delete-folder/${itemToDelete.item.folder_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_email: user.user_email
          })
        });

        if (response.ok) {
          // Refresh folders list
          fetch_folders(user.user_email);
        } else {
          console.error('Failed to delete folder');
        }
      } else {
        // Delete file
        alert("Delete file form drive will not work for now");
        return;
        // const response = await fetch(`${Server_url}/owner/portfolio/delete-photos`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     photo_ids: [itemToDelete.item.id],
        //     user_email: user.user_email
        //   })
        // });

        // if (response.ok) {
        //   // Refresh files list
        //   fetch_files(user.user_email);
        // } else {
        //   console.error('Failed to delete file');
        // }


      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="AddPortfolio">
      
      <div className="media-stats">
        <span>
          <div onClick={() => setSelectedFolder(null)}>Portfolio</div>
          {selectedFolder && (
            <>
              {" > "}
              <span>{selectedFolder.folder_name}</span>
            </>
          )}
        </span>
        <div className="action-buttons">
          <label htmlFor="file-upload" className="add-btn_">
            Add Photo
          </label>
          <button onClick={handleCreateFolder} className="add-btn_">
            Create Folder
          </button>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFolder ? (
        <SubPortfolio Folder_name={selectedFolder.folder_name} folderData={selectedFolder} />
      ) : (
        <>
          <div className="portfolio-container">
            {/* Folders Section */}
            <div className="section-container">
              <h3 className="section-title">Folders</h3>
              <div className="folders-grid">
                {folderData.length > 0 ? (
                  folderData.map((folder) => (
                    <div
                      key={folder.id}
                      className="folder-item"
                      onClick={(e) => {
                        if (e.target.closest('.delete-btn')) return;
                        handleFolderClick(folder);
                      }}
                    >
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(folder, 'folder')}
                      >
                        ×
                      </button>
                      <div className="folder-cover">
                        {typeof folder.coverImage === 'string' && folder.coverImage.startsWith('data:image') ? (
                          <img src={folder.coverImage} alt={folder.folder_name} />
                        ) : (
                          <div className="folder-icon">📂</div>
                        )}
                      </div>
                      <div className="folder-info">
                        <span>{folder.folder_name}</span>
                        <span className="photo-count">{folder.photo_count} items</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='not-found-data'>No folders created yet. <span onClick={handleCreateFolder} style={{color: '#1E90FF', cursor: 'pointer'}}>Click to create</span></p>
                )}
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="section-container">
              <h3 className="section-title">Portfolio Images</h3>
              <div className="gallery-grid">
                {galleryData.length > 0 ? (
                  galleryData.map((item, index) => (
                    <div key={index} className="gallery-item">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClick(item, 'file')}
                      >
                        ×
                      </button>
                      <img 
                        src={get_img_src(item.id)} 
                        alt={item.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = not_find_data;
                        }}
                      />
                      <div className="gallery-item-info">
                        <span>{item.name}</span>
                        <span>{new Date(item.createdTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='not-found-data'>No portfolio items added yet. <label htmlFor="file-upload" style={{color: '#1E90FF', cursor: 'pointer'}}>Click to add</label></p>
                )}
              </div>
            </div>

            {/* Folder Creation Popup */}
            {showFolderPopup && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <form onSubmit={handleFolderSubmit}>
                    <h3>Create New Folder</h3>
                    
                    <div className="form-group">
                      <label className='text_left'>Folder Name:</label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className='text_left'>Folder Cover:</label>
                      <label htmlFor="cover-upload" className="cover-preview">
                        {folderCover ? (
                          <img src={folderCover} alt="Cover preview" />
                        ) : (
                          <div className="folder-icon-upload">
                            <span>📁</span>
                            <p>Click to upload cover image</p>
                          </div>
                        )}
                      </label>
                      <label htmlFor="cover-upload" className="cover-upload-btn">
                        Choose Cover Image
                      </label>

                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFolderCoverUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div className="popup-buttons">
                      <button type="submit">Create</button>
                      <button type="button" onClick={() => setShowFolderPopup(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </>
      )}

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

      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {itemToDelete?.type === 'folder' ? 'folder' : 'file'} "{itemToDelete?.item?.folder_name || itemToDelete?.item?.name}"?</p>
            <div className="popup-buttons">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button 
                className="delete-confirm-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPortfolio;
