import React, { useState, useEffect } from "react";
import "./portfolioPage.css";
import { Server_url } from "../../../../redux/AllData";
import { useSelector } from "react-redux";

function PortfolioPage({ setIs_Page3, setCurrentStep }) {
  const [images, setImages] = useState([]);
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;
  const [error, setError] = useState("");

  const user = useSelector((state) => state.user);

  const handleSaveAndContinue = () => {
    if (images.length === MAX_IMAGES || images.length >= MIN_IMAGES) {
      setIs_Page3(true);
      setCurrentStep(4);
    }
  };
  const fetchImages = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner_drive/get_portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user_email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const formattedImages = data.files.map((file) => ({
          id: file.photo_id,
          url: file.photo,
          name: file.photo_name,
          type: file.photo_type,
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      console.error("Error fetching portfolio images:", error);
      setError("Failed to load existing images.");
    }
  };
  useEffect(() => {
    fetchImages(user.user_email);
  }, [user.user_email]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    setError("");

    if (images.length + files.length > MAX_IMAGES) {
      setError(
        `You can only upload up to ${MAX_IMAGES} images. You currently have ${images.length} images.`
      );
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const photoData = e.target.result;

        try {
          // Upload to server
          const response = await fetch(`${Server_url}/api/upload-photo`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoData,
              name: file.name,
              type: file.type,
              user_email: user.user_email,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Add to local state with the ID from server
            setImages((prevImages) => [
              ...prevImages,
              {
                id: data.photo_id, // Use ID from server
                url: photoData,
                name: file.name,
                type: file.type,
              },
            ]);
            fetchImages(user.user_email);
          } else {
            console.error("Failed to upload photo:", data.message);
            setError("Failed to upload image. Please try again.");
          }
        } catch (error) {
          console.error("Error uploading photo:", error);
          setError("Failed to upload image. Please try again.");
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = async (id) => {
    try {
      // Call the server endpoint to delete the photo
      const response = await fetch(`${Server_url}/owner_drive/delete-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.user_email,
          photo_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImages((prevImages) =>
          prevImages.filter((image) => image.id !== id)
        );
        setError("");
      } else {
        // Handle error cases
        setError(data.error || "Failed to delete image");
        console.error("Failed to delete image:", data.error);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="portfolio-container-before-accept">
      <h1>Add Portfolio</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="gallery">
        {images.map((image) => (
          <div key={image.id} className="image-card">
            <img src={image.url} alt={image.name} />
            <div className="image-overlay">
              <p>{image.name}</p>
              <button data-id={image.id} onClick={() => removeImage(image.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add Image Button Card */}
        {images.length < MAX_IMAGES && (
          <label htmlFor="file-upload" className="add-image-card">
            <div className="add-image-content">
              <span className="plus-icon">+</span>
              <span className="add-text">Add Image</span>
              <span className="image-count">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>

      {/* Next Page Button */}
      {images.length > 0 && (
        <div className="next-page-section">
          <button
            className={`next-page-button ${
              images.length < MIN_IMAGES ? "disabled" : ""
            }`}
            disabled={images.length < MIN_IMAGES}
            onClick={handleSaveAndContinue}
          >
            {images.length >= MIN_IMAGES
              ? images.length === MAX_IMAGES
                ? "Continue to Next Step"
                : "Save and Continue"
              : `Add ${MIN_IMAGES - images.length} More Image${
                  MIN_IMAGES - images.length === 1 ? "" : "s"
                } to Continue`}
          </button>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
