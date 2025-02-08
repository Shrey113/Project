import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux';
import './equipmentsPage.css'

import camera_icon from './test_img_equipment/camera.png'
import drone_icon from './test_img_equipment/drone.png'
import tripod_icon from './test_img_equipment/Tripod.png'
import lens_icon from './test_img_equipment/lens.png'

import { Server_url, showRejectToast, showAcceptToast } from '../../../../redux/AllData';

function EquipmentsPage() {



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
          }else{

            
            setEquipmentItems(data);
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


  async function updateUserStatus() {
    try {

        
      const updateData = {
        user_email: user.user_email,
        user_Status: 'Pending', 
      };
  
      // Make a PUT request to the server
      const response = await fetch(`${Server_url}/owner/update-owner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData), 
      });
  
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        showRejectToast({message: errorData.error || errorData.message });
        return;
      }
  
      const result = await response.json();
      if(result.message === 'Record updated successfully.'){
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showRejectToast({message: 'An error occurred while updating the user status.' });
    }
  }
  



  const handleRemove = (id,server_id) => {


    fetch(`${Server_url}/owner/remove-equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: user.user_email, user_equipment_id: server_id }),
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === 'Equipment removed successfully'){
        getEquipmentItems(user.user_email)
        showAcceptToast({message: 'Equipment removed successfully' });
      }
    })
    .catch(error => console.error('Error:', error));
  };




  async function addOneEquipment(equipmentItem) {
  
    
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
    
      return result;
    } catch (error) {
      console.error('Error adding equipment:', error.message);
      throw error;
    }
  }
  
  

  const handleAddEquipment = async () => {
    if (equipmentItems.length >= 4) {
        setValidationMessage('Maximum 4 equipment items allowed');
        return;
    }
    try {
        await addOneEquipment({
          user_equipment_id:equipmentItems.length +1 ,
            name: newEquipment.name,
            equipment_company: newEquipment.equipment_company,
            equipment_type: newEquipment.type,
            equipment_description: newEquipment.description,
            equipment_price_per_day: newEquipment.pricePerDay
        });

        getEquipmentItems(user.user_email)

    } catch (error) {
        showRejectToast({message: 'Failed to add equipment: ' + error.message });
    }
  };


  const [showNextButton, setShowNextButton] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if(equipmentItems.length >= 2){
      setShowNextButton(true);
    }
  }, [equipmentItems]);

  return (
    <div id='EquipmentsPage'>
      {/* Header Section */}
      <div className="equipment-header">
        <h2>Add Equipment</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          {equipmentItems.length < 2 
            ? 'Please add at least 2 equipment items to continue' 
            : equipmentItems.length >= 4 
              ? 'Maximum limit of 4 equipment items reached'
              : 'You can add up to 4 equipment items'}
        </p>
      </div>

      {validationMessage && (
          <div className="validation-message" style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
              {validationMessage}
          </div>
      )}

      <div className="Equipment_con">

   

        {equipmentItems.map((equipment) => (
          <div className="equipment-card" key={equipment.id}>
            <div className="equipment-img">
              <img src={getImgByType(equipment.equipment_type)} alt={equipment.name} />
            </div>
            <div className="equipment-info">
              <h3>{equipment.name}</h3>
              <p className="company">{equipment.equipment_type} • {equipment.equipment_company}</p>
              <p className="price">Rs.{equipment.equipment_price_per_day}/day</p>
              <p className="description">{equipment.equipment_description}</p>
            </div>

            <div className="remove-btn">
              <button onClick={() => handleRemove(equipment.id,equipment.user_equipment_id)}>Remove</button>
            </div>
          </div>
        ))}

{equipmentItems.length < 4 && (
          <div className="equipment-card add-form">
            <div className="equipment-img">
              <img src={newEquipment.image} alt="Equipment Type" />
            </div>
            <div className="equipment_new_info">
              <input type="text" name="name" placeholder="Equipment Name" value={newEquipment.name} onChange={handleInputChange} />

              <span>
              <input type="text" name="equipment_company" placeholder="Company" value={newEquipment.equipment_company} onChange={handleInputChange} />
              <select name="type" value={newEquipment.type} onChange={handleInputChange} >
                {equipmentTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.type}
                  </option>
                ))}
              </select>
              </span>
              <input 
                type="number" 
                name="pricePerDay" 
                placeholder="Price per day Rs." 
                value={newEquipment.pricePerDay} 
                onChange={handleInputChange} 
              />

              <textarea
                name="description"
                placeholder="Description"
                value={newEquipment.description}
                onChange={handleInputChange}
              />
         
              <button 
                className="save-btn"
                onClick={() => {
                  handleAddEquipment();
                  setNewEquipment({
                    name: '',
                    equipment_company: '',
                    type: 'Camera',
                    description: '',
                    image: camera_icon,
                    pricePerDay: ''
                  });
                }}
              >
                Save Equipment
              </button>
            </div>
          </div>
        )}
      </div>

      {showNextButton && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <button 
                  className="next-btn"
                  onClick={() => {
                    updateUserStatus();
                  }}
              >
                  Submit Your Profile
              </button>
          </div>
      )}

    </div>
  )
}

export default EquipmentsPage
