import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import './UserProfilePage.css'
import { FaCamera } from 'react-icons/fa'

import { Server_url, showWarningToast,showAcceptToast,showRejectToast } from './../../../../redux/AllData';


function UserProfilePage({setIs_Page1,setCurrentStep}) {
  
  const user = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male',
    location: '',
    socialMedia: ''
  });

  useEffect(() => {
    const get_owners = async () => {
      try {
        const response = await fetch(`${Server_url}/owner/get-owners`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', // Ensure JSON is recognized
            },
          body: JSON.stringify({ user_email: user.user_email }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        setProfileImage(data.owners.user_profile_image_base64);
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
        console.error('Error fetching owners:', error);
      }
    };
  
    if (user?.user_email) { // Ensure user_email exists before making the request
      get_owners();
    }
  }, [user?.user_email]);
  



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


  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!file || !validImageTypes.includes(file.type)) {
      showWarningToast({message: "Please select a valid image file (JPEG, PNG, or GIF)" });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showWarningToast({message: "Image size should be less than 5MB" });
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);

        try {
          const response = await fetch(`${Server_url}/owner/update-user-profile-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: user.user_email,
              userProfileImage: base64Image
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if(data.message === "User profile image updated successfully."){
            showAcceptToast({message: "Profile image updated successfully" });
          }
        } catch (error) {
          console.error('Error updating profile image:', error);
          showRejectToast({message: "Failed to update profile image. Please try again." });
        }
      };

      reader.onerror = () => {
        showRejectToast({message: "Error reading file. Please try again." });
      };

      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
      showRejectToast({message: "An unexpected error occurred. Please try again." });
    }
  };




  const handleDeleteImage = async (e) => {
    e.preventDefault();
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to remove the business profile image?");
    
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${Server_url}/owner/remove-profile-image-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.user_email,
          type: 'user'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile image');
      }

      let data = await response.json();
      if(data.message === "user profile image removed successfully."){
        setProfileImage(null);
      }

      showAcceptToast({message: "Profile image removed successfully" });


    } catch (error) {
      console.error('Error deleting profile image:', error);
      showRejectToast({message: "Failed to delete profile image" });
    }
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

    // Modified gender validation
    if (!formData.gender || formData.gender === 'null' || formData.gender === null) {
      setFormData(prev => ({...prev, gender: 'male'})); // Set default if null
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
        business_address: formData.location,
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
          showAcceptToast({message: "Profile updated successfully" });
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
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteImage(e);
                    }}
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
            value={formData.gender || 'male'}
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
