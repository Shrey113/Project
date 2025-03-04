import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import "./before_accept.css"


import BusinessProfilePage from './sub_part/BusinessProfilePage'
import EquipmentsPage from './sub_part/equipmentsPage'
import PortfolioPage from './sub_part/portfolioPage'
import UserProfilePage from './sub_part/UserProfilePage'

import Status_Pending from './../../../Assets/Owener/file.gif';
import Status_rejected from './../../../Assets/Owener/rejected.gif';
import {Server_url,localstorage_key_for_client,showWarningToast} from './../../../redux/AllData.js';



const ComonPopup = ({showPopup,setShowPopup}) => {
  const user = useSelector((state) => state.user);
  const user_Status = user.user_Status;

  return (
    <div className="Dashboard_main_con">
        {/* Pop-up Modal */}
        {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>User Details</h2>


                        <table className="user-data-table">
                            <tbody>
                                <tr>
                                    <th>Client ID</th>
                                    <td>{user.client_id}</td>
                                </tr>
                                <tr>
                                    <th>Name</th>
                                    <td>{user.user_name}</td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>{user.user_email}</td>
                                </tr>
                                <tr>
                                    <th>Password</th>
                                    <td>******</td>
                                </tr>
                                <tr>
                                    <th>Business Name</th>
                                    <td>{user.business_name}</td>
                                </tr>
                                <tr>
                                    <th>Business Address</th>
                                    <td>{user.business_address}</td>
                                </tr>
                                <tr>
                                    <th>Mobile</th>
                                    <td>{user.mobile_number}</td>
                                </tr>
                                <tr>
                                    <th>GST Number</th>
                                    <td>{user.gst_number}</td>
                                </tr>
                            </tbody>
                        </table>
                        {user_Status === 'Accept'  &&
                            <div className="dec">
                                Accepted by Admin <span> {user.set_status_by_admin} </span>
                            </div>
                        }
                        {user_Status === 'Reject'  &&
                            
                            <div className="dec_2">
                                Admin will Rejected  your request 
                                {user.admin_message && <span>Rejected reason : {user.admin_message}</span>} 
                            </div>
                        }
                        {user_Status === 'Pending' && 
                                <div className="dec">
                                    The admin will review it promptly and take the
                                    necessary action.
                                </div>
                        }

                        <button
                            className="close-popup-button"
                            onClick={() => setShowPopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
    </div>
  )
}

export const RejectedStatus = () => {
  const user = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);

  const handleApplyAgain = async () => {
    try {
        const response = await fetch(`${Server_url}/owner/delete-by-email`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_email: user.user_email
            })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.removeItem(localstorage_key_for_client);
            window.location.href = '/Owner';
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
  return (
   
      <div className="Dashboard_main_con">
          <div className="status-container">
              <img src={Status_rejected} alt="Status Rejected" className="status-icon" />
              <h2>Status Rejected?</h2>
              <div className="dec">
                  Your request has been rejected. If you have any
                  questions or need further clarification, please
                  contact the admin. Thank you, <span>{user.user_email}</span>.
              </div>
              <div className="button_con">
                  <button className="view-details-button" onClick={() => setShowPopup(true)}>
                      View Full Details
                  </button>
                  <button className="view-details-button" onClick={handleApplyAgain}>
                      Apply Again
                  </button>
              </div>
          </div>

          {showPopup && <ComonPopup showPopup={showPopup} setShowPopup={setShowPopup}/>}
      </div> 
  );
};

export const PendingStatus = () => {
  const user = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  return (
  
      <div className="Dashboard_main_con">
          <div className="status-container">
              <img src={Status_Pending} alt="Status Pending" className="status-icon" />
              <h2>Status Pending!</h2>
              <div className="dec">
                  Your request is currently awaiting approval. The admin
                  will review it promptly and take the necessary action.
                  Thank you for your understanding, <span>{user.user_name}</span>.
              </div>
              <div className="button_con">
                  <button className="view-details-button" onClick={() => setShowPopup(true)}>
                      View Full Details
                  </button>
              </div>
          </div>
          {showPopup && <ComonPopup showPopup={showPopup} setShowPopup={setShowPopup}/>}
      </div> 
  );
};



export const BeforeAccept = () => {
  const [currentStep, setCurrentStep] = useState(1);



  const [is_Page1, setIs_Page1] = useState(true);
  const [is_Page2, setIs_Page2] = useState(true);
  const [is_Page3, setIs_Page3] = useState(true);
 

  const handleStepClick = (stepId) => {
    switch (stepId) {
      case 1:
        setCurrentStep(1);
        break;
      case 2:
        if (is_Page1) {
          setCurrentStep(2);
        } else {
          showWarningToast({message: "Please complete the User Profile section first!" });
        }
        break;
      case 3:
        if (is_Page1 && is_Page2) {
          setCurrentStep(3);
        } else {
          if (!is_Page1) {
            showWarningToast({message: "Please complete the User Profile section first!" });
          } else if (!is_Page2) {
            showWarningToast({message: "Please complete the Business Profile section first!" });
          }
        }
        break;
      case 4:
        if (is_Page1 && is_Page2 && is_Page3) {
          setCurrentStep(4);
        } else {
          if (!is_Page1) {
            showWarningToast({message: "Please complete the User Profile section first!" });
          } else if (!is_Page2) {
            showWarningToast({message: "Please complete the Business Profile section first!" });
          } else if (!is_Page3) {
            showWarningToast({message: "Please complete the Portfolio section first!" });
          }
        }
        break;
      default:
        break;
    }
  }
  return (
    <div className='before_accept_container'>


      <div className="content_section">
        
      <div className='progress_bar'>
        <div className='step_item'>
          <div 
            className={`step_number ${currentStep >= 1 ? 'active' : ''}`}
            onClick={() => handleStepClick(1)}
          >
            1
          </div>
          <div className='step_name'>User Profile</div>
          <div className={`connector ${currentStep > 1 ? 'active' : ''}`} />
        </div>

        <div className='step_item'>
          <div 
            className={`step_number ${currentStep >= 2 ? 'active' : ''}`}
            onClick={() => handleStepClick(2)}
          >
            2
          </div>
          <div className='step_name'>Business Profile</div>
          <div className={`connector ${currentStep > 2 ? 'active' : ''}`} />
        </div>

        <div className='step_item'>
          <div 
            className={`step_number ${currentStep >= 3 ? 'active' : ''}`}
            onClick={() => handleStepClick(3)}
          >
            3
          </div>
          <div className='step_name'>Portfolio</div>
          <div className={`connector ${currentStep > 3 ? 'active' : ''}`} />
        </div>

        <div className='step_item'>
          <div 
            className={`step_number ${currentStep >= 4 ? 'active' : ''}`}
            onClick={() => handleStepClick(4)}
          >
            4
          </div>
          <div className='step_name'>Equipments</div>
        </div>
      </div>
        {currentStep === 1 && <UserProfilePage  setIs_Page1={setIs_Page1} setCurrentStep={setCurrentStep}/>}
        {currentStep === 2 && <BusinessProfilePage  setIs_Page2={setIs_Page2} setCurrentStep={setCurrentStep}/>}
        {currentStep === 3 && <PortfolioPage  setIs_Page3={setIs_Page3} setCurrentStep={setCurrentStep}/>}
        {currentStep === 4 && <EquipmentsPage  setCurrentStep={setCurrentStep}/>}
      </div>

    </div>
  )
}

export default BeforeAccept;