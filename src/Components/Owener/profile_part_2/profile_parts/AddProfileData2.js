import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import './AddBusinessData.css'
import { FaCamera } from 'react-icons/fa'
import {Server_url} from './../../../../redux/AllData'

// import edit_icon from './../../img/pencil.png'

function AddProfileData() {
  const user = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);
  // const [ownerData, setOwnerData] = useState(null);

  // Add new state variables for form inputs
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male',
    location: '',
    socialMedia: ''
  });

  // Add error states for each input
  const [errors, setErrors] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    location: '',
    socialMedia: ''
  });

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const response = await fetch(`${Server_url}/owner/get-owners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_email: user.user_email
          })
        });
        const data = await response.json();
        // setOwnerData(data.owners);
        // Populate form data with received data
        setFormData({
          userName: data.owners.user_name || '',
          firstName: data.owners.first_name || '',
          lastName: data.owners.last_name || '',
          email: data.owners.user_email || '',
          gender: data.owners.gender || 'male',
          location: data.owners.business_address || '',
          socialMedia: data.owners.social_media || ''
        });
      } catch (error) {
        console.error('Error fetching owner data:', error);
      }
    };

    fetchOwnerData();
  }, [user.user_email]);

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

  // Add handle input change function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  return (
    <div className="profile-container" id='AddProfileDataPopup'>
      <div className="profile-header">
        <h2>Personal Information</h2>
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
                        <span>P</span>
                        <label htmlFor="profile-image-input" className="camera-overlay" >
                            <FaCamera className="camera-icon" />
                        </label>
                    </>
                )}
            </div>
            <div className="profile-actions">
                <label htmlFor="profile-image-input" className="upload-btn">
                    Upload Profile
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
        <div className="form-group">
          <label>User Name</label>
          <input 
            type="text" 
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="User Name" 
          />
          {errors.userName && <span className="error">{errors.userName}</span>}
        </div>

        <div className="form-group_for_2_inputs">
          <div className="inputs-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name" 
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          <div className="inputs-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name" 
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Confirm Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Add Email here" 
            readOnly={true}
          />
          
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="error">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label>User Location</label>
          <input 
            type="text" 
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Add Location here" 
          />
          {errors.location && <span className="error">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label>Add your social media links</label>
          <input 
            type="text" 
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleInputChange}
            placeholder="(website, social page, blog, etc.)" 
          />
          {errors.socialMedia && <span className="error">{errors.socialMedia}</span>}
        </div>

        <div className="form-group">
            <button className="ok-button">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

export default AddProfileData
