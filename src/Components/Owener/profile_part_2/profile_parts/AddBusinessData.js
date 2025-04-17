import React, { useEffect, useState } from 'react'
import './AddProfileData2.css'
import { FaCamera } from 'react-icons/fa'
import { useSelector,useDispatch } from 'react-redux'
import { Server_url,showAcceptToast,showRejectToast,showWarningToast,ConfirmMessage } from '../../../../redux/AllData';


// import edit_icon from './../../img/pencil.png'



function AddBusinessData() {

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    button_text: "",
    onConfirm: () => {},
  });

  

  const [profileImage, setProfileImage] = useState(null);


  const [formData, setFormData] = useState({
    businessName: user?.business_name || '',
    businessEmail: user?.business_email || '',
    gstNumber: user?.gst_number || '',
    businessLocation: user?.business_address || '',
    services: user?.services || '',

    businessName_error: '',
    businessEmail_error: '',
    gstNumber_error: '',
    businessLocation_error: '',
  });

  useEffect(() => {
    setProfileImage(user.business_profile_base64);
  }, [user.business_profile_base64]);

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
      
      // Create XHR request for direct file upload
      const xhr = new XMLHttpRequest();
      
      // Setup promise to handle the XHR
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('POST', `${Server_url}/owner/update-business-profile-image`, true);
        xhr.setRequestHeader('x-user-email', user.user_email);
        xhr.setRequestHeader('Content-Type', file.type);
        
        xhr.onload = function() {
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
        
        xhr.onerror = function() {
          reject(new Error('Network error occurred'));
        };
        
        // Send the file
        xhr.send(file);
      });

      const data = await uploadPromise;

      if (data.message === "Business profile image updated successfully.") {
        // Update Redux with the image path instead of base64
        dispatch({
          type: "SET_USER_Owner", 
          payload: {
            business_profile_base64: data.imagePath || true
          }
        });
        
        showAcceptToast({ message: "Business profile image updated successfully" });
      }
    } catch (error) {
      console.error('Error updating business profile image:', error);
      showRejectToast({ message: "Failed to update business profile image. Please try again." });
    }
  };
  const handleDeleteImage = () => {
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Are you sure you want to remove the business profile image?",
      message: "Are you sure you want to remove the business profile image?",
      button_text: "Remove",
      onConfirm: () => {
        handle_Delete_Image()
      }
    });
  };

  const validateForm = () => {
    setFormData(prevState => ({
      ...prevState,
      businessName_error: '',
      businessEmail_error: '',
      gstNumber_error: '',
      businessLocation_error: '',
    }));
    

    // Business Name validation
    if (!formData.businessName.trim()) {
      showWarningToast({ message: 'Business name is required' });
      setFormData(prevState => ({
        ...prevState,
        businessName_error: 'Business name is required'
      }));
      return false;
    }

    // Business Email validation
    if (!formData.businessEmail.trim()) {
      showWarningToast({ message: 'Business email is required' });
      setFormData(prevState => ({
        ...prevState,
        businessEmail_error: 'Business email is required'
      }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.businessEmail)) {
      showWarningToast({ message: 'Please enter a valid business email' });
      setFormData(prevState => ({
        ...prevState,
        businessEmail_error: 'Please enter a valid business email'
      }));
      return false;
    }

    // GST Number validation (optional)
    if (formData.gstNumber.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstNumber)) {
        showWarningToast({ message: 'Please enter a valid GST number' });
        setFormData(prevState => ({
          ...prevState,
          gstNumber_error: 'Please enter a valid GST number'
        }));
        return false;
      }
    }

    // Business Location validation
    if (!formData.businessLocation.trim()) {
      showWarningToast({ message: 'Business location is required' });
      setFormData(prevState => ({
        ...prevState,
        businessLocation_error: 'Business location is required'
      }));
      return false;
    }


    return true;
  };

  const submitBusinessForm = async () => {
    if(!validateForm()){
      return;
    }
      const data = {
        user_email: user.user_email,
        business_name: formData.businessName,
        business_email: formData.businessEmail,
        gst_number: formData.gstNumber,
        business_address: formData.businessLocation,

      services: null
    }

    try {
      const response = await fetch(`${Server_url}/owner/update-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
      });
  
      const result = await response.json();  
  
      if (response.ok) {
        dispatch({ 
          type: "SET_USER_Owner", 
          payload: {
            business_name: data.business_name,
            business_email: data.business_email,
            gst_number: data.gst_number,
            business_address: data.business_address,
            website: data.website,
            services: data.services
          }
        });
        showAcceptToast({message: 'Business data updated successfully' });
      } else {
        showRejectToast({message: result.error });
      }
    } catch (error) {
      showRejectToast({message: 'Failed to update business data' });
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await submitBusinessForm();
  }

  const handle_Delete_Image = async () => {
    try {
      const response = await fetch(`${Server_url}/owner/remove-profile-image-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.user_email,
          type: 'business'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile image');
      }

      let data = await response.json();
      if(data.message === "business profile image removed successfully."){
        setProfileImage(null);
        dispatch({ 
          type: "SET_USER_Owner", 
          payload: {
            business_profile_base64: null
          }
        });
        showAcceptToast({ message: "Business profile image removed successfully" });
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      showWarningToast({ message: 'Failed to delete profile image' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  return (
    <div className="profile-container" id='AddBusinessDataPopup'>
      <div className="profile-header">
        <h2>Business Information</h2>
      </div>

        <div className="profile-avatar-container">
            <div className="profile-avatar">
                {profileImage ? (
                    <>
                        <img 
                            src={typeof profileImage === 'string' && profileImage.startsWith('data:') 
                                ? profileImage 
                                : `${Server_url}/owner/business-profile-image/${user.user_email}?t=${new Date().getTime()}`} 
                            alt="Profile" 
                        />
                        <label htmlFor="profile-image-input" className="camera-overlay">
                            <FaCamera className="camera-icon" />
                        </label>
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
                    Upload business
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

      <form onSubmit={handleSaveChanges} noValidate>


      <div className="form-group_for_2_inputs">
      <div className="inputs-group">
          <label>Business Name</label>
          <input 
            type="text" 
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder="Business Name" 
          />
          {formData.businessName_error && <p className="error">{formData.businessName_error}</p>}
        </div>
      
        <div className="inputs-group">
          <label>Business Email Address</label>
          <input 
            type="text" 
            name="businessEmail"
            value={formData.businessEmail}
            onChange={handleInputChange}
            placeholder="Add Email here" 
          />
          {formData.businessEmail_error && <p className="error">{formData.businessEmail_error}</p>}
        </div>
        </div>




        <div className="form-group">
          <label>Business GST Number</label>
          <input 
            type="text" 
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleInputChange}
            placeholder="Add GST Number here" 
          />
          {formData.gstNumber_error && <p className="error">{formData.gstNumber_error}</p>}
        </div>

        <div className="form-group">
          <label>Business Location</label>
          <input 
            type="text" 
            name="businessLocation"
            value={formData.businessLocation}
            onChange={handleInputChange}
            placeholder="Add Location here" 
          />
          {formData.businessLocation_error && <p className="error">{formData.businessLocation_error}</p>}
        </div>



        <div className="form-group">
            <button className="ok-button">Save Changes</button>
        </div>
      </form>

       {showDeleteConfirm.isVisible && (
        <ConfirmMessage message_title={showDeleteConfirm.message_title} message={showDeleteConfirm.message} 
          onCancel={() => setShowDeleteConfirm({...showDeleteConfirm, isVisible:false})} onConfirm={showDeleteConfirm.onConfirm} 
          button_text={showDeleteConfirm.button_text}/>
      )}
    </div>
  )
}

export default AddBusinessData
