import React, { useState, useEffect } from 'react';
import "./EventManagement.css";
import axios from 'axios';

import accept from './sub_img/correct.png';
import reject from './sub_img/remove.png';
import info from './sub_img/letter-i.png';
import { Server_url } from '../../../../redux/AllData';
import { useSelector } from 'react-redux';


function EventManagement() {
  const user = useSelector(state => state.user);
  const [packageData, setPackageData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [packageFilter, setPackageFilter] = useState('pending');
  const [equipmentFilter, setEquipmentFilter] = useState('pending');

  useEffect(() => {
    const get_owner_equipment_details = async () => {
      try {
        const response = await axios.get(`${Server_url}/owner/get-equipment-details-by/${user.user_email}`);
        setEquipmentData(response.data);
      } catch (error) {
        console.error('Error fetching equipment details:', error);
      }
    };

    const get_owner_package_details = async () => {
      try {
        const response = await axios.get(`${Server_url}/owner/get-package-details?receiver_email=${user.user_email}`);
        setPackageData(response.data);
      } catch (error) {
        console.error('Error fetching package details:', error);
      }
    };

    get_owner_package_details();
    get_owner_equipment_details();
    
  }, [user.user_email]);





  const filteredPackageData = packageData.filter(item => {
    return item.event_status.toLowerCase() === packageFilter.toLowerCase();
  });

  const filteredEquipmentData = equipmentData.filter(item => {
    return item.event_status.toLowerCase() === equipmentFilter.toLowerCase();
  });

  return (
    <div id="EventManagement">
      <div className="owner-requests">
        <div className="section-container">
          <h2>Package Requests</h2>
          <div className="toggle-filter">
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${packageFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setPackageFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`toggle-btn ${packageFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setPackageFilter('approved')}
              >
                Accepted
              </button>
              <div 
                className="slider" 
                style={{ 
                  transform: `translateX(${packageFilter === 'pending' ? '0' : '100%'})` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Request Type</th>
                  <th>Package Name</th>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Event Name</th>
                  <th>Location</th>
                  <th>Requirements</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackageData.length > 0 && filteredPackageData.map((item,index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.event_request_type}</td>
                    <td>{item.package_name}</td>
                    <td>{item.service}</td>
                    <td>{item.description}</td>
                    <td>{item.price}</td>
                    <td>{item.event_name}</td>
                    <td>{item.location}</td>
                    <td>{item.requirements}</td>
                    <td>{item.total_amount}</td>
                    <td>{item.event_status}</td>
                    <td className="action-buttons">
                      <button className="approve-btn">
                        <img src={accept} alt="Accept" />
                      </button>
                      <button className="reject-btn">
                        <img src={reject} alt="Reject" />
                      </button>
                      <button className="info-btn">
                        <img src={info} alt="Info" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-container">
          <h2>Equipment Requests</h2>
          <div className="toggle-filter">
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${equipmentFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setEquipmentFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`toggle-btn ${equipmentFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setEquipmentFilter('approved')}
              >
                Accepted
              </button>
              <div 
                className="slider" 
                style={{ 
                  transform: `translateX(${equipmentFilter === 'pending' ? '0' : '100%'})` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Request Type</th>
                  <th>Equipment Name</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Price Per Day</th>
                  <th>Location</th>
                  <th>Days Required</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipmentData.length > 0 && filteredEquipmentData.map((item,index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.event_request_type}</td>
                    <td>{item.equipment_name}</td>
                    <td>{item.equipment_company}</td>
                    <td>{item.equipment_type}</td>
                    <td>{item.equipment_description}</td>
                    <td>{item.equipment_price_per_day}</td>
                    <td>{item.location}</td>
                    <td>{item.days_required}</td>
                    <td>{item.total_amount}</td>
                    <td>{item.event_status}</td>
                    <td className="action-buttons">
                      <button className="approve-btn">
                        <img src={accept} alt="Accept" />
                      </button>
                      <button className="reject-btn">
                        <img src={reject} alt="Reject" />
                      </button>
                      <button className="info-btn">
                        <img src={info} alt="Info" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventManagement;
