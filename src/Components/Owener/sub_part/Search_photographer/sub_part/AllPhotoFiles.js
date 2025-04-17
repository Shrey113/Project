import React, { useEffect, useState } from "react";
import "./AllPhotoFiles.css";
import { useParams } from "react-router-dom";
import { Server_url } from "../../../../../redux/AllData";
import socket from "./../../../../../redux/socket";
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudDownloadAlt } from "react-icons/fa";

function SkeletonLoader() {
  return (
    <div className="skeleton-loader-all-photos-container">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="skeleton-all-photos-loader"></div>
      ))}
    </div>
  );
}

function AllPhotoFiles() {
  const { owner_email } = useParams();
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);


  const [fullViewImage, setFullViewImage] = useState("");

  useEffect(() => {
    if (socket) {
      const onFolderCreated = async (folder) => {
        setFolders((prevFolders) => [...prevFolders, folder]);
      };

      socket.on(`New_folderCreated_${owner_email}`, onFolderCreated);

      return () => {
        socket.off(`New_folderCreated_${owner_email}`, onFolderCreated);
      };
    }
  }, [owner_email]);

  useEffect(() => {
    if (!socket) return;

    const onFolderDelete = (deletedFolderId) => {
      setFolders((prevFolders) => {
        if (prevFolders.length === 0) return prevFolders;

        const updatedFolders = prevFolders.filter((folder, index) => {
          return index === 0 || folder.folder_id !== Number(deletedFolderId);
        });
        return [...updatedFolders];
      });
    };

    socket.on(`folderDeleted_${owner_email}`, onFolderDelete);

    return () => {
      socket.off(`folderDeleted_${owner_email}`, onFolderDelete);
    };
  }, [owner_email]);
  useEffect(() => {
    if (fullViewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [fullViewImage]);

  const handleDownload = () => {
    if (fullViewImage) {
      const link = document.createElement("a");
      link.href = fullViewImage;
      link.download = fullViewImage.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // useEffect(() => {
  //   if (socket) {
  //     const onFolderDelete = (deletedFolderId) => {
  //       setFolders((prevFolders) =>
  //         prevFolders.filter((folder) => folder.folder_id !== deletedFolderId)
  //       );
  //     };
  //     socket.on(`Folder_Deleted_${owner_email}`, onFolderDelete);

  //     return () => {
  //       socket.off(`Folder_Deleted_${owner_email}`, onFolderDelete);
  //     };
  //   }
  // }, [owner_email]);

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${Server_url}/owner_drive/get_folder_preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: owner_email }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTimeout(() => {
          if (data.success) {
            setFolders(data.data);
            setActiveFolder(data.data[0]);
            setPhotos(data.data[0]?.photo_list || []);
          } else {
            setFolders([]);
            setPhotos([]);
          }
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error("Error fetching folder data:", error.message);
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [owner_email]);

  const handleFolderPhotoFetch = async (folder_id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${Server_url}/owner_drive/get_folder_photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id }),
        }
      );

      const data = await response.json();
      setTimeout(() => {
        setPhotos(data.photos && Array.isArray(data.photos) ? data.photos : []);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Error fetching folder photos:", error);
      setLoading(false);
    }
  };

  const handleTabSwitch = (folder, index) => {
    setActiveFolder(folder);
    if (index === 0) {
      setPhotos(folder.photo_list);
    } else {
      handleFolderPhotoFetch(folder.folder_id);
    }
  };


  useEffect(() => {
    if(fullViewImage){
      document.documentElement.style.overflow = "hidden";
    }else{
      document.documentElement.style.overflow = "auto";
    }
  }, [fullViewImage]);
  return (
    <div className="all_photos_and_folder_container">
      <div className="wrapper_folder_tabs">
        <div className="folder_tabs">
          {folders && folders?.map((folder, index) => (
            <button
              key={index}
              className={`folder_tab ${activeFolder?.folder_name === folder.folder_name ? "active" : ""}`}
              onClick={() => handleTabSwitch(folder, index)}
            >
              {folder.folder_name}
            </button>
          ))}
        </div>
        <div className="wrapper_folder_tabs_white"></div>
      </div>

      <div className="photo_container">
        {loading ? (
          <SkeletonLoader />
        ) : photos.length === 0 ? (
          <p>No photos found.</p>
        ) : (
          <div className="photos_grid">
            {photos.map((photoItem, index) => (
              <div key={index} className="photo_card">
                {activeFolder?.folder_name === "Portfolio" ? (
                  <img
                    src={`${Server_url}/owner/portfolio-image/${photoItem.photo_id}?t=${Date.now()}`}
                    alt={photoItem.photo_name}
                    className="photo_image"
                  onClick={(e) => {
                    setFullViewImage(e.target.src);
                  }}
                />
                ) : (
                  <img
                  src={`${Server_url}/owner/portfolio-image-file?path=${encodeURIComponent(photoItem.file_data)}`}
                  alt={photoItem.photo_name}
                  className="photo_image"
                  onClick={(e) => {
                    setFullViewImage(e.target.src);
                  }}
              />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {
        fullViewImage && (
          <div
            className="full_view_image_container"
            onClick={(e) => {
              if (e.target.classList.contains('full_view_image_container')) {
                setFullViewImage("");
              }
            }}
          >
            <div className="full_view_image_wrapper" >
              <div className="image_navigation">
                <button className="back_button" onClick={() => setFullViewImage("")}>
                  <IoCloseSharp className="back_icon" />
                </button>
              </div>

              <div className="image_content">
                  <img src={fullViewImage} className="full_view_image" alt="Full view" />
               
              </div>

              <div className="image_controls">
                <button
                  className="control_button download_button"
                  onClick={handleDownload}
                >
                  <FaCloudDownloadAlt className="button_icon" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default AllPhotoFiles;
