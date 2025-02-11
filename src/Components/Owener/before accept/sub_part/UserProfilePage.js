import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import './UserProfilePage.css'
import { FaCamera } from 'react-icons/fa'

import { Server_url, showWarningToast } from './../../../../redux/AllData';


function UserProfilePage({setIs_Page1,setCurrentStep}) {
  const user = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);


  const [formData, setFormData] = useState({
    userName: user.user_name || '',
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.user_email || '',
    gender: user.gender || 'male',
    location: user.business_address || '',
    socialMedia: user.social_media || ''
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
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // Add validation function
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
      isValid = false;
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should only contain letters';
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should only contain letters';
      isValid = false;
    }

    // Gender validation - check for empty string or null
    if (!formData.gender || formData.gender === '') {
      newErrors.gender = 'Please select a gender';
      isValid = false;
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    // Social Media validation (optional)
    if (formData.socialMedia && !formData.socialMedia.trim().startsWith('http')) {
      newErrors.socialMedia = 'Please enter a valid URL starting with http:// or https://';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {


      const data = {
        user_email: user.user_email,

        user_name: formData.userName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        social_media: formData.socialMedia
      }

      fetch(`${Server_url}/owner/update-owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(res => res.json()).then(data => {

        if(data.message === 'Owner updated successfully.' ){
          setIs_Page1(true);
          setCurrentStep(2);
        }else{
         showWarningToast({message: data.error})
        }
      });
    }
  };

  return (
    <div className="profile-container" id='UserProfilePage'>
      {/* <div className="profile-header">
        <h2>Personal Information</h2>
      </div> */}

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

      <form >
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
      placeholder="Add Location here, e.g., state, country"
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
            placeholder="(website, social page, blog, etc.) - optional"
          />
          {errors.socialMedia && <span className="error">{errors.socialMedia}</span>}
        </div>

        <div className="form-group">
            <button type="submit" className="ok-button" onClick={handleSubmit}>Save And Next</button>
        </div>
      </form>

    </div>
  )
}

export default UserProfilePage;
