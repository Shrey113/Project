import React, { useState } from 'react';
import "./portfolioPage.css";

function PortfolioPage({setIs_Page3, setCurrentStep}) {
  const [images, setImages] = useState([]);
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;
  const [error, setError] = useState('');

  const handleSaveAndContinue = () => {
    if(images.length !== MAX_IMAGES){
      setIs_Page3(true);
      setCurrentStep(4);
    }
};

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    setError('');

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images. You currently have ${images.length} images.`);
      return;
    }

    const newImages = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const uniqueId = `${Date.now()}-${index}`;
        
        newImages.push({
          id: uniqueId,
          url: e.target.result,
          name: file.name
        });

        loadedCount++;

        if (loadedCount === files.length) {
          setImages(prevImages => [...prevImages, ...newImages]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prevImages => prevImages.filter(image => image.id !== id));
    setError('');
  };

  return (
    <div className="portfolio-container">
      <h1>Add Portfolio</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="gallery">
        {images.map(image => (
          <div key={image.id} className="image-card">
            <img src={image.url} alt={image.name} />
            <div className="image-overlay">
              <p>{image.name}</p>
              <button 
                data-id={image.id}
                onClick={() => removeImage(image.id)}
              >
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
            className={`next-page-button ${images.length < MIN_IMAGES ? 'disabled' : ''}`}
            disabled={images.length < MIN_IMAGES}
            onClick={handleSaveAndContinue}
          >
            {images.length >= MIN_IMAGES ? 
              (images.length === MAX_IMAGES ? 'Continue to Next Step' : 'Save and Continue') : 
              `Add ${MIN_IMAGES - images.length} More Image${MIN_IMAGES - images.length === 1 ? '' : 's'} to Continue`
            }
          </button>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
