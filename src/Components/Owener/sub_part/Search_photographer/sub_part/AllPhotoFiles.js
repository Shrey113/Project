import React, { useEffect, useState } from "react";
import "./AllPhotoFiles.css";
import { useParams } from "react-router-dom";
import { Server_url } from "../../../../../redux/AllData";
// import { useSelector } from "react-redux";

function AllPhotoFiles() {
  const { owner_email } = useParams();
  //   const user = useSelector((state) => state.user);
  const [photo, setPhotos] = useState([]);
  const [folder_data, set_folder_data] = useState([]);

  useEffect(() => {
    const fetchPhotos = async (owner_email) => {
      try {
        const response = await fetch(
          `${Server_url}/owner_drive/get_portfolio`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: owner_email,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.log("error", data);
        }
        console.log("all the photos from database", data.files);
        setPhotos(data.files);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPhotos(owner_email);
  }, [owner_email]);

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const response = await fetch(
          `${Server_url}/owner_drive/get_folder_images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: owner_email,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("All folder data: ", data);

        if (data.folders) {
          set_folder_data(data.folders); // Set the folder data in state
        } else {
          console.warn("No folders found.");
          set_folder_data([]); // Set an empty array if no folders are found
        }
      } catch (error) {
        console.error("Error fetching folder data:", error.message);
      }
    };
    fetchFolderData();
  }, [owner_email]);

  return (
    <div className="all_photos_container">
      <h2>All Photos</h2>
      {photo.length === 0 ? (
        <p>No photos found.</p>
      ) : (
        <div className="photos_grid">
          {photo &&
            photo.length > 0 &&
            photo?.map((photo, index) => (
              <div key={index} className="photo_card">
                <img
                  src={photo.photo}
                  alt={` ${index}`}
                  key={index}
                  className="photo_image"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default AllPhotoFiles;
