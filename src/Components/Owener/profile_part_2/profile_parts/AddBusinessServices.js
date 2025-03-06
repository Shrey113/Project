import React, { useState, useEffect } from 'react';
import './AddBusinessServices.css';
import { Server_url ,ConfirmMessage} from '../../../../redux/AllData';
import { useSelector } from 'react-redux';
import { MdDeleteOutline } from 'react-icons/md';

function AddBusinessServices() {
    const user = useSelector(state => state.user);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    pricePerDay: '',
    description: '',
    user_email: user.user_email
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
        try {
          const response = await fetch(`${Server_url}/owner/services/${user.user_email}`);
          if (response.ok) {
            const data = await response.json();
            setServices(data);
          }
        } catch (error) {
          console.error('Error fetching services:', error);
        }
      };
    fetchServices();
  }, [user.user_email]);



  const handleAddService = () => {
    setShowForm(true);
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

  const validateForm = () => {
    const newErrors = {};
    if (formData.serviceName.length < 3) {
      newErrors.serviceName = 'Service name must be at least 3 characters long.';
    }
    if (formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters long.';
    }
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters long.';
    }
    if (formData.pricePerDay.length > 6) {
      newErrors.pricePerDay = 'Price per day must be less than 6 digits.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${Server_url}/owner/add-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_name: formData.serviceName,
          price_per_day: formData.pricePerDay,
          description: formData.description,
          user_email: formData.user_email
        })
      });

      if (response.ok) {
        const newService = {
          id: Date.now(), //just for testing add 
          service_name: formData.serviceName,
          price_per_day: formData.pricePerDay,
          description: formData.description,
          user_email: formData.user_email
        };
        setServices(prevServices => [...prevServices, newService]);
        setFormData({ ...formData, serviceName: '', pricePerDay: '', description: '' });
        setShowForm(false);
        setErrors({});
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'serviceName') {
      const filtered = photography_services.filter(
        service => service.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(value.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      serviceName: suggestion
    });
    setShowSuggestions(false);
  };

  const handleRemoveService = async (serviceId) => {
    setServiceToRemove(serviceId);
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const response = await fetch(`${Server_url}/owner/remove-service/${serviceToRemove}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: formData.user_email
        })
      });

      if (response.ok) {
        setServices(prevServices => prevServices.filter(service => service.id !== serviceToRemove));
      }
    } catch (error) {
      console.error('Error removing service:', error);
    }
    setShowConfirm(false);
  };

  return (
    <div className='add-business-services-container'>
      <div className='services-header'>
        <h2>Business Services</h2>
        <button className='add-service-btn' onClick={handleAddService}>
          Add Service
        </button>
      </div>

      {showForm && (
        <div className='service-form-container'>
          <form onSubmit={handleSubmit} className='service-form'>
            <div className='form-group'>
              <div className="suggestion-container">
                <input
                  type='text'
                  name='serviceName'
                  placeholder='Service Name'
                  value={formData.serviceName}
                  onChange={handleChange}
                  autoComplete='off'
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && (
                  <ul className="suggestions-list">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.serviceName && <p className='error'>{errors.serviceName}</p>}
            </div>
            <div className='form-group'>
              <input
                type='number'
                name='pricePerDay'
                placeholder='Price per day Rs.'
                value={formData.pricePerDay}
                onChange={handleChange}
              />
              {errors.pricePerDay && <p className='error'>{errors.pricePerDay}</p>}
            </div>
            <div className='form-group'>
              <textarea
                name='description'
                placeholder='Description'
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <p className='error'>{errors.description}</p>}
            </div>
            <div className='form-buttons'>
              <button type='submit' className='save-btn'>Save Service</button>
              <button type='button' className='cancel-btn' onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showConfirm && (
        <ConfirmMessage
          message_title="Remove Service"
          message="Are you sure you want to remove this service?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmRemove}
          button_text="Remove"
        />
      )}

      <div className='services-list'>
        {!showForm && services.length === 0 ? (
          <div className='no-services'>
            <div className='no-services-content'>
              <i className="fas fa-clipboard-list"></i>
              <h2>No Services Added Yet</h2>
              <p>Click the "Add Service" button to get started</p>
              <button className='add-service-btn-empty' onClick={handleAddService}>
                + Add Your First Service
              </button>
            </div>
          </div>
        ) : (
          services.map((service, index) => (
            <div key={index} className='service-item'>
              <div className="service-content">
                <h3>{service.service_name}</h3>
                <p>
                <div class="rupee_symbol"> ₹</div>
                <div className="service_price">{service.price_per_day || "Not Available"}</div>
                <span class="per_day">/Day</span>
                </p>
                <hr style={{width:"90%"}} />
                <p>{service.description}</p>
              </div>
              <button 
                className='remove-service-btn'
                onClick={() => handleRemoveService(service.id)}
              >
                <MdDeleteOutline/>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddBusinessServices;
