import React, { useState } from 'react'
import './SeletedCard.css'
import { Server_url } from '../../../../../redux/AllData';
import { useSelector } from 'react-redux';

function SeletedCard({type, onClose, selectedData,selectedOwner}) {
    const user = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    // package
    package_name: selectedData.package_name,
    service: selectedData.service,
    description: selectedData.description,
    price: selectedData.price,

    // equipment
    equipment_name: selectedData.name,
    name: selectedData.name,
    equipment_company: selectedData.equipment_company,
    equipment_type: selectedData.equipment_type,
    equipment_description: selectedData.equipment_description,
    equipment_price_per_day: selectedData.equipment_price_per_day,

    location:'',
    location_error: '',
    requirements: '',
    requirements_error: '',
    days_required: 1,
    days_required_error: '',
    total_amount: type === 'equipment' ? selectedData.equipment_price_per_day : (selectedData.price * 1)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'days_required') {
      const days = parseInt(value) || 0;
      
      setFormData({
        ...formData,
        [name]: days,
        days_required_error: days < 1 ? 'Days must be at least 1' : '',
        total_amount: type === 'equipment' 
          ? (days * formData.equipment_price_per_day) 
          : (days * formData.price)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const add_equipment_request = async () => {
    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email
    };

    try {
      const response = await fetch(`${Server_url}/owner/add-equipment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Request failed');
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding equipment request:', error);
    }
  };

  const add_package_request = async () => {
    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email
    };

    try {
      const response = await fetch(`${Server_url}/owner/add-package-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      onClose();
    } catch (error) {
      console.error('Error adding package request:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate location
    if (!formData.location.trim()) {
      setFormData(prev => ({
        ...prev,
        location_error: 'Location is required'
      }));
      return;
    }

    if (type === 'equipment') {
      await add_equipment_request();
    } else if (type === 'package') {
      await add_package_request();
    }
  };

  return (
    <div className="selected_overlay" onClick={(e) => {onClose();}}>
      <div className='on_close' onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </div>
      <div className='selected-card-container' onClick={(e) => {e.stopPropagation();}}>

        {type === "equipment" && (
          <div className='equipment-card-container-selected'>
            <div className='equipment-card-title-selected'>Equipment Booking</div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <div className="info-section">
                <div className="info-group">
                  <label>Equipment Name</label>
                  <div className="info-value">{formData.name}</div>
                </div>
                <div className="info-group">
                  <label>Company</label>
                  <div className="info-value">{formData.equipment_company}</div>
                </div>
                <div className="info-group">
                  <label>Equipment Type</label>
                  <div className="info-value">{formData.equipment_type}</div>
                </div>
                <div className="info-group">
                  <label>Description</label>
                  <div className="info-value">{formData.equipment_description}</div>
                </div>
                <div className="info-group">
                  <label>Price per Day</label>
                  <div className="info-value">{formData.equipment_price_per_day}</div>
                </div>
                
              </div>

              {/* User Input Section */}
              <div className="form-group">
                  <label>Number of Days Required</label>
                  <input  type="number" name="days_required" value={formData.days_required} onChange={handleChange} min="1" required />
                  {formData.days_required_error && (
                    <div className="error-message">{formData.days_required_error}</div>
                  )}
                </div>
                <div className="info-group total-amount">
                  <label>Total Amount</label>
                  <div className="info-value">₹{formData.total_amount}</div>
                </div>

              <div className="form-group">
                <label>Location</label>
                <input  type="text"  name="location" value={formData.location} onChange={handleChange} required
                />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea  name="requirements" value={formData.requirements} onChange={handleChange} rows="3"/>
              </div>

              <button type="submit" className="submit-btn">Book Now</button>
            </form>
          </div>
        )}
        {type === "package" && (
          <div className='package-card-container-selected'>
            <div className='package-card-title-selected'>Package Booking</div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <div className="info-section">
                <div className="info-group">
                  <label>Package Name</label>
                  <div className="info-value">{formData.package_name}</div>
                </div>
                <div className="info-group">
                  <label>Service</label>
                  <div className="info-value">{formData.service}</div>
                </div>
                <div className="info-group">
                  <label>Description</label>
                  <div className="info-value">{formData.description}</div>
                </div>
                <div className="info-group">
                  <label>Price</label>
                  <div className="info-value">{formData.price}</div>
                </div>
              </div>

              {/* User Input Section */}
                <div className="form-group">
                  <label>Number of Days Required</label>
                  <input  type="number" name="days_required" value={formData.days_required} onChange={handleChange} min="1" required />
                  {formData.days_required_error && (
                    <div className="error-message">{formData.days_required_error}</div>
                  )}
                </div>
                <div className="info-group total-amount">
                  <label>Total Amount</label>
                  <div className="info-value">₹{formData.total_amount}</div>
                </div>
              <div className="form-group">
                <label>Location</label>
                <input  type="text"  name="location" value={formData.location} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea  name="requirements" value={formData.requirements} onChange={handleChange} rows="3" />
              </div>

              <button type="submit" className="submit-btn">Book Package</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default SeletedCard
