import React, { useEffect, useState } from 'react';
import './CheckUserPage.css';
import back_img from './sub_img/back.png';
import { Server_url, showRejectToast, showAcceptToast } from '../../../../../redux/AllData';
import edit_icon from './../../../../Owener/img/pencil.png'

import camera_img from './test_img_equipment/camera.png';
import drone_img from './test_img_equipment/drone.png';
import lens_img from './test_img_equipment/lens.png';
import tripod_img from './test_img_equipment/Tripod.png';


function CheckUserPage({ closeOneOwnerData, email ,admin_email}) {
  const [selected_user, set_selected_user] = useState({});
  const [equipment, setEquipment] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    user_name: '',
    user_email: email || '',
    user_password: '',
    business_name: '',
    business_email: '',
    business_address: '',
    mobile_number: '',
    gst_number: '',
    user_status: '',
    admin_message: '',
    set_status_by_admin: '',
    bus_log: '',
    profile_pic: null,
    location: '',
    user_profile_image_base64: '',
    business_profile_base64: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [profileImage, setProfileImage] = useState(null);
  const [profileImage2, setProfileImage2] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchOwnerByEmail = async () => {
      try {
        const response = await fetch(`${Server_url}/Admin/owner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Owner not found or server error');
        }

        const data = await response.json();
        console.log(data);
        set_selected_user(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchOwnerByEmail();
    fetchEquipment(email);
    fetchGalleryData(email);
  }, [email]);

  const fetchEquipment = async (email) => {
    try {
      const response = await fetch(`${Server_url}/owner/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_email: email }),
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else if (response.status === 404) {
        // No equipment found
        setEquipment([]);
      } else {
        throw new Error('Error fetching equipment');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGalleryData = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/owner_drive/get_portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }), // Send email in the body
      });

      const result = await response.json();
      console.log(result);

      if (result.success) {
        setGalleryData(result.files || []);
      } else {
        console.error("Failed to fetch gallery data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    }
  };

  useEffect(() => {
    if (selected_user && Object.keys(selected_user).length > 0) {
      setFormData((prev) => ({
        ...prev,
        client_id: selected_user.client_id || '',
        user_name: selected_user.user_name || '',
        user_password: selected_user.user_password || '',
        business_name: selected_user.business_name || '',
        business_email: selected_user.business_email || '',
        business_address: selected_user.business_address || '',
        mobile_number: selected_user.mobile_number || '',
        gst_number: selected_user.gst_number || '',
        user_status: selected_user.user_status || '',
        admin_message: selected_user.admin_message || '',
        set_status_by_admin: selected_user.set_status_by_admin || '',
        bus_log: selected_user.bus_log || '',
        location: selected_user.business_address || '',

        first_name: selected_user.first_name || '',
        last_name: selected_user.last_name || '',
        gender: selected_user.gender || '',
        social_media: selected_user.social_media || '',
        website: selected_user.website || '',
        services: selected_user.services || '',
        user_profile_image_base64: selected_user.user_profile_image_base64 || '',
        business_profile_base64: selected_user.business_profile_base64 || '',
      }));
      
      if (selected_user.user_profile_image_base64) {
        setProfileImage(selected_user.user_profile_image_base64);
      }
      if (selected_user.business_profile_base64) {
        setProfileImage2(selected_user.business_profile_base64);
      }
    }
  }, [selected_user]);

  function updateUserStatus(email, status, message = null, set_status_by_admin = null) {
    setIsLoading(true);

    fetch(`${Server_url}/owner/update-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_email: email,
            user_Status: status,
            message: message,
            set_status_by_admin: set_status_by_admin
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        setIsLoading(false);
        if(data.message === 'Status updated'){
            closeOneOwnerData();
            showAcceptToast({message: 'Status updated' });
        }else{
            showRejectToast({message: data });
        }
    })
    .catch(error => {
        setIsLoading(false);
        console.error('Error:', error.message);
    });
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setFormData(prev => ({
          ...prev,
          user_profile_image_base64: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage2(reader.result);
        setFormData(prev => ({
          ...prev,
          business_profile_base64: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getEquipmentImage = (type) => {
    if (!type) return null;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('camera')) return camera_img;
    if (lowerType.includes('drone')) return drone_img;
    if (lowerType.includes('lens')) return lens_img;
    if (lowerType.includes('tripod')) return tripod_img;
    return null;
  };

  return (
    <div className="check-user-page">
        {isLoading && (
            <div className="loader-overlay">
                <div className="loader-content">
                    <div className="loader"></div>
                    <p>Creating user folder... This may take a few minutes</p>
                </div>
            </div>
        )}
      <div className="wrap_p">
      <div className="back_button" onClick={closeOneOwnerData}>
        <span>
          <img src={back_img} alt="Back" />
        </span>
        {windowWidth > 480 && "Back"}
      </div>
      <div className="main_con">
        
        <div className="main_con_wrap">
      <div className="section">
        <div className="section-header">Personal Information</div>
        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" />
                ) : (
                  <span>{formData.first_name?.[0] || 'U'}</span>
                )}
                <label htmlFor="profile-image-input" className="profile-avatar-overlay">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="profile-image-input"
                  />
                  <img src={edit_icon} alt="Edit" />
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} readOnly />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
        </form>
      </div>

      <div className="section">
        <div className="section-header">Business Information</div>
        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {profileImage2 ? (
                  <img src={profileImage2} alt="Business Logo" />
                ) : (
                  <span>{formData.business_name?.[0] || 'B'}</span>
                )}
                <label htmlFor="profile-image-input2" className="profile-avatar-overlay">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload2}
                    style={{ display: 'none' }}
                    id="profile-image-input2"
                  />
                  <img src={edit_icon} alt="Edit" />
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Business Name</label>
            <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Business Address</label>
            <input type="text" name="business_address" value={formData.business_address} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GST Number</label>
              <input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="text" name="website" value={formData.social_media} onChange={handleChange} />
            </div>
          </div>
        </form>
      </div>
      </div>

      {/* Equipment Section */}
      <div className="section equipment-section">
        <div className="section-header">Equipment</div>
        <div className="equipment-container">
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <div key={item.equipment_id} className="equipment-card">
                <div className="equipment-image">
                  <img 
                    src={getEquipmentImage(item.equipment_type) || (item.name ? `https://via.placeholder.com/150?text=${item.name[0]}` : 'https://via.placeholder.com/150?text=E')} 
                    alt={item.name} 
                  />
                </div>
                <div className="equipment-details">
                  <h3>{item.name}</h3>
                  <div className="equipment-type-company">
                    {item.equipment_type} • {item.equipment_company}
                  </div>
                  <div className="equipment-price">
                    Rs.{item.equipment_price_per_day}/day
                  </div>
                  <div className="equipment-description">
                    {item.equipment_description && item.equipment_description.length > 100 
                      ? `${item.equipment_description.substring(0, 100)}...` 
                      : item.equipment_description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-equipment">
              <p>No equipment found for this user.</p>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Gallery Section */}
      <div className="section portfolio-section">
        <div className="section-header">Portfolio Images</div>
        <div className="portfolio-container">
          {galleryData.length > 0 ? (
            galleryData.map((item) => (
              <div key={item.photo_id} className="portfolio-item">
                <div className="portfolio-image">
                  <img 
                    src={item.photo} 
                    alt={item.photo_name || 'Portfolio image'} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="no-portfolio">
              <p>No portfolio images found for this user.</p>
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="button_con">
        <button className="accept-button" onClick={() => updateUserStatus(email, "Accept", null, admin_email)}>
          Confirm Accept
        </button>
      </div>

      </div>

    </div>
  );
}

export default CheckUserPage;
