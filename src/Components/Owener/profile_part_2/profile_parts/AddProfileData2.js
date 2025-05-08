import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import './AddBusinessData.css'
import { FaCamera } from 'react-icons/fa'
import { Server_url, showAcceptToast, showRejectToast, showWarningToast, ConfirmMessage, localstorage_key_for_jwt_user_side_key } from '../../../../redux/AllData';



// import edit_icon from './../../img/pencil.png'

function AddProfileData({ onInputChange }) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now()); // Add a key to force image refresh

  const [formData, setFormData] = useState({
    userName: user.user_name,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.user_email,
    gender: user.gender,
    location: user.business_address,
    socialMedia: user.social_media,
    skill: user.skill
  });



  useEffect(() => {
    setProfileImage(user.user_profile_image_base64);
  }, [user.user_profile_image_base64]);



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




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const data = {
        user_email: user.user_email,
        user_name: formData.userName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        social_media: formData.socialMedia,
        skill: formData.skill
      }

      try {
        const response = await fetch(`${Server_url}/owner/update-owner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (responseData.message === 'Owner updated successfully.') {
          // Update Redux state with new user data
          dispatch({
            type: "SET_USER_Owner",
            payload: {
              user_name: formData.userName,
              first_name: formData.firstName,
              last_name: formData.lastName,
              gender: formData.gender,
              social_media: formData.socialMedia,
              skill: formData.skill
            }
          });
          showAcceptToast({ message: "Profile updated successfully" });
        } else {
          showWarningToast({ message: responseData.error });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        showRejectToast({ message: "Failed to update profile. Please try again." });
      }
    }
  };

  const handleDeleteAccount = async () => {
    const data = {
      user_email: user.user_email
    }
    try {
      const response = await fetch(`${Server_url}/owner/delete-owner`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        showAcceptToast({ message: "Account deleted successfully" });
        console.log('Account deleted successfully', localstorage_key_for_jwt_user_side_key);
        localStorage.removeItem(localstorage_key_for_jwt_user_side_key);
        window.location.reload();
        window.location.href = '/';
      } else {
        showRejectToast({ message: "Failed to delete account. Please try again." });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showRejectToast({ message: "Failed to delete account. Please try again." });
    }
  }


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!file || !validImageTypes.includes(file.type)) {
      showWarningToast({ message: "Please select a valid image file (JPEG, PNG, or GIF)" });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showWarningToast({ message: "Image size should be less than 5MB" });
      return;
    }
    try {
      // Create a temporary URL for the file to show immediate feedback
      const tempURL = URL.createObjectURL(file);
      setProfileImage(tempURL);

      // Create XHR request to track upload progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      });

      // Setup promise to handle the XHR
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('POST', `${Server_url}/owner/update-user-profile-image`, true);
        xhr.setRequestHeader('x-user-email', user.user_email);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(errorData);
            } catch (e) {
              reject(new Error(`Server error: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = function () {
          reject(new Error('Network error occurred'));
        };

        // Send the file
        xhr.send(file);
      });

      const data = await uploadPromise;

      if (data.message === "User profile image updated successfully.") {
        // Update Redux with the image path instead of base64
        dispatch({
          type: "SET_USER_Owner",
          payload: {
            user_profile_image_base64: data.imagePath || true
          }
        });

        // Force image refresh by updating the key
        setImageKey(Date.now());
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };




  const handleDeleteImage = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to remove the profile image?");

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
      if (data.message === "user profile image removed successfully.") {
        // Update UI
        setProfileImage(null);

        // Update Redux store
        dispatch({
          type: "SET_USER_Owner",
          payload: {
            user_profile_image_base64: null
          }
        });

        // Force refresh by updating key
        setImageKey(Date.now());

      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
    }
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

    if (onInputChange) onInputChange();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate userName
    if (!formData.userName || !formData.userName.trim()) {
      newErrors.userName = 'Username is required';
      showWarningToast({ message: "Username is required" });
      setFormData(prevState => ({
        ...prevState,
        userName_error: 'Username is required'
      }));
      isValid = false;
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
      showWarningToast({ message: "Username must be at least 3 characters" });
      setFormData(prevState => ({
        ...prevState,
        userName_error: 'Username must be at least 3 characters'
      }));
      isValid = false;
    }

    // Validate firstName
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      showWarningToast({ message: "First name is required" });
      setFormData(prevState => ({
        ...prevState,
        firstName_error: 'First name is required'
      }));
      isValid = false;
    }

    // Validate lastName
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      showWarningToast({ message: "Last name is required" });
      setFormData(prevState => ({
        ...prevState,
        lastName_error: 'Last name is required'
      }));
      isValid = false;
    } else if (formData.lastName.length < 3) {
      newErrors.lastName = 'Last name must be at least 3 characters';
      showWarningToast({ message: "Last name must be at least 3 characters" });
      setFormData(prevState => ({
        ...prevState,
        lastName_error: 'Last name must be at least 3 characters'
      }));
      isValid = false;
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
      showWarningToast({ message: "Please select a gender" });
      setFormData(prevState => ({
        ...prevState,
        gender_error: 'Please select a gender'
      }));
      isValid = false;
    }

    // Validate social media (optional, but if provided should be a valid URL)
    if (formData.socialMedia && !isValidURL(formData.socialMedia)) {
      newErrors.socialMedia = 'Please enter a valid URL';
      showWarningToast({ message: "Please enter a valid social media URL" });
      setFormData(prevState => ({
        ...prevState,
        socialMedia_error: 'Please enter a valid URL'
      }));
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Helper function to validate URLs
  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
              <img
                src={typeof profileImage === 'string' && profileImage.startsWith('data:')
                  ? profileImage
                  : `${Server_url}/owner/profile-image/${user.user_email}?t=${imageKey}`}
                alt="Profile"
              />
              <label htmlFor="profile-image-input" className="camera-overlay">
                <FaCamera className="camera-icon" />
              </label>
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

        <div className="form-group">
          <label>Skill</label>
          <input
            type="text"
            name="skill"
            value={formData.skill}
            onChange={handleInputChange}
            placeholder="Add Your Skill"
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
          <label>Add your personal social media links</label>
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleInputChange}
            placeholder="(website, social page, blog, etc.)"
          />
          {errors.socialMedia && <span className="error">{errors.socialMedia}</span>}
        </div>

        <div className="form-group button-group" >
          <button className="ok-button" onClick={handleSubmit}>Save Changes</button>
          <button className="delete-buttons" onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(true) }}>Delete Account</button>
        </div>
      </form>
      {showDeleteConfirm && (
        <ConfirmMessage message_title={"Confirm Delete Account"} message={"Are you sure you want to delete your account?"} onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteConfirm(false)} />
      )}
    </div>
  )
}

export default AddProfileData
