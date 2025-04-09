import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux';
import './AddEquipment.css'

import camera_icon from './test_img_equipment/camera.png'
import drone_icon from './test_img_equipment/drone.png'
import tripod_icon from './test_img_equipment/Tripod.png'
import lens_icon from './test_img_equipment/lens.png'

import { Server_url,showWarningToast, showRejectToast, ConfirmMessage } from '../../../../redux/AllData';
import { MdDeleteOutline, MdEdit, MdWarning } from 'react-icons/md';

function AddEquipment() {


  function getImgByType(type){
    if(type === 'Camera') return camera_icon;
    if(type === 'Drone') return drone_icon;
    if(type === 'Tripod') return tripod_icon;
    if(type === 'Lens') return lens_icon;
  }
  const user = useSelector(state => state.user);




    const [newEquipment, setNewEquipment] = useState({
        name: '',
        equipment_company: '',
        type: 'Camera',
        description: '',
        image: camera_icon,
        pricePerDay: ''
    });
    
      const [equipmentItems, setEquipmentItems] = useState([]);
      const [isEditing, setIsEditing] = useState(false);
      const [currentEquipmentId, setCurrentEquipmentId] = useState(null);
      const [showMinWarning, setShowMinWarning] = useState(false);


      function getEquipmentItems(get_email){
        fetch(`${Server_url}/owner/equipment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_email: get_email }),
        })
        .then(response => response.json())
        .then(data => {
          if(data.message === 'No equipment found'){
            setEquipmentItems([]);
            setShowMinWarning(true);
          }else{
            const reversedData = data.reverse();
            setEquipmentItems(reversedData);
            setShowMinWarning(reversedData.length < 2);
          }
        })
        .catch(error => console.error('Error:', error));
      }

      useEffect(() => {
        getEquipmentItems(user.user_email)
      }, [user.user_email]);



      
    
  const equipmentTypes = [
    { type: "Camera", icon: camera_icon },
    { type: "Drone", icon: drone_icon },
    { type: "Tripod", icon: tripod_icon },
    { type: "Lens", icon: lens_icon },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({
      ...prev,
      [name]: name === 'type' ? value : value,
      image: name === 'type' ? 
        value === 'Camera' ? camera_icon :
        value === 'Drone' ? drone_icon :
        value === 'Tripod' ? tripod_icon : camera_icon
      : prev.image
    }));
  };



  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleRemove = (id, server_id) => {
    setItemToDelete({ id, server_id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (equipmentItems.length <= 2) {
      showWarningToast({message: "Minimum 2 equipment items required. Cannot delete."});
      setShowDeleteConfirm(false);
      return;
    }

    fetch(`${Server_url}/owner/remove-equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: user.user_email, user_equipment_id: itemToDelete.server_id }),
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === 'Equipment removed successfully'){
        getEquipmentItems(user.user_email)
        setShowDeleteConfirm(false);
      }
    })
    .catch(error => console.error('Error:', error));
  };

  const handleEdit = (equipment) => {
    setIsEditing(true);
    setCurrentEquipmentId(equipment.user_equipment_id);
    setNewEquipment({
      name: equipment.name,
      equipment_company: equipment.equipment_company,
      type: equipment.equipment_type,
      description: equipment.equipment_description,
      image: getImgByType(equipment.equipment_type),
      pricePerDay: equipment.equipment_price_per_day
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentEquipmentId(null);
    setShowAddForm(false);
    setNewEquipment({
      name: '',
      equipment_company: '',
      type: 'Camera',
      description: '',
      image: camera_icon,
      pricePerDay: ''
    });
  };

  async function validateForm() {
    if (!newEquipment.name.trim()) {
      showWarningToast({message: "Equipment name is required"});
      return false;
    }
    
    if (!newEquipment.equipment_company.trim()) {
      showWarningToast({message: "Company name is required"});
      return false;
    }
    
    if (!newEquipment.description.trim()) {
      showWarningToast({message: "Description is required"});
      return false;
    }
    
    if (!newEquipment.pricePerDay) {
      showWarningToast({message: "Price per day is required"});
      return false;
    } else if (isNaN(newEquipment.pricePerDay) || Number(newEquipment.pricePerDay) <= 0) {
      showWarningToast({message: "Price must be a positive number"});
      return false;
    }
    
    return true;
  }

  async function editEquipment() {
    const isValid = await validateForm();
    if (!isValid) return;

    const equipmentItem = {
      user_equipment_id: currentEquipmentId,
      name: newEquipment.name,
      equipment_company: newEquipment.equipment_company,
      equipment_type: newEquipment.type,
      equipment_description: newEquipment.description,
      equipment_price_per_day: newEquipment.pricePerDay
    }
  
    try {
      const response = await fetch(`${Server_url}/owner/edit-equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.user_email,
          ...equipmentItem
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit equipment');
      }

      const result = await response.json();

      if(result.message === 'Equipment updated successfully'){
        setNewEquipment({
          name: '',
          equipment_company: '',
          type: 'Camera',
          description: '',
          image: camera_icon,
          pricePerDay: ''
        });
        getEquipmentItems(user.user_email);
        setShowAddForm(false);
        setIsEditing(false);
        setCurrentEquipmentId(null);
      }else{
        showRejectToast({message: 'Failed to edit equipment'});
      }
    
      return result;
    } catch (error) {
      console.error('Error editing equipment:', error.message);
      throw error;
    }
  }

  async function addOneEquipment() {
    const isValid = await validateForm();
    if (!isValid) return;

    const equipmentItem = {
      user_equipment_id: equipmentItems.length + 1,
      name: newEquipment.name,
      equipment_company: newEquipment.equipment_company,
      equipment_type: newEquipment.type,
      equipment_description: newEquipment.description,
      equipment_price_per_day: newEquipment.pricePerDay
    }
  
    
    try {
      const response = await fetch(`${Server_url}/owner/add-one-equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.user_email,
          ...equipmentItem
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add equipment');
      }

      const result = await response.json();

      if(result.message === 'Equipment added successfully'){
        setNewEquipment({
          name: '',
          equipment_company: '',
          type: 'Camera',
          description: '',
          image: camera_icon,
          pricePerDay: ''
        });
        getEquipmentItems(user.user_email);
        setShowAddForm(false);
      }else{
        showRejectToast({message: 'Failed to add equipment'});
      }
    
      return result;
    } catch (error) {
      console.error('Error adding equipment:', error.message);
      throw error;
    }
  }
  
  

  const [showAddForm, setShowAddForm] = useState(false);



  return (
    <div id='AddEquipment'>
      {/* Header Section */}
      <div className="equipment-header">
        <h2>Add Equipment</h2>
        <button 
          className="add-equipment-btn" 
          onClick={() => {
            setIsEditing(false);
            setCurrentEquipmentId(null);
            setNewEquipment({
              name: '',
              equipment_company: '',
              type: 'Camera',
              description: '',
              image: camera_icon,
              pricePerDay: ''
            });
            setShowAddForm(true);
          }}
        >
          Add New Equipment
        </button>
      </div>

      {showMinWarning && (
        <div className="min-equipment-warning">
          <MdWarning className="warning-icon" />
          <span>Minimum 2 equipment items required. Please add more equipment.</span>
        </div>
      )}

      <div className="Equipment_con">
        {showAddForm && !isEditing && (
          <div className="equipment-card add-form">
            <div className="equipment-img">
              <img src={newEquipment.image} alt="Equipment Type" />
         
            </div>
            <div className="equipment_new_info">
              <input 
                type="text" 
                name="name" 
                placeholder="Equipment Name *" 
                value={newEquipment.name} 
                onChange={handleInputChange}
              />

              <span>
                <input 
                  type="text" 
                  name="equipment_company" 
                  placeholder="Company *" 
                  value={newEquipment.equipment_company} 
                  onChange={handleInputChange}
                />
                <select name="type" value={newEquipment.type} onChange={handleInputChange} >
                  {equipmentTypes.map((type,index) => (
                    <option key={index} value={type.type}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </span>
              <input 
                type="number" 
                name="pricePerDay" 
                placeholder="Price per day Rs. *" 
                value={newEquipment.pricePerDay} 
                onChange={handleInputChange} 
              />

              <textarea
                name="description"
                placeholder="Description *"
                value={newEquipment.description}
                onChange={handleInputChange}
              />

              <div className="button_con">
                <button 
                  className="save-btn"
                  onClick={() => {
                    addOneEquipment();
                  }}
                >
                  Save Equipment
                </button>


                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowAddForm(false);
                  }}
                >
                  ×
                </button>
              </div>
           </div>
          </div>
        )}

        { equipmentItems.length > 0 ? equipmentItems.map((equipment,index) => (
          isEditing && currentEquipmentId === equipment.user_equipment_id ? (
            <div className="equipment-card add-form" key={index}>
              <div className="equipment-img">
                <img src={newEquipment.image} alt="Equipment Type" />
              </div>
              <div className="equipment_new_info">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Equipment Name *" 
                  value={newEquipment.name} 
                  onChange={handleInputChange}
                />
                <span>
                  <input 
                    type="text" 
                    name="equipment_company" 
                    placeholder="Company *" 
                    value={newEquipment.equipment_company} 
                    onChange={handleInputChange}
                  />
                  <select name="type" value={newEquipment.type} onChange={handleInputChange} >
                    {equipmentTypes.map((type,index) => (
                      <option key={index} value={type.type}>
                        {type.type}
                      </option>
                    ))}
                  </select>
                </span>
                <input 
                  type="number" 
                  name="pricePerDay" 
                  placeholder="Price per day Rs. *" 
                  value={newEquipment.pricePerDay} 
                  onChange={handleInputChange}
                />
                
                <textarea
                  name="description"
                  placeholder="Description *"
                  value={newEquipment.description}
                  onChange={handleInputChange}
                />
                
                <div className="button_con">
                  <button 
                    className="save-btn"
                    onClick={() => editEquipment()}
                  >
                    Update Equipment
                  </button>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      cancelEdit();
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="equipment-card" key={index}>
              <div className="equipment-img">
                <img src={getImgByType(equipment.equipment_type)} alt={equipment.name} />
              </div>
              <div className="equipment-info">
                <h3>{equipment.name}</h3>
                <p className="company">{equipment.equipment_type} • {equipment.equipment_company}</p>
                <p className="price">Rs.{equipment.equipment_price_per_day}/day</p>
                <p className="description">{equipment.equipment_description}</p>
              </div>

              <div className="action-buttons">
                <button className="edit-btn" onClick={() => handleEdit(equipment)}>
                  <MdEdit/>
                </button>
                <button className="delete-btn" onClick={() => handleRemove(equipment.id, equipment.user_equipment_id)}>
                  <MdDeleteOutline/>
                </button>
              </div>
            </div>
          )
        )) : <p className='not-found-data'>No equipment found</p>}
      </div>

      {showDeleteConfirm && (
       
          <ConfirmMessage message_title="Confirm Delete" message="Are you sure you want to delete this equipment?" 
            onCancel={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete}/>

      )}
     
    </div>
  )
}

export default AddEquipment
