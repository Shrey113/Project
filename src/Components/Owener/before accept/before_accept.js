import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import "./before_accept.css"


import BusinessProfilePage from './sub_part/BusinessProfilePage'
import EquipmentsPage from './sub_part/equipmentsPage'
import PortfolioPage from './sub_part/portfolioPage'
import UserProfilePage from './sub_part/UserProfilePage'

import Status_Pending from './../../../Assets/Owener/file.gif';
import Status_rejected from './../../../Assets/Owener/rejected.gif';
import {Server_url,localstorage_key_for_client,showWarningToast} from './../../../redux/AllData.js';
import socket  from './../../../redux/socket.js';


const ComonPopup = ({showPopup,setShowPopup}) => {
  const user = useSelector((state) => state.user);
  const user_Status = user.user_Status;

  return (
    <div className="Dashboard_main_con">
        {/* Pop-up Modal */}
        {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
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
  useEffect(() => {
    socket.on(`user_status_updated_${user.user_email}`, (data) => {
      console.log(data);
      if(data.user_Status === 'Accept'){
        window.location.reload();
      }
    });
    return () => {
      socket.off(`user_status_updated_${user.user_email}`);
    };
  }, [user.user_email]);
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
  const [pageStatus, setPageStatus] = useState({
    page1: false,
    page2: false,
    page3: false,
    page4: false
  });

  const user = useSelector((state) => state.user);

  useEffect(() => {
    window.scrollTo(0, 0);
    if(currentStep === 1){
      document.querySelector('.before_accept_container .content_section').style.transition = 'max-width 0.5s ease';
      document.querySelector('.before_accept_container .content_section').style.maxWidth = '980px';
    } else if(currentStep === 2){
      document.querySelector('.before_accept_container .content_section').style.transition = 'max-width 0.5s ease';
      document.querySelector('.before_accept_container .content_section').style.maxWidth = '980px';
    }
    else if(currentStep === 4){
      document.querySelector('.before_accept_container .content_section').style.transition = 'max-width 0.1s ease';
      document.querySelector('.before_accept_container .content_section').style.maxWidth = '1400px';
    }else{
      document.querySelector('.before_accept_container .content_section').style.transition = 'max-width 0.5s ease';
      document.querySelector('.before_accept_container .content_section').style.maxWidth = '1200px';
    }
    
  }, [currentStep]);

  const handleStepClick = (stepId) => {
    const canProceed = () => {
      switch (stepId) {
        case 1:
          return true;
        case 2:
          return pageStatus.page1;
        case 3:
          return pageStatus.page1 && pageStatus.page2;
        case 4:
          return pageStatus.page1 && pageStatus.page2 && pageStatus.page3;
        default:
          return false;
      }
    };

    if (canProceed()) {
      setCurrentStep(stepId);
    } else {
      if (!pageStatus.page1) {
        showWarningToast({message: "Please complete the User Profile section first!"});
      } else if (!pageStatus.page2) {
        showWarningToast({message: "Please complete the Business Profile section first!"});
      } else if (!pageStatus.page3) {
        showWarningToast({message: "Please complete the Portfolio section first!"});
      }
    }
  };

  const updatePageStatus = (page, status) => {
    setPageStatus(prev => ({
      ...prev,
      [page]: status
    }));
  };

  function get_width_of_progress_bar(currentStep){
    if(currentStep === 1){
      return 5;
    }else if(currentStep === 2){
      return 35;
    }else if(currentStep === 3){
      return 65;
    }else if(currentStep === 4){
      return 95;
    }
  }

  return (
    <div className='before_accept_container'>
      <div className="content_section">
        <div className="welcome_header">
          <h1>Hey {user.user_name}! 👋</h1>
          <p>Let's complete your profile to get started</p>
        </div>

        <div className='progress_bar'>
          <div className='progress_line'>
            <div 
              className='progress_completed' 
              style={{
                width: `${get_width_of_progress_bar(currentStep)}%`
              }}
            />
          </div>
          
          <div className='steps_container'>
            <div className='step_item'>
              <div 
                className={`step_circle ${currentStep >= 1 ? 'active' : ''}`}
                onClick={() => handleStepClick(1)}
              >
                1
              </div>
              <div className='step_label'>User Profile</div>
            </div>

            <div className='step_item'>
              <div 
                className={`step_circle ${currentStep >= 2 ? 'active' : ''}`}
                onClick={() => handleStepClick(2)}
              >
                2
              </div>
              <div className='step_label'>Business Profile</div>
            </div>

            <div className='step_item'>
              <div 
                className={`step_circle ${currentStep >= 3 ? 'active' : ''}`}
                onClick={() => handleStepClick(3)}
              >
                3
              </div>
              <div className='step_label'>Portfolio</div>
            </div>

            <div className='step_item'>
              <div 
                className={`step_circle ${currentStep >= 4 ? 'active' : ''}`}
                onClick={() => handleStepClick(4)}
              >
                4
              </div>
              <div className='step_label'>Equipments</div>
            </div>
          </div>
        </div>

        {/* Component rendering based on current step */}
        {currentStep === 1 && (
          <UserProfilePage
            setIs_Page1={(status) => updatePageStatus('page1', status)}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 2 && (
          <BusinessProfilePage
            setIs_Page2={(status) => updatePageStatus('page2', status)}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 3 && (
          <PortfolioPage
            setIs_Page3={(status) => updatePageStatus('page3', status)}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 4 && (
          <EquipmentsPage
            setIs_Page4={(status) => updatePageStatus('page4', status)}
            setCurrentStep={setCurrentStep}
          />
        )}
      </div>
    </div>
  );
};

export default BeforeAccept;