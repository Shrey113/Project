import React,{useState} from 'react'
import './AddEquipment.css'

import camera_icon from './test_img_equipment/camera.png'
import drone_icon from './test_img_equipment/drone.png'
import tripod_icon from './test_img_equipment/Tripod.png'
import lens_icon from './test_img_equipment/lens.png'

function AddEquipment() {
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        company: '',
        type: 'Camera',
        description: '',
        image: camera_icon,
        pricePerDay: ''
    });
    

    const equipmentList = [
        {
          id: 1,
          name: "Canon EOS R5",
          company: "Canon Inc.",
          type: "Camera",
          image: camera_icon,
          description: "Full-frame mirrorless camera with 45MP resolution, 8K video recording, and advanced autofocus capabilities.",
          pricePerDay: 150
        },
        {
          id: 2,
          name: "Nikon Z9",
          company: "Nikon Corporation",
          type: "Drone",
          image: drone_icon,
          description: "Professional mirrorless camera with 45.7MP sensor, 8K video, and high-speed performance for photographers and filmmakers.",
          pricePerDay: 200
        },
        {
          id: 3,
          name: "Sony FE 24-70mm f/2.8 GM",
          company: "Sony",
          type: "Lens",
          image: camera_icon,
          description: "Versatile zoom lens offering outstanding optical performance, ideal for portraits, landscapes, and event photography.",
          pricePerDay: 100
        },
        {
          id: 4,
          name: "Manfrotto Befree Advanced Tripod",
          company: "Manfrotto",
          type: "Tripod",
          image: tripod_icon,
          description: "Compact and lightweight travel tripod with advanced features for stability and ease of use.",
          pricePerDay: 50
        },
        {
          id: 5,
          name: "DJI Air 2S",
          company: "DJI",
          type: "Drone",
          image: drone_icon,
          description: "High-performance drone with a 1-inch sensor, 5.4K video recording, and intelligent flight modes for stunning aerial shots.",
          pricePerDay: 150
        }
      ];

      const [equipmentItems, setEquipmentItems] = useState(equipmentList);
      

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

//   const handleTypeSelect = (selectedType) => {
//     setNewEquipment(prev => ({
//       ...prev,
//       type: selectedType.type,
//       image: selectedType.icon
//     }));
//   };

  const handleRemove = (id) => {
    setEquipmentItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleAddEquipment = () => {
    const newId = equipmentItems.length > 0 
        ? equipmentItems[equipmentItems.length - 1].id + 1 
        : 1;
    const equipmentToAdd = {
        ...newEquipment,
        id: newId,
    };
    
    setEquipmentItems(prev => [...prev, equipmentToAdd]);
  };

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div id='AddEquipment'>
      {/* Header Section */}
      <div className="equipment-header">
        <h2>Equipment</h2>
        <span className="add-btn" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? '- Cancel' : '+ Add'}
        </span>
      </div>

      <div className="Equipment_con">
        {/* Add Equipment Form Card */}
        {isAdding && (
          <div className="equipment-card add-form">
            <div className="equipment-img">
              <img src={newEquipment.image} alt="Equipment Type" />
            </div>
            <div className="equipment_new_info">
              <input type="text" name="name" placeholder="Equipment Name" value={newEquipment.name} onChange={handleInputChange} />

              <span>
              <input type="text" name="company" placeholder="Company" value={newEquipment.company} onChange={handleInputChange} />
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
                placeholder="Price per day $" 
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
                  setIsAdding(false);
                  setNewEquipment({
                    name: 'New Equipment',
                    company: 'Default Company',
                    type: 'Camera',
                    description: 'Default description',
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

        {equipmentItems.map((equipment) => (
          <div className="equipment-card" key={equipment.id}>
            <div className="equipment-img">
              <img src={equipment.image} alt={equipment.name} />
            </div>
            <div className="equipment-info">
              <h3>{equipment.name}</h3>
              <p className="company">{equipment.type} • {equipment.company}</p>
              <p className="price">${equipment.pricePerDay}/day</p>
              <p className="description">{equipment.description}</p>
            </div>

            <div className="remove-btn">
              <button onClick={() => handleRemove(equipment.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddEquipment
