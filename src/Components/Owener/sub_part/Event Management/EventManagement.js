import React, { useState } from 'react';
import "./EventManagement.css";

import accept from './sub_img/correct.png';
import reject from './sub_img/remove.png';
import info from './sub_img/letter-i.png';


function EventManagement() {
  const [activeTab, setActiveTab] = useState('all');
  
  const ownerData = [
    {
      id: 1,
      profileName: "Bob Smith",
      approvalType: "Event Registration",
      date: "2024-03-20",
      location: "New York",
      status: "Pending"
    },
    {
      id: 2,
      profileName: "Alice Johnson",
      approvalType: "Venue Booking",
      date: "2024-03-21",
      location: "Los Angeles",
      status: "Approved"
    },
  ];

  return (
    <div id="EventManagement">
      <div className="owner-requests">
        <h2>Approval Section</h2>
        
        <div className="tab-buttons">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            All Owners
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''} 
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button 
            className={activeTab === 'rejected' ? 'active' : ''} 
            onClick={() => setActiveTab('rejected')}
          >
            Rejected Requests
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Profile Name</th>
                <th>Approval Type</th>
                <th>Date</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ownerData.map((owner) => (
                <tr key={owner.id}>
                  <td>{owner.id}</td>
                  <td>{owner.profileName}</td>
                  <td>{owner.approvalType}</td>
                  <td>{owner.date}</td>
                  <td>{owner.location}</td>
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
          {/* <div className="pagination">
            <button className="prev-btn">{'<'}</button>
            <button className="active">1</button>
            <button>2</button>
            <button className="next-btn">{'>'}</button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default EventManagement;
