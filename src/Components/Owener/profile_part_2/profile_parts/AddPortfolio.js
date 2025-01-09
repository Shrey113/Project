import React, { useState } from 'react';
import './AddPortfolio.css';

import img_1 from './test_privew/set_prive_img_5.jpg';
import img_2 from './test_privew/set_prive_img_6.jpg';
import img_3 from './test_privew/set_prive_img_3.png';
import img_4 from './test_privew/set_prive_img_4.jpg';

function AddPortfolio() {
  const [galleryData, setGalleryData] = useState([
    {
      id: 1,
      type: 'video',
      imageUrl: img_1,
      views: '1,342,432',
      title: "Jelena's showreel",
    },
    {
      id: 2,
      type: 'video',
      imageUrl: img_2,
      views: '892,123',
      title: 'Dance Performance',
    },
    {
      id: 3,
      type: 'photo',
      imageUrl: img_3,
      views: '567,890',
      title: 'Studio Portrait',
    },
    {
      id: 4,
      type: 'video',
      imageUrl: img_1,
      views: '892,123',
      title: 'Dance Performance',
    },
    {
      id: 5,
      type: 'photo',
      imageUrl: img_1,
      views: '567,890',
      title: 'Studio Portrait',
    },
    {
      id: 6,
      type: 'photo',
      imageUrl: img_4,
      views: '567,890',
      title: 'Studio Portrait',
    },
  ]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newItem = {
        id: galleryData.length + 1, // Generate a new ID
        type: file.type.startsWith('image/') ? 'photo' : 'video', // Determine type
        imageUrl: URL.createObjectURL(file), // Create a temporary URL for the file
        views: '0', // Default views
        title: file.name, // Use the file name as the title
      };

      setGalleryData((prevData) => [...prevData, newItem]);
    }
  };

  return (
    <div className="AddPortfolio">
      
      <div className="media-stats">
        <span>Portfolio</span>
        <label htmlFor="file-upload" className="add-btn_" >
          Add More
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="gallery-grid">
        {galleryData.map((item) => (
          <div key={item.id} className={`gallery-item ${item.type}`}>
            <img src={item.imageUrl} alt={item.title} />
            <div className="gallery-item-info">
              <span>{item.views}</span>
              <span>{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddPortfolio;
