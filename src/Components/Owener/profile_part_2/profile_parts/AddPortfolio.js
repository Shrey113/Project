import React, { useState, useEffect } from "react";
import "./AddPortfolio.css";
import { useSelector } from "react-redux";
import SubPortfolio from "./subPortfolio";

import {
  Server_url,
  showAcceptToast,
  showRejectToast,
  showWarningToast,
  ConfirmMessage,
  FileLoaderToast
} from "../../../../redux/AllData";

import not_find_data from "./../../img/not_find_data.jpg";

function AddPortfolio() {
  const user = useSelector((state) => state.user);

  const [galleryData, setGalleryData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [folderData, setFolderData] = useState([]);
  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderCover, setFolderCover] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, completed: 0 });
  const [showImageDeleteConfirm, setShowImageDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const fetchGalleryData = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner_drive/get_portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }), // Send email in the body
      });

      const result = await response.json();
      console.log(result);

      if (result.success) {
        setGalleryData(result.files || []);
      } else {
        console.error("Failed to fetch gallery data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    }
  };
  const fetch_files = async (user_email) => {
    try {
      const response = await fetch(
        `${Server_url}/owner/owner-folders/${user_email}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      setFolderData(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    if (user?.user_email) {
      setIsLoading(true);
      Promise.all([
        fetch_files(user.user_email),
        fetchGalleryData(user.user_email)
      ]).then(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      });
    }
  }, [user?.user_email]);

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    if (!newFolderName.trim()) {
      setIsUploading(false);
      showWarningToast({ message: "Please enter a folder name" });
      return;
    }

    try {
      const response = await fetch(`${Server_url}/owner/owner-folders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder_name: newFolderName,
          user_email: user.user_email,
          cover_page_base64: folderCover,
        }),
      });

      const data = await response.json();

      if (data.message === "Folder created successfully.") {
        // Reset form and close popup
        setNewFolderName("");
        setFolderCover(null);
        setShowFolderPopup(false);

        // Refresh the folders list
        const fetchFoldersResponse = await fetch(
          `${Server_url}/owner/owner-folders/${user.user_email}`
        );
        const foldersData = await fetchFoldersResponse.json();
        setFolderData(foldersData);
      } else {
        showRejectToast({ message: data.error || "Failed to create folder" });
      }
      setIsUploading(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      showRejectToast({
        message: "Failed to create folder. Please try again.",
      });
      setIsUploading(false);
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

  const handleAddToGallery = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      showWarningToast({ message: "Please select an image to upload." });
      return;
    }

    // Show loading state with total count of files
    setIsUploading(true);
    setUploadProgress({ total: files.length, completed: 0 });

    // Process each file using direct streaming instead of base64
    const uploadPromises = files.map(async (file) => {
      try {
        // Create preview for immediate display
        const objectUrl = URL.createObjectURL(file);
        
        // Add to UI immediately with a temporary ID for better UX
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setGalleryData(prev => [...prev, { 
          photo_id: tempId, 
          photo: objectUrl, 
          photo_name: file.name, 
          photo_type: file.type,
          isUploading: true
        }]);
        
        // Upload using the improved endpoint
        const response = await fetch(`${Server_url}/owner/api/upload-photo`, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "x-user-email": user.user_email,
            "x-file-name": file.name
          },
          body: file // Stream the file directly
        });

        const data = await response.json();

        // Update progress counter
        setUploadProgress(prev => ({ ...prev, completed: prev.completed + 1 }));

        if (data.success) {
          // Replace temp image with real one
          setGalleryData(prev => prev.map(img => 
            img.photo_id === tempId ? {
              photo_id: data.photo_id,
              photo: `${Server_url}/owner/portfolio-image/${data.photo_id}?t=${Date.now()}`,
              photo_name: file.name,
              photo_type: file.type,
              isUploading: false
            } : img
          ));
          return { success: true };
        } else {
          // Remove failed upload from UI
          setGalleryData(prev => prev.filter(img => img.photo_id !== tempId));
          showRejectToast({ message: `Failed to upload ${file.name}. ${data.message || 'Please try again.'}` });
          return { success: false, error: data.message };
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        showRejectToast({
          message: "An error occurred while uploading the photo",
        });
        // Update progress even for errors
        setUploadProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        return { success: false, error: error.message };
      }
    });
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Show a single success toast with count instead of multiple toasts
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      showAcceptToast({ 
        message: `Successfully uploaded ${successCount} ${successCount === 1 ? 'image' : 'images'}` 
      });
    }
    
    // Fetch all images again after uploads are done
    fetchGalleryData(user.user_email);
    
    // Clear the loading state after a short delay to ensure smooth transition
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress({ total: 0, completed: 0 });
    }, 500);
    
    // Clear input value to allow uploading the same file again
    event.target.value = '';
  };

  const handleDeleteClick = (item, type) => {
    if (type === "folder") {
      setItemToDelete({
        item: item,
        type: type,
      });
      setShowDeleteConfirm(true);
    } else if (type === "file") {
      // Set the image to delete and show confirmation
      setImageToDelete(item);
      setShowImageDeleteConfirm(true);
    }
  };

  const removeImage = async (id) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      console.log(`Attempting to delete image with ID: ${id}`);
      
      // Use the improved delete-by-id endpoint
      const response = await fetch(`${Server_url}/owner/api/delete-photo-by-id/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": user.user_email
        }
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (data.success) {
        console.log(`Successfully deleted image ID: ${id}`);
        // Remove from local state
        setGalleryData((prevImages) => prevImages.filter((image) => image.photo_id !== id));
        showAcceptToast({ message: "Image deleted successfully" });
      } else {
        const errorMsg = data.message || "Failed to delete image";
        console.error(`Delete failed: ${errorMsg}`);
        showRejectToast({ message: errorMsg });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      showRejectToast({ message: `Error deleting image: ${error.message}` });
    } finally {
      setIsLoading(false);
      // Refresh images to ensure UI is in sync with server
      fetchGalleryData(user.user_email);
    }
  };

  const handleConfirmImageDelete = () => {
    if (imageToDelete) {
      removeImage(imageToDelete.photo_id);
      setImageToDelete(null);
      setShowImageDeleteConfirm(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "folder") {
        console.log("Deleting folder:", itemToDelete.item);

        const folder_id = itemToDelete.item.folder_id;

        const response = await fetch(
          `${Server_url}/owner/owner-folders/${folder_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: user.user_email,
            }),
          }
        );

        if (response.ok) {
          fetch_files(user.user_email);
          showAcceptToast({ message: "Folder deleted successfully!" });
        } else {
          const errorMessage = await response.text();
          console.error("Failed to delete the folder:", errorMessage);
        }
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setShowDeleteConfirm(false); // Hide confirmation modal
      setItemToDelete(null); // Reset the state
    }
  };

  // Add skeleton loader components
  const FolderSkeleton = () => (
    <div className="folder-item skeleton">
      <div className="folder-cover skeleton-image"></div>
      <div className="folder-info">
        <div className="skeleton-text"></div>
        <div className="skeleton-text" style={{ width: '60%' }}></div>
      </div>
    </div>
  );

  const GallerySkeleton = () => (
    <div className="gallery-item skeleton">
      <div className="skeleton-image"></div>
      <div className="gallery-item-info">
        <div className="skeleton-text"></div>
        <div className="skeleton-text" style={{ width: '40%' }}></div>
      </div>
    </div>
  );

  return (
    <div className="AddPortfolio">

      {!selectedFolder && (
        <div className="media-stats">
          <span>
            <div onClick={() => setSelectedFolder(null)}>Portfolio</div>
          </span>

          <div className="action-buttons">
            <button
              onClick={() => document.getElementById("photo-upload").click()}
              className="add-btn_"
            >
              Add Photos
            </button>
            <button
              onClick={() => setShowFolderPopup(true)}
              className="add-btn_"
            >
              Create Folder
            </button>
          </div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddToGallery}
            style={{ display: "none" }}
          />
        </div>
      )}

      {selectedFolder ? (
        <SubPortfolio
          Folder_name={selectedFolder.folder_name}
          folder_id={selectedFolder.folder_id}
          user_email={user.user_email}
          onBack={() => setSelectedFolder(null)}
        />
      ) : (
        <>
          <div className="portfolio-container">
            {/* Folders Section */}
            <div className="section-container">
              <h3 className="section-title">Folders</h3>
              <div className="folders-grid">
                {isLoading ? (
                  // Show 3 folder skeletons while loading
                  [...Array(3)].map((_, index) => (
                    <FolderSkeleton key={`folder-skeleton-${index}`} />
                  ))
                ) : folderData.length > 0 ? (
                  folderData.map((folder, index) => (
                    <div
                      key={index}
                      className="folder-item"
                      onClick={(e) => {
                        if (e.target.closest(".delete-btn")) return;
                        setSelectedFolder(folder);
                      }}
                    >
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(folder, "folder")}
                      >
                        ×
                      </button>
                      <div className="folder-cover">
                        {folder.cover_page_base64 ? (
                          typeof folder.cover_page_base64 === "string" &&
                          folder.cover_page_base64.startsWith("data:image") ? (
                            <img
                              src={folder.cover_page_base64}
                              alt={folder.folder_name}
                            />
                          ) : (
                            <img
                              src={`${Server_url}/owner/portfolio-image/folder-thumbnail/${folder.cover_page_base64}`}
                              alt={folder.folder_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = not_find_data;
                              }}
                            />
                          )
                        ) : (
                          <div className="folder-icon">📂</div>
                        )}
                      </div>
                      <div className="folder-info">
                        <span>{folder.folder_name}</span>
                        {/* <span className="photo-count">
                          {folder.photo_count} items
                        </span> */}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="not-found-data">
                    No folders created yet.{" "}
                    <span
                      onClick={() => setShowFolderPopup(true)}
                      style={{ color: "#1E90FF", cursor: "pointer" }}
                    >
                      Click to create
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="section-container">
              <h3 className="section-title">Portfolio Images</h3>
              <div className="gallery-grid">
                {isLoading ? (
                  // Show 6 gallery skeletons while loading
                  [...Array(6)].map((_, index) => (
                    <GallerySkeleton key={`gallery-skeleton-${index}`} />
                  ))
                ) : galleryData.length > 0 ? (
                  galleryData.map((item, index) => (
                    <div key={index} className="gallery-item">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(item, "file")}
                      >
                        ×
                      </button>
                      <img
                        src={`${Server_url}/owner/portfolio-image/${item.photo_id}?t=${Date.now()}`}
                        alt={item.photo_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = not_find_data;
                        }}
                      />
                      {/* <div className="gallery-item-info">
                        <span>{item.name}</span>
                        <span>
                          {new Date(item.createdTime).toLocaleDateString()}
                        </span>
                      </div> */}
                    </div>
                  ))
                ) : (
                  <p className="not-found-data">
                    No portfolio items added yet.{" "}
                    <span
                      onClick={() => {
                        document.getElementById("photo-upload").click();
                      }}
                      style={{ color: "#1E90FF", cursor: "pointer" }}
                    >
                      Click to adds
                    </span>
                  </p>
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
                      <label className="text_left">Folder Name:</label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="text_left">Folder Cover:</label>
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
                      <label
                        htmlFor="cover-upload"
                        className="cover-upload-btn"
                      >
                        Choose Cover Image
                      </label>

                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFolderCoverUpload}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div className="popup-buttons">
                      <button type="submit">Create</button>
                      <button
                        type="button"
                        onClick={() => setShowFolderPopup(false)}
                      >
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
        <FileLoaderToast uploadProgress={uploadProgress} />
      )}

      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete folder "
              {itemToDelete?.item?.folder_name}"?
            </p>
            <div className="popup-buttons">
              <button onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Delete Confirmation using ConfirmMessage component */}
      {showImageDeleteConfirm && imageToDelete && (
        <ConfirmMessage
          message_title="Delete Image"
          message={`Are you sure you want to delete this image?`}
          onCancel={() => setShowImageDeleteConfirm(false)}
          onConfirm={handleConfirmImageDelete}
          button_text="Delete"
        />
      )}
    </div>
  );
}

export default AddPortfolio;
