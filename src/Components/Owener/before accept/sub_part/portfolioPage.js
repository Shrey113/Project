import React, { useState, useEffect } from "react";
import "./portfolioPage.css";
import { Server_url,showAcceptToast } from "../../../../redux/AllData";
import { useSelector } from "react-redux";
import { MdDeleteOutline } from "react-icons/md";

function PortfolioPage({ setIs_Page3, setCurrentStep }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;
  const [error, setError] = useState("");

  const user = useSelector((state) => state.user);

  const handleSaveAndContinue = () => {
    if (images.length === MAX_IMAGES || images.length >= MIN_IMAGES) {
      setIs_Page3(true);
      setCurrentStep(4);
      showAcceptToast({message: "Portfolio added successfully" });
    }
  };
  const fetchImages = async (user_email) => {
    setLoading(true);
    setError("");
    
    if (!user_email) {
      console.log("No user email provided, skipping fetch");
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Fetching images for user: ${user_email}`);
      const response = await fetch(`${Server_url}/owner_drive/get_portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user_email,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`Retrieved ${data.files.length} images from server`);
        
        if (data.files.length === 0) {
          console.log("No portfolio images found for this user");
          setImages([]);
          setLoading(false);
          return;
        }
        
        const formattedImages = data.files.map((file) => {
          // Create proper URL for each image
          const imageUrl = file.photo.startsWith('/root/') 
            ? `${Server_url}/owner/portfolio-image/${file.photo_id}?t=${Date.now()}`
            : file.photo;
            
          console.log(`Image ID ${file.photo_id} URL: ${imageUrl.substring(0, 60)}...`);
          
          return {
            id: file.photo_id,
            url: imageUrl,
            name: file.photo_name,
            type: file.photo_type,
          };
        });
        
        setImages(formattedImages);
      } else {
        if (data.message && !data.message.includes("No portfolio")) {
          setError(data.message);
        } else {
          setImages([]);
        }
      }
    } catch (error) {
      console.error("Error fetching portfolio images:", error);
      if (!error.message.includes("No portfolio")) {
        setError("Failed to load images. Please refresh the page.");
      } else {
        setImages([]);
      }
    } finally {
      setLoading(false);
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

    // Show loading state
    setLoading(true);

    // Process each file with streaming instead of base64
    files.forEach(async (file) => {
      try {
        // Create preview for immediate display
        const objectUrl = URL.createObjectURL(file);
        
        // Add to UI immediately with a temporary ID for better UX
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setImages(prev => [...prev, { 
          id: tempId, 
          url: objectUrl, 
          name: file.name, 
          type: file.type,
          isUploading: true
        }]);
        
        // Upload using the specified endpoint
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

        if (data.success) {
          // Replace temp image with real one
          setImages(prev => prev.map(img => 
            img.id === tempId ? {
              id: data.photo_id,
              url: `${Server_url}/owner/portfolio-image/${data.photo_id}?t=${Date.now()}`,
              name: file.name,
              type: file.type,
              isUploading: false
            } : img
          ));
        } else {
          // Remove failed upload from UI
          setImages(prev => prev.filter(img => img.id !== tempId));
          setError(`Failed to upload ${file.name}. ${data.message || 'Please try again.'}`);
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        setError("Failed to upload image. Please try again.");
      }
    });
    
    // Fetch all images again after uploads are done
    setTimeout(() => fetchImages(user.user_email), 1000);
    
    // Clear input value to allow uploading the same file again
    event.target.value = '';
  };

  const removeImage = async (id) => {
    try {
      // Show loading state and reset error
      setLoading(true);
      setError("");
      
      console.log(`Attempting to delete image with ID: ${id}`);
      
      // Use the simplified delete-by-id endpoint
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
        // Remove from local state (though we'll refresh from server anyway)
        setImages((prevImages) => prevImages.filter((image) => image.id !== id));
        showAcceptToast({message: "Image deleted successfully"});
      } else {
        const errorMsg = data.message || "Failed to delete image";
        console.error(`Delete failed: ${errorMsg}`);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError(`Error deleting image: ${error.message}`);
    } finally {
      setLoading(false);
      // Refresh images list to ensure UI is in sync with server
      fetchImages(user.user_email);
    }
  };

  return (
    <div className="portfolio-container-before-accept">
      <h1>Add Portfolio</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="gallery">
        {loading ? (
          Array.from({ length: MAX_IMAGES }).map((_, index) => (
            <div key={`skeleton-${index}`} className="image-card skeleton">
              <div className="skeleton-image"></div>
            </div>
          ))
        ) : (
          <>
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <img 
                  src={image.url} 
                  alt={image.name} 
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.id}`);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlIG5vdCBsb2FkZWQ8L3RleHQ+PC9zdmc+';
                  }} 
                />
                <div className="image-overlay">
                  <button data-id={image.id} onClick={() => removeImage(image.id)}>
                    <MdDeleteOutline/>
                  </button>
                </div>
              </div>
            ))}

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
          </>
        )}
      </div>

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
