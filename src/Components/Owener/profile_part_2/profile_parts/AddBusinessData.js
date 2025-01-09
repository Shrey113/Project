import React, { useState } from 'react'
import './AddProfileData2.css'
import { FaCamera } from 'react-icons/fa'

// import edit_icon from './../../img/pencil.png'



function AddBusinessData() {

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [otherServiceDescription, setOtherServiceDescription] = useState('');
  const [customServices, setCustomServices] = useState([]);

  const [profileImage, setProfileImage] = useState(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
  };


  const handleAddCustomService = () => {
    if (otherServiceDescription.trim()) {
      setCustomServices(prev => [...prev, otherServiceDescription.trim()]);
      setOtherServiceDescription('');
    }
  };


  const removeCustomService = (index, isSelectedType = false) => {
    if (isSelectedType) {
      setSelectedTypes(prev => prev.filter((_, i) => i !== index));
    } else {
      setCustomServices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddCustomService();
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setOtherServiceDescription(inputValue);

    const filtered = photography_services.filter(service =>
      service.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(inputValue.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!selectedTypes.includes(suggestion)) {
      setSelectedTypes(prevTypes => [...prevTypes, suggestion]);
      setOtherServiceDescription('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputBlur = (e) => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const photography_services = [
    'aesthetic photography',
    'Portrait Photography',
    'Landscape Photography',
    'Event Photography',
    'Architectural Photography',
    'Fashion Photography',
    'Wildlife Photography',
    'Sports Photography',
    'Aerial Photography',
    'Wedding Photography',
    'Product Photography',
    'Macro Photography',
    'Food Photography',
    'Travel Photography',
    'Documentary Photography',
    'Black and White Photography',
    'Street Photography',
    'Underwater Photography',
    'Astrophotography',
    'Fine Art Photography',
    'Real Estate Photography',
    'Medical Photography',
    'Commercial Photography',
    'Boudoir Photography',
    'Adventure Photography',
    'Action Photography',
    'Time-Lapse Photography',
    'Still Life Photography',
    'Photojournalism',
    'Advertising Photography',
    'Candid Photography',
    'Drone Photography',
    'Equestrian Photography',
    'Headshot Photography',
    'Family Photography',
    'Pet Photography',
    'Night Photography',
    'Industrial Photography',
    'Concert Photography',
    'Nature Photography',
    'Fashion Editorial Photography',
    'Branding Photography',
    'Lifestyle Photography',
    'E-commerce Photography',
    'Underwater Wildlife Photography',
    'Scientific Photography',
    'Stock Photography',
    'Vintage Photography',
    'Abstract Photography',
    'Corporate Photography',
    'Medical Equipment Photography',
    'Museum and Artifact Photography',
    'Cultural Heritage Photography',
    'Car Photography',
    'Marine Photography',
    'Infant and Newborn Photography',
    'Maternity Photography',
    'Engagement Photography',
    'Proposal Photography',
    'Seasonal Photography (e.g., Autumn, Winter)',
    'Cinematic Photography',
    '3D Photography',
    'Thermal Imaging Photography',
    'Editorial Photography',
    'Prom Photography',
    'Graduation Photography',
    'Fashion Runway Photography',
    'Gym and Fitness Photography',
    'Self-Portrait Photography',
    'Surveillance Photography',
    'Illustrative Photography',
    'Glamour Photography',
    'Scenic Photography',
    'Minimalist Photography',
    'Conceptual Photography',
    'Monochrome Photography',
    'Film Photography',
    'Retro Photography',
    'Bokeh Photography',
    'Architectural Detail Photography',
    'Paparazzi Photography',
    'Street Vendor Photography',
    'Social Media Content Photography',
    'Charity Event Photography',
    'VR and 360° Photography',
    'Science Fiction Photography',
    'Park and Garden Photography',
    'Culinary Art Photography',
    'Performance Photography',
    'Photo Restoration Services',
    'Digital Manipulation Photography',
    'Exhibition Photography',
    'Advertising Campaign Photography',
    'Annual Report Photography',
    'Aviation Photography',
    'Art Reproduction Photography',
    'Tattoo Photography',
    'Event Highlight Photography',
    'Experimental Photography',
    'Environmental Portraits',
    'Cosplay Photography',
    'Festival Photography',
    'Hospitality Photography',
    'Insurance Claim Photography',
    'Custom Album Design Services',
    'Virtual Tour Photography'
  ];
  
 

  return (
    <div className="profile-container" id='AddBusinessDataPopup'>
      <div className="profile-header">
        <h2>Business Information</h2>
      </div>

        <div className="profile-avatar-container">
            <div className="profile-avatar">
                {profileImage ? (
                    <>
                        <img src={profileImage} alt="Profile" />
                        <div className="camera-overlay">
                            <FaCamera className="camera-icon" />
                        </div>
                    </>
                ) : (
                    <>
                        <span>B</span>
                        <label htmlFor="profile-image-input" className="camera-overlay">
                            <FaCamera className="camera-icon" />
                        </label>
                    </>
                )}
            </div>
            <div className="profile-actions">
                <label htmlFor="profile-image-input" className="upload-btn">
                    Upload business logo
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="profile-image-input"
                    />
                </label>
                <button 
                    className="delete-btn"
                    onClick={handleDeleteImage}
                >
                    Delete avatar
                </button>
            </div>
        </div>

      <form>


      <div className="form-group_for_2_inputs">
      <div className="inputs-group">
          <label>Business Name</label>
          <input type="text" placeholder="Business Name" />
        </div>
      
        <div className="inputs-group">
          <label>Business Email Address</label>
          <input type="text" placeholder="Add Email here" />
        </div>
        </div>




        <div className="form-group">
          <label>Business GST Number</label>
          <input type="text" placeholder="Add GST Number here" />
        </div>

        <div className="form-group">
          <label>Business Location</label>
          <input type="text" placeholder="Add Location here" />
        </div>

        <div className="form-group">
          <label>Business Website</label>
          <input type="text" placeholder="(website, social page, blog, etc.)" />
        </div>

        
        
   
        <div className="other-input-container">
          <div className="form-group_with_button">
            <label>Business Services</label>
            <div className="input-suggestions-container">
              <input
                placeholder="Tell us about your service..."
                value={otherServiceDescription}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                className="other-input"
                onResize={false}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="suggestions-list">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              <button 
                className="add-button" 
                onClick={handleAddCustomService} 
                disabled={!otherServiceDescription.trim()}
              >
                Add Service
              </button>
            </div>


            {(selectedTypes.length > 0 || customServices.length > 0) && (
        <div className="selected-services">
          <h3>Your Selected Services:</h3>
          <div className="selected-items">
            {selectedTypes.map((service, index) => (
              <div key={`selected-${index}`} className="selected-item">
                <span>{service}</span>
                <div className="delete-button" onClick={() => removeCustomService(index, true)}>x</div>
              </div>
            ))}
            {customServices.map((service, index) => (
              <div key={`custom-${index}`} className="selected-item">
                <span>{service}</span>
                <div className="delete-button" onClick={() => removeCustomService(index)}>x</div>
              </div>
            ))}
          </div>
        </div>
      )}


      



          </div>
        </div>



        <div className="form-group">
            <button className="ok-button">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

export default AddBusinessData
