import React, { useState, useEffect } from 'react';
import './OwnerManager.css';

import accept from './sub_img/correct.png';
import reject from './sub_img/remove.png';
import info from './sub_img/letter-i.png';
import PopupMenu from '../../Dashboard/question/PopupMenu';
import CloudIcon from '@mui/icons-material/Cloud';

import { Server_url, showRejectToast, showAcceptToast } from '../../../../../redux/AllData';
import CheckUserPage from './CheckUserPage';

function OwnerManager({ admin_email }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selected_user, set_selected_user] = useState([]);
  const [selected_email, set_selected_email] = useState('');

  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showConfirm, setShowConfirm] = useState({
    isOpen: false,
    email: null,
    handleClose: () => { }
  });

  const [showDriveLimitPopup, setShowDriveLimitPopup] = useState(false);
  const [selectedUserForDriveLimit, setSelectedUserForDriveLimit] = useState(null);
  const [driveLimit, setDriveLimit] = useState({
    value: 5,
    unit: 'GB'
  });
  const [driveLimitLoading, setDriveLimitLoading] = useState(false);

  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [allOwners, setAllOwners] = useState([]);

  const [activeList, setActiveList] = useState('pending');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;


  const [showOneOwnerData, setshowOneOwnerData] = useState({
    isShow: false,
    client_id: '',
    user_name: '',
    user_email: '',
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
    profile_pic: '',
    location: ''
  });

  function closeOneOwnerData() {
    setshowOneOwnerData(prevState => ({
      ...prevState,
      isShow: false
    }));
    get_admin_data();
  }
  function OnOneOwnerData() {
    setshowOneOwnerData(prevState => ({
      ...prevState,
      isShow: true
    }));
  }

  const getCurrentItems = () => {
    if (activeList === 'pending') {
      return pendingUsers.slice(indexOfFirstItem, indexOfLastItem);
    } else if (activeList === 'rejected') {
      return rejectedUsers.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      return allOwners.slice(indexOfFirstItem, indexOfLastItem);
    }
  };

  const getTotalPages = () => {
    let totalItems;
    if (activeList === 'pending') {
      totalItems = pendingUsers.length;
    } else if (activeList === 'rejected') {
      totalItems = rejectedUsers.length;
    } else {
      totalItems = allOwners.length;
    }
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, getTotalPages()));
  };

  const handleOpenDriveLimitPopup = (user) => {
    setSelectedUserForDriveLimit(user);
    
    const userDriveLimit = user.drive_limit;
    
    if (userDriveLimit) {
      if (userDriveLimit.toLowerCase() === 'unlimited') {
        setDriveLimit({
          value: 0,
          unit: 'unlimited'
        });
      } else {
        const match = userDriveLimit.match(/^(\d+)([GMT]B)$/i);
        if (match) {
          setDriveLimit({
            value: parseInt(match[1]),
            unit: match[2].toUpperCase()
          });
        } else {
          setDriveLimit({
            value: 5,
            unit: 'GB'
          });
        }
      }
    } else {
      setDriveLimit({
        value: 5,
        unit: 'GB'
      });
    }
    
    setShowDriveLimitPopup(true);
  };

  const updateDriveLimit = async () => {
    if (!selectedUserForDriveLimit) return;
    
    setDriveLimitLoading(true);
    
    try {
      const formattedDriveLimit = driveLimit.unit === 'unlimited' 
        ? 'unlimited' 
        : `${driveLimit.value}${driveLimit.unit}`;
      
      const response = await fetch(`${Server_url}/drive/set_drive_limit_by_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: selectedUserForDriveLimit.user_email,
          drive_limit: formattedDriveLimit
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAcceptToast({ message: data.message || 'Drive limit updated successfully' });
        
        const updatedAllOwners = allOwners.map(user => 
          user.user_email === selectedUserForDriveLimit.user_email 
            ? { ...user, drive_limit: formattedDriveLimit } 
            : user
        );
        setAllOwners(updatedAllOwners);
        
        setShowDriveLimitPopup(false);
      } else {
        showRejectToast({ message: data.error || 'Failed to update drive limit' });
      }
    } catch (error) {
      console.error('Error updating drive limit:', error);
      showRejectToast({ message: 'Error updating drive limit' });
    } finally {
      setDriveLimitLoading(false);
    }
  };

  const fetchOwnerByEmail = (email) => {
    return fetch(`${Server_url}/Admin/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Owner not found or server error');
        }
        return response.json();
      })
      .then(data => {
        console.log('Owner Data:', data);
        setShowPopup(true)
        set_selected_user(data)
      })
      .catch(error => {
        console.error('Error:', error);
        throw error;
      });
  };

  function get_admin_data() {
    fetch(`${Server_url}/Admin/pending-users`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch pending users');
        }
        return response.json();
      })
      .then(data => {
        setPendingUsers(data);
      })
      .catch(error => {
        setError(error.message);
      });
  }

  function updateUserStatus(email, status, message = null, set_status_by_admin = null) {
    if (status === "Accept") {
      set_selected_email(email);
      OnOneOwnerData();
      return;
    }
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
        if (data.message === 'Status updated') {
          showAcceptToast({ message: 'Status updated' });
          get_admin_data();
          getRejectedUsers();
          getAllOwners();
          if (showPopup) {
            setShowPopup(false);
          }
        } else {
          showRejectToast({ message: data.message });
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  }

  function getAllOwners() {
    fetch(`${Server_url}/Admin/get_all_owner`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch all owners');
        }
        return response.json();
      })
      .then(data => {
        setAllOwners(data);
      })
      .catch(error => {
        setError(error.message);
      });
  }

  useEffect(() => {
    get_admin_data();
    getAllOwners();
  }, []);



  function getRejectedUsers() {
    fetch(`${Server_url}/Admin/reject-users`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch rejected users');
        }
        return response.json();
      })
      .then(data => {
        setRejectedUsers(data);
      })
      .catch(error => {
        setError(error.message);
      });
  }



  useEffect(() => {
    getRejectedUsers();
  }, []);

  const getPageRange = () => {
    const totalPages = getTotalPages();

    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start, end;

    if (currentPage <= 2) {
      start = 1;
      end = 3;
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - 2;
      end = totalPages;
    } else {
      start = currentPage - 1;
      end = currentPage + 1;
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  };

  return (
    <div className={`Owner_manager`}>
      <div className="title_bar_sub">
        Owner Requests
      </div>

      <div className="categories-container">
        <div
          className={`category-item ${activeList === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveList('all');
            setCurrentPage(1);
          }}
        >
          All Owners
        </div>

        <div
          className={`category-item ${activeList === 'pending' ? 'active' : ''}`}
          onClick={() => {
            setActiveList('pending');
            setCurrentPage(1);
          }}
        >
          Pending Requests
        </div>
        <div
          className={`category-item ${activeList === 'rejected' ? 'active' : ''}`}
          onClick={() => {
            setActiveList('rejected');
            setCurrentPage(1);
          }}
        >
          Rejected Requests
        </div>

      </div>

      {error && <p className="error-message">{error}</p>}

      <table className="user_table">
        <thead>
          <tr>
            {activeList === 'pending' ? (
              <>
                <th className='set_width'>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Business Name</th>
                <th>Business Address</th>
                <th>Mobile</th>
                <th>GST Number</th>
                <th>Status</th>
                <th>Access</th>
              </>
            ) : activeList === 'rejected' ? (
              <>
                <th className='set_width'>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Business Name</th>
                <th>Business Address</th>
                <th>Mobile</th>
                <th>GST Number</th>
                <th>Status</th>
                <th>Access</th>
              </>
            ) : (
              <>
                <th className='set_width'>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Business Name</th>
                <th>Business Address</th>
                <th>Mobile</th>
                <th>GST Number</th>
                <th>Status</th>
                <th>Access</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {activeList === 'pending' ? (
            getCurrentItems().length > 0 ? (
              getCurrentItems().map(user => (
                <tr key={user.user_email}>
                  <td className='set_width'>{user.client_id}</td>
                  <td>{user.user_name}</td>
                  <td>{user.user_email}</td>
                  <td>{user.business_name}</td>
                  <td>{user.business_address}</td>
                  <td>{user.mobile_number}</td>
                  <td>{user.gst_number}</td>
                  <td className='set_type'>
                    <span className={`${user.user_Status === "Reject"
                        ? "Reject"
                        : user.user_Status === "Accept"
                          ? "Accept"
                          : "Pending"
                      }`}>
                      {user.user_Status}
                    </span>
                  </td>
                  <td>
                    <div className="more_option_pop">
                      {user.user_Status === "Pending" && (
                        <>
                          <div className="icon_img" onClick={() => updateUserStatus(user.user_email, "Accept", null, admin_email)}>
                            <img
                              src={accept}
                              alt="Accept"

                            />
                          </div>
                          <div className="icon_img">
                            <img
                              src={reject}
                              alt="Reject"
                              onClick={() => setShowConfirm({
                                isOpen: true,
                                email: user.user_email,
                                handleClose: () => setShowConfirm({ isOpen: false, email: null })
                              })}
                            />
                          </div>
                        </>
                      )}
                      <div className="icon_img">
                        <img
                          src={info}
                          alt="Info"
                          onClick={() => fetchOwnerByEmail(user.user_email)}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3">No pending users found</td></tr>
            )
          ) : activeList === 'rejected' ? (
            getCurrentItems().length > 0 ? (
              getCurrentItems().map(user => (
                <tr key={user.user_email}>
                  <td className='set_width'>{user.client_id}</td>
                  <td>{user.user_name}</td>
                  <td>{user.user_email}</td>
                  <td>{user.business_name}</td>
                  <td>{user.business_address}</td>
                  <td>{user.mobile_number}</td>
                  <td>{user.gst_number}</td>
                  <td className='set_type'>
                    <span className={`${user.user_Status === "Reject"
                        ? "Reject"
                        : user.user_Status === "Accept"
                          ? "Accept"
                          : "Pending"
                      }`}>
                      {user.user_Status}
                    </span>
                  </td>
                  <td>
                    <div className="more_option_pop">
                      {user.user_Status === "Pending" && (
                        <>
                          <div className="icon_img" onClick={() => updateUserStatus(user.user_email, "Accept", null, admin_email)}>
                            <img
                              src={accept}
                              alt="Accept"

                            />
                          </div>
                          <div className="icon_img">
                            <img
                              src={reject}
                              alt="Reject"
                              onClick={() => setShowConfirm({
                                isOpen: true,
                                email: user.user_email,
                                handleClose: () => setShowConfirm({ isOpen: false, email: null })
                              })}
                            />
                          </div>
                        </>
                      )}
                      <div className="icon_img">
                        <img
                          src={info}
                          alt="Info"
                          onClick={() => fetchOwnerByEmail(user.user_email)}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No rejected users found</td></tr>
            )
          ) : (
            getCurrentItems().length > 0 ? (
              getCurrentItems().map(user => (
                <tr key={user.user_email}>
                  <td className='set_width'>{user.client_id}</td>
                  <td>{user.user_name}</td>
                  <td>{user.user_email}</td>
                  <td>{user.business_name}</td>
                  <td>{user.business_address}</td>
                  <td>{user.mobile_number}</td>
                  <td>{user.gst_number}</td>
                  <td className='set_type'>
                    <span className={`${user.user_Status === "Reject"
                        ? "Reject"
                        : user.user_Status === "Accept"
                          ? "Accept"
                          : "Pending"
                      }`}>
                      {user.user_Status}
                    </span>
                  </td>
                  <td>
                    <div className="more_option_pop">
                      {user.user_Status === "Pending" && (
                        <>
                          <div className="icon_img" onClick={() => updateUserStatus(user.user_email, "Accept", null, admin_email)} >
                            <img
                              src={accept}
                              alt="Accept"

                            />
                          </div>
                          <div className="icon_img">
                            <img
                              src={reject}
                              alt="Reject"
                              onClick={() => setShowConfirm({
                                isOpen: true,
                                email: user.user_email,
                                handleClose: () => setShowConfirm({ isOpen: false, email: null })
                              })}
                            />
                          </div>
                        </>
                      )}
                      <div className="icon_img">
                        <img
                          src={info}
                          alt="Info"
                          onClick={() => fetchOwnerByEmail(user.user_email)}
                        />
                      </div>
                      {user.user_Status === "Accept" && (
                        <div 
                          className="icon_img drive-icon"
                          onClick={() => handleOpenDriveLimitPopup(user)}
                          title="Set Drive Limit"
                        >
                          <CloudIcon style={{ color: '#1976d2', fontSize: '20px' }} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9">No owners found</td></tr>
            )
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &lt;
        </button>

        {currentPage > 2 && getTotalPages() > 3 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="pagination-button"
            >
              1
            </button>
            {currentPage > 3 && <span className="pagination-dots">...</span>}
          </>
        )}

        {getPageRange().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        ))}

        {currentPage < getTotalPages() - 1 && getTotalPages() > 3 && (
          <>
            {currentPage < getTotalPages() - 2 && <span className="pagination-dots">...</span>}
            <button
              onClick={() => handlePageChange(getTotalPages())}
              className="pagination-button"
            >
              {getTotalPages()}
            </button>
          </>
        )}

        <button
          onClick={handleNextPage}
          disabled={currentPage === getTotalPages()}
          className="pagination-button"
        >
          &gt;
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            {
              selected_user.user_Status !== "Pending" &&
              <span> <strong>{selected_user.user_Status}</strong> by Admin <strong>{selected_user.set_status_by_admin}</strong></span>
            }

            <table className="user-data-table">
              <tbody>
                <tr>
                  <th>Client ID</th>
                  <td>{selected_user.client_id}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{selected_user.user_name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{selected_user.user_email}</td>
                </tr>
                <tr>
                  <th>Password</th>
                  <td>******</td>
                </tr>
                <tr>
                  <th>Business Name</th>
                  <td>{selected_user.business_name}</td>
                </tr>
                <tr>
                  <th>Business Address</th>
                  <td>{selected_user.business_address}</td>
                </tr>
                <tr>
                  <th>Mobile</th>
                  <td>{selected_user.mobile_number}</td>
                </tr>
                <tr>
                  <th>GST Number</th>
                  <td>{selected_user.gst_number}</td>
                </tr>

              </tbody>

            </table>
            <button className="close-popup-button" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showDriveLimitPopup && selectedUserForDriveLimit && (
        <div className="popup-overlay" onClick={() => setShowDriveLimitPopup(false)}>
          <div className="drive-limit-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Set Drive Storage Limit</h2>
            <p>User: <strong>{selectedUserForDriveLimit.user_name}</strong> ({selectedUserForDriveLimit.user_email})</p>
            
            <div className="drive-limit-form">
              <div className="drive-limit-input-container">
                <input
                  type="number"
                  className="drive-limit-input"
                  value={driveLimit.value}
                  onChange={(e) => setDriveLimit({...driveLimit, value: parseInt(e.target.value) || 0})}
                  min="1"
                  disabled={driveLimit.unit === 'unlimited'}
                />
                
                <select
                  className="drive-limit-unit"
                  value={driveLimit.unit}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setDriveLimit({
                      value: newUnit === 'unlimited' ? 0 : driveLimit.value,
                      unit: newUnit
                    });
                  }}
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              
              <div className="drive-limit-current">
                {selectedUserForDriveLimit.drive_limit ? (
                  <p>Current limit: <strong>{selectedUserForDriveLimit.drive_limit}</strong></p>
                ) : (
                  <p>No drive limit currently set</p>
                )}
              </div>
              
              <div className="drive-limit-actions">
                <button 
                  className="update-drive-button"
                  onClick={updateDriveLimit}
                  disabled={driveLimitLoading}
                >
                  {driveLimitLoading ? 'Updating...' : 'Update Limit'}
                </button>
                <button 
                  className="cancel-drive-button"
                  onClick={() => setShowDriveLimitPopup(false)}
                  disabled={driveLimitLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm.isOpen && (
        <PopupMenu
          email={showConfirm.email}
          handleClose={showConfirm.handleClose}
          admin_email={admin_email}
          onSuccess={(message, admin_email) => {
            updateUserStatus(showConfirm.email, "Reject", message, admin_email);
            showConfirm.handleClose();
          }}
        />
      )}


      {
        showOneOwnerData.isShow && (
          <CheckUserPage closeOneOwnerData={closeOneOwnerData} email={selected_email} admin_email={admin_email} />
        )
      }

      <style jsx>{`
        .drive-icon {
          cursor: pointer;
          transition: all 0.2s;
        }
        .drive-icon:hover {
          transform: scale(1.1);
        }
        .drive-limit-popup {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .drive-limit-popup h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .drive-limit-form {
          margin-top: 20px;
        }
        .drive-limit-input-container {
          display: flex;
          margin-bottom: 15px;
        }
        .drive-limit-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px 0 0 4px;
          font-size: 16px;
        }
        .drive-limit-unit {
          width: 120px;
          padding: 10px;
          border: 1px solid #ddd;
          border-left: none;
          border-radius: 0 4px 4px 0;
          background-color: #f8f8f8;
          font-size: 16px;
        }
        .drive-limit-current {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .drive-limit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .update-drive-button {
          background-color: #1976d2;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        .update-drive-button:hover {
          background-color: #1565c0;
        }
        .update-drive-button:disabled {
          background-color: #bbb;
          cursor: not-allowed;
        }
        .cancel-drive-button {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .cancel-drive-button:hover {
          background-color: #e5e5e5;
        }
      `}</style>

    </div>
  );
}

export default OwnerManager;
