import React, { useState, useEffect } from 'react';
import './AddBusinessServices.css';
import { Server_url, ConfirmMessage, showWarningToast } from '../../../../redux/AllData';
import { useSelector } from 'react-redux';
import { MdDeleteOutline, MdAdd,MdPhotoCamera, MdEdit, MdWarning } from 'react-icons/md';
import { FaRupeeSign, FaCameraRetro, FaRegClock } from 'react-icons/fa';
import { BiCameraMovie } from 'react-icons/bi';
import { BsPersonSquare } from 'react-icons/bs';

function AddBusinessServices() {
  const user = useSelector(state => state.user);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    pricePerDay: '',
    description: '',
    user_email: user.user_email
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState(null);
  const [showMinWarning, setShowMinWarning] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${Server_url}/owner/services/${user.user_email}`);
        if (response.ok) {
          const data = await response.json();
          // Sort services to show newest first
          const sortedData = data.reverse();
          setServices(sortedData);
          setShowMinWarning(sortedData.length < 3);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setShowMinWarning(true);
      }
    };
    fetchServices();
  }, [user.user_email]);

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      serviceName: '',
      pricePerDay: '',
      description: '',
      user_email: user.user_email
    });
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service.id);
    setFormData({
      serviceName: service.service_name,
      pricePerDay: service.price_per_day,
      description: service.description || '',
      user_email: service.user_email
    });
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
    if (formData.serviceName.length < 3) {
      showWarningToast({message: 'Service name must be at least 3 characters long.'});
      return false;
    }
    
    if (!formData.pricePerDay || formData.pricePerDay.trim() === '') {
      showWarningToast({message: 'Price per day is required.'});
      return false;
    }
    
    if (formData.pricePerDay.length > 6) {
      showWarningToast({message: 'Price per day must be less than 6 digits.'});
      return false;
    }

    if (isNaN(formData.pricePerDay) || Number(formData.pricePerDay) <= 0) {
      showWarningToast({message: 'Price must be a positive number.'});
      return false;
    }
    
    if (formData.description.length < 3) {
      showWarningToast({message: 'Description must be at least 3 characters long.'});
      return false;
    }
    
    if (formData.description.length > 200) {
      showWarningToast({message: 'Description must be less than 200 characters long.'});
      return false;
    }
    
    return true;
  };

  const addNewService = async () => {
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
        const responseData = await response.json();
        const newService = {
          id: responseData.service_id || Date.now(),
          service_name: formData.serviceName,
          price_per_day: formData.pricePerDay,
          description: formData.description,
          user_email: formData.user_email
        };
        // Add new service at the top of the list
        const updatedServices = [newService, ...services];
        setServices(updatedServices);
        // Check if we still need to show the minimum warning
        setShowMinWarning(updatedServices.length < 3);
        setFormData({ ...formData, serviceName: '', pricePerDay: '', description: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const editService = async () => {
    try {
      const response = await fetch(`${Server_url}/owner/update-service/${editingService}`, {
        method: 'PUT',
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
        // Update the service in the state
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === editingService 
              ? {
                  ...service,
                  service_name: formData.serviceName,
                  price_per_day: formData.pricePerDay,
                  description: formData.description
                } 
              : service
          )
        );
        setFormData({ ...formData, serviceName: '', pricePerDay: '', description: '' });
        setShowForm(false);
        setEditingService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
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
    // Check if deleting would reduce services below 3
    if (services.length <= 3) {
      showWarningToast({message: "Minimum 3 services required. Cannot delete."});
      return;
    }
    
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
        const updatedServices = services.filter(service => service.id !== serviceToRemove);
        setServices(updatedServices);
        setShowMinWarning(updatedServices.length < 3);
      }
    } catch (error) {
      console.error('Error removing service:', error);
    }
    setShowConfirm(false);
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    
    // Wedding and celebration photography
    if (name.includes('wedding') || name.includes('proposal') || name.includes('engagement')) {
      return <BiCameraMovie className="service-icon wedding" />;
    } 
    // Events and gatherings
    else if (name.includes('event') || name.includes('concert') || name.includes('festival') || name.includes('performance')) {
      return <FaCameraRetro className="service-icon event" />;
    } 
    // People-focused photography
    else if (name.includes('portrait') || name.includes('headshot') || name.includes('family') || 
             name.includes('maternity') || name.includes('newborn') || name.includes('boudoir')) {
      return <BsPersonSquare className="service-icon portrait" />;
    }
    // Nature and outdoors
    else if (name.includes('landscape') || name.includes('nature') || name.includes('wildlife') || 
             name.includes('travel') || name.includes('adventure') || name.includes('underwater')) {
      return <MdPhotoCamera className="service-icon nature" />;
    }
    // Food and product
    else if (name.includes('food') || name.includes('product') || name.includes('commercial') || 
             name.includes('e-commerce')) {
      return <MdPhotoCamera className="service-icon product" />;
    }
    // Architecture and real estate
    else if (name.includes('architectural') || name.includes('real estate') || name.includes('interior')) {
      return <MdPhotoCamera className="service-icon architectural" />;
    }
    // Fashion and style
    else if (name.includes('fashion') || name.includes('editorial') || name.includes('glamour') || 
             name.includes('model')) {
      return <FaCameraRetro className="service-icon fashion" />;
    }
    // Specialty photography
    else if (name.includes('aerial') || name.includes('drone') || name.includes('macro') || 
             name.includes('astro') || name.includes('night')) {
      return <BiCameraMovie className="service-icon specialty" />;
    }
    // Sports and action
    else if (name.includes('sport') || name.includes('action') || name.includes('adventure')) {
      return <FaCameraRetro className="service-icon sports" />;
    }
    // Art and creative
    else if (name.includes('fine art') || name.includes('abstract') || name.includes('black and white') || 
             name.includes('conceptual') || name.includes('creative')) {
      return <MdPhotoCamera className="service-icon art" />;
    }
    // Business and corporate
    else if (name.includes('corporate') || name.includes('business') || name.includes('professional')) {
      return <BsPersonSquare className="service-icon corporate" />;
    }
    // Default icon for any other type
    else {
      return <MdPhotoCamera className="service-icon" />;
    }
  };

  return (
    <div className='add-business-services-container'>
      <div className='services-header'>
        <h2>Business Services</h2>
        <button className='add-service-btn' onClick={handleAddService}>
          <MdAdd className="btn-icon" /> Add Service
        </button>
      </div>

      {showMinWarning && (
        <div className="min-services-warning">
          <MdWarning className="warning-icon" />
          <span>Minimum 3 services required. Please add more services.</span>
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
        {showForm && !editingService && (
          <div className='service-item add-form-container'>
            <div className="form-buttons-top">
              <button 
                type='button' 
                className='save-service-btn' 
                onClick={(e) => {
                  e.preventDefault();
                  if (!validateForm()) return;
                  addNewService();
                }}
              >
                Save Service
              </button>
              <button type='button' className='close-btn' onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            
            <form className='inline-service-form'>
              <div className='form-field service-name-field'>
                <input
                  type='text'
                  name='serviceName'
                  placeholder='Service Name *'
                  value={formData.serviceName}
                  onChange={handleChange}
                  autoComplete='off'
                />
                {showSuggestions && (
                  <ul className="suggestions-list">
                    {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
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
              
              <div className='form-field'>
                <div className="price-input-container">
                  <span className="price-currency">₹</span>
                  <input
                    type='number'
                    name='pricePerDay'
                    placeholder='Price per day *'
                    value={formData.pricePerDay}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className='form-field'>
                <textarea
                  name='description'
                  placeholder='Brief description of your service *'
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </form>
          </div>
        )}

        {!showForm && services.length === 0 ? (
          <div className='no-services'>
            <div className='no-services-content'>
              <div className="empty-state-icon">
                <MdPhotoCamera />
              </div>
              <h2>No Services Added Yet</h2>
              <p>Click the "Add Service" button to get started</p>
              <button className='add-service-btn-empty' onClick={handleAddService}>
                <MdAdd className="btn-icon" /> Add Your First Service
              </button>
            </div>
          </div>
        ) : (
          services.map((service, index) => (
            editingService === service.id ? (
              <div key={index} className='service-item add-form-container'>
                <div className="form-buttons-top">
                  <button 
                    type='button' 
                    className='save-service-btn' 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!validateForm()) return;
                      editService();
                    }}
                  >
                    Update Service
                  </button>
                  <button 
                    type='button' 
                    className='close-btn' 
                    onClick={() => {
                      setEditingService(null);
                      setFormData({
                        serviceName: '',
                        pricePerDay: '',
                        description: '',
                        user_email: user.user_email
                      });
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <form className='inline-service-form'>
                  <div className='form-field service-name-field'>
                    <input
                      type='text'
                      name='serviceName'
                      placeholder='Service Name *'
                      value={formData.serviceName}
                      onChange={handleChange}
                      autoComplete='off'
                    />
                    {showSuggestions && (
                      <ul className="suggestions-list">
                        {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
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
                  
                  <div className='form-field'>
                    <div className="price-input-container">
                      <span className="price-currency">₹</span>
                      <input
                        type='number'
                        name='pricePerDay'
                        placeholder='Price per day *'
                        value={formData.pricePerDay}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className='form-field'>
                    <textarea
                      name='description'
                      placeholder='Brief description of your service *'
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </form>
              </div>
            ) : (
              <div key={index} className='service-item'>
                <div className="service-actions">
                  <button 
                    className='edit-service-btn'
                    onClick={() => handleEditService(service)}
                    aria-label="Edit service"
                  >
                    <MdEdit/>
                  </button>
                  <button 
                    className='remove-service-btn'
                    onClick={() => handleRemoveService(service.id)}
                    aria-label="Delete service"
                  >
                    <MdDeleteOutline/>
                  </button>
                </div>
                
                <div className="service-header">
                  {getServiceIcon(service.service_name)}
                  <h3>{service.service_name}</h3>
                </div>
                
                <div className="service-content">
                  <div className="price-container">
                    <FaRupeeSign className="rupee-icon" />
                    <span className="service-price">{service.price_per_day || "Not Available"}</span>
                    <div className="per-day-container">
                      <FaRegClock className="clock-icon" />
                      <span className="per-day">/Day</span>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <p className="service-description">{service.description}</p>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}

export default AddBusinessServices;
