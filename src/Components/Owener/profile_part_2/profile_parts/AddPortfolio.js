import React, { useState, useEffect } from "react";
import "./AddPortfolio.css";
import { useSelector } from "react-redux";
import SubPortfolio from "./subPortfolio";

import {
  Server_url,
  showAcceptToast,
  showRejectToast,
  showWarningToast,
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
      // console.log(result);

      if (result.success) {
        setGalleryData(result.files || []);
      } else {
        console.log("Failed to fetch gallery data:", result.message);
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
      fetch_files(user.user_email);
      fetchGalleryData(user.user_email);
    }
  }, [user?.user_email]);

  // const handleFileUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setIsUploading(true);
  //     const reader = new FileReader();
  //     reader.onload = async () => {
  //       const base64Content = reader.result.split(',')[1];

  //       try {
  //         const response = await fetch(`${Server_url}/owner_drive/add_portfolio`, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             user_email: user.user_email,
  //             file_name: file.name,
  //             file_type: file.type,
  //             file_content: base64Content
  //           })
  //         });

  //         const result = await response.json();
  //         if (result.success) {
  //           fetch_files(user.user_email);
  //         } else {
  //           console.error('Upload failed:', result.message);
  //         }
  //       } catch (error) {
  //         console.error('Error uploading file:', error);
  //       } finally {
  //         setIsUploading(false);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

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
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result;

        if (!file) {
          showWarningToast({ message: "Please select an image to upload." });
          return;
        }

        try {
          const response = await fetch(`${Server_url}/api/upload-photo`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoData: base64Content,
              name: file.name,
              type: file.type,
              user_email: user.user_email,
            }),
          });

          const result = await response.json();

          if (result.success) {
            fetchGalleryData(user.user_email);

            // Update gallery or perform other actions after successful upload
          } else {
            showRejectToast({ message: "Failed to add photo to database" });
          }
        } catch (error) {
          console.error("Error uploading photo:", error);
          showRejectToast({
            message: "An error occurred while uploading the photo",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // const fetch_folders = async (user_email) => {
  //   try {
  //     const response = await fetch(`${Server_url}/owner/portfolio/folders/${user_email}`);
  //     const result = await response.json();
  //     setFolderData(result || []);
  //   } catch (error) {
  //     console.error('Error fetching folders:', error);
  //   }
  // };

  const handleDeleteClick = (item, type) => {
    setItemToDelete({
      item: item,
      type: type,
    });
    setShowDeleteConfirm(true);
  };

  // const handleDelete = async () => {
  //   if (itemToDelete.type === "folder") {
  //     console.log("folder details", itemToDelete.item);
  //     try {
  //       if (!itemToDelete) return;

  //       const folder_id = itemToDelete.item.folder_id;

  //       const response = await fetch(
  //         `${Server_url}/owner-folders/${folder_id}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             user_email: user.user_email,
  //           }),
  //         }
  //       );

  //       if (response.ok) {
  //         setGalleryData((prev) =>
  //           prev.filter((folder) => folder.folder_id !== folder_id)
  //         );
  //         showAcceptToast({ message: "Folder deleted successfully!" });
  //       } else {
  //         console.error("Failed to delete the folder");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting the folder:", error);
  //     } finally {
  //       setShowDeleteConfirm(false); // Hide delete confirmation modal
  //       setItemToDelete(null); // Reset the state
  //     }
  //   } else if (itemToDelete.type === "file") {
  //     try {
  //       if (!itemToDelete) return;

  //       const photo_id = itemToDelete.item.photo_id;

  //       const response = await fetch(`${Server_url}/owner_drive/delete-photo`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           user_email: user.user_email,
  //           photo_id: photo_id,
  //         }),
  //       });

  //       if (response.ok) {
  //         setGalleryData((prev) =>
  //           prev.filter((photo) => photo.photo_id !== photo_id)
  //         );
  //         showAcceptToast({ message: "Photo deleted successfully!" });
  //       } else {
  //         console.error("Failed to delete the photo");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting the photo:", error);
  //     } finally {
  //       setShowDeleteConfirm(false); // Hide the delete confirmation modal
  //       setItemToDelete(null); // Reset the itemToDelete state
  //     }
  //   }
  // };

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
      } else if (itemToDelete.type === "file") {
        console.log("Deleting file:", itemToDelete.item);

        const photo_id = itemToDelete.item.photo_id;

        const response = await fetch(`${Server_url}/owner_drive/delete-photo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.user_email,
            photo_id: photo_id,
          }),
        });

        if (response.ok) {
          setGalleryData((prev) =>
            prev.filter((photo) => photo.photo_id !== photo_id)
          );
          showAcceptToast({ message: "Photo deleted successfully!" });
        } else {
          const errorMessage = await response.text();
          console.error("Failed to delete the photo:", errorMessage);
        }
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setShowDeleteConfirm(false); // Hide confirmation modal
      setItemToDelete(null); // Reset the state
    }
  };

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
                {folderData.length > 0 ? (
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
                        {typeof folder.cover_page_base64 === "string" &&
                        folder.cover_page_base64.startsWith("data:image") ? (
                          <img
                            src={folder.cover_page_base64}
                            alt={folder.folder_name}
                          />
                        ) : (
                          <div className="folder-icon">📂</div>
                        )}
                      </div>
                      <div className="folder-info">
                        <span>{folder.folder_name}</span>
                        <span className="photo-count">
                          {folder.photo_count} items
                        </span>
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
                {galleryData.length > 0 ? (
                  galleryData.map((item, index) => (
                    <div key={index} className="gallery-item">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(item, "file")}
                      >
                        ×
                      </button>
                      <img
                        src={item.photo}
                        alt={item.photo_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = not_find_data;
                        }}
                      />
                      <div className="gallery-item-info">
                        <span>{item.name}</span>
                        <span>
                          {new Date(item.createdTime).toLocaleDateString()}
                        </span>
                      </div>
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
            <p>
              Are you sure you want to delete{" "}
              {itemToDelete?.type === "folder" ? "folder" : "file"} "
              {itemToDelete?.item?.folder_name || itemToDelete?.item?.name}"?
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
    </div>
  );
}

export default AddPortfolio;
