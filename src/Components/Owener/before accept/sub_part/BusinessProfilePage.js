import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux';
import "./BusinessProfilePage.css"

import { FaCamera } from 'react-icons/fa'

import { Server_url, showRejectToast, showAcceptToast, showWarningToast } from './../../../../redux/AllData';

function BusinessProfilePage({setIs_Page2,setCurrentStep}) {
  const user = useSelector((state) => state.user);
     // Add these new state declarations at the top with other useState hooks
     const [formData, setFormData] = useState({
      businessName: '',
      businessEmail: '',
      gstNumber: '',
      location: '',
      services: [],
      businessProfileImage: null
    });

    const [imageKey, setImageKey] = useState(Date.now()); // Key to force image refresh

  useEffect(() => {
    const get_owners = async () => {
      try {
        const response = await fetch(`${Server_url}/owner/get-owners`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
            },
          body: JSON.stringify({ user_email: user.user_email }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        
        // Set the form data fields except businessProfileImage
        setFormData({
          businessName: data.owners.business_name || '',
          businessEmail: data.owners.business_email || '',
          gstNumber: data.owners.gst_number || '',
          location: data.owners.business_address || '',
          services: data.owners.services || [],
          businessProfileImage: null // Will set this properly below
        });
        
        // Handle the business profile image properly based on format
        if (data.owners.business_profile_base64) {
          if (data.owners.business_profile_base64.startsWith('data:image')) {
            // It's a base64 image, use as is
            setFormData(prev => ({
              ...prev,
              businessProfileImage: data.owners.business_profile_base64
            }));
          } else if (data.owners.business_profile_base64.startsWith('/root/')) {
            // It's a path, load from the image serving endpoint
            const imageUrl = `${Server_url}/owner/business-profile-image/${user.user_email}?t=${new Date().getTime()}`;
            setFormData(prev => ({
              ...prev,
              businessProfileImage: imageUrl
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };
  
    if (user?.user_email) {
      get_owners();
    }
  }, [user?.user_email]);
  
 


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      services: user.services || []
    }));
  }, [user]);

  const [errors, setErrors] = useState({
    businessName: '',
    businessEmail: '',
    gstNumber: '',
    location: '',
    services: ''
  });



 
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
          type: 'business'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile image');
      }

      let data = await response.json();
      if(data.message.includes("removed successfully.")){ 
        setFormData(prev => ({
          ...prev,
          businessProfileImage: null
        }));
        
        // Force refresh by updating key
        setImageKey(Date.now());
        
        showAcceptToast({message: "Profile image removed successfully" });
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      showRejectToast({message: "Failed to delete profile image" });
    }
  };
  
 
   
  const handleImageUpload = async (event) => {
    event.preventDefault();
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
      // Set a temporary URL for immediate display during upload
      setFormData(prev => ({
        ...prev,
        businessProfileImage: URL.createObjectURL(file)
      }));
      
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
        // Force image refresh by updating the key
        setImageKey(Date.now());
        
        // Load the image from the server with the new timestamp
        const imageUrl = `${Server_url}/owner/business-profile-image/${user.user_email}?t=${imageKey}`;
        setFormData(prev => ({
          ...prev,
          businessProfileImage: imageUrl
        }));
        
        showAcceptToast({ message: 'Profile image updated successfully' });
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      showRejectToast({ message: 'Failed to update profile image' });
    }
  };




  const submitBusinessForm = async () => {
    const data = {
      user_email: user.user_email,
      business_name: formData.businessName,
      business_email: formData.businessEmail,
      gst_number: formData.gstNumber,
      business_address: formData.location,
      services: formData.services,
      business_profile_base64: formData.businessProfileImage
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
        setIs_Page2(true);
        setCurrentStep(3);
        showAcceptToast({message: 'Business data updated' });
      } else {
        showRejectToast({message: result.error });
      }
    } catch (error) {
      showRejectToast({message: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      businessName: '',
      businessEmail: '',
      gstNumber: '',
      location: '',
      services: ''
    });

    let hasErrors = false;
    const newErrors = {
      businessName: '',
      businessEmail: '',
      gstNumber: '',
      location: '',
      services: ''
    };

    // Business Name validation
    if (!formData.businessName || !formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
      hasErrors = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.businessEmail || !formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email is required';
      hasErrors = true;
    } else if (!emailRegex.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Modified GST Number validation - only validate if a value is provided
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.gstNumber && formData.gstNumber.trim() && !gstRegex.test(formData.gstNumber)) {
      newErrors.gstNumber = 'If provided, please enter a valid GST number';
      hasErrors = true;
    }

    // Location validation
    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Location is required';
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      await submitBusinessForm();
    }
  };

  return (
    <div className="profile-container" id='AddBusinessDataPage'>
      {/* <div className="profile-header">
        <h2>Business Information</h2>
      </div> */}

        <div className="profile-avatar-container">
            <div className="profile-avatar">
                {formData.businessProfileImage ? (
                    <>
                        <img 
                            src={typeof formData.businessProfileImage === 'string' && formData.businessProfileImage.startsWith('data:') 
                                ? formData.businessProfileImage 
                                : `${Server_url}/owner/business-profile-image/${user.user_email}?t=${imageKey}`} 
                            alt="Profile" 
                        />
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
                    Upload Profile
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="profile-image-input"
                    />
                </label>
                <div 
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteImage(e);
                    }}
                >
                    Delete avatar
                </div>
            </div>
        </div>

      <form onSubmit={(e) => {
        e.preventDefault();
      }}>


      <div className="form-group_for_2_inputs">
      <div className="inputs-group">
          <label>Business Name</label>
          <input type="text" placeholder="Business Name" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
          {errors.businessName && <span className="error">{errors.businessName}</span>}
        </div>
      
        <div className="inputs-group">
          <label>Business Email Address</label>
          <input type="text" placeholder="Add Email here" value={formData.businessEmail} onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })} />
          {errors.businessEmail && <span className="error">{errors.businessEmail}</span>}
        </div>
        </div>




        <div className="form-group">
          <label>Business GST Number (Optional)</label>
          <input 
            type="text" 
            placeholder="Add GST Number here (Optional)" 
            value={formData.gstNumber} 
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} 
          />
          {errors.gstNumber && <span className="error">{errors.gstNumber}</span>}
        </div>

        <div className="form-group">
          <label>Business Location</label>
          <input type="text" placeholder="Add Location here" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          {errors.location && <span className="error">{errors.location}</span>}
        </div>


        
        
   



        <div className="form-group">
            <button onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} className="ok-button">Save And Next</button>
        </div>
      </form>

    </div>
  )
}

export default BusinessProfilePage
