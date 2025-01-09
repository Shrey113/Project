import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import "./before_accept.css"

import BusinessProfilePage from './sub_part/BusinessProfilePage'
import EquipmentsPage from './sub_part/equipmentsPage'
import PortfolioPage from './sub_part/portfolioPage'
import UserProfilePage from './sub_part/UserProfilePage'



function BeforeAccept() {
  const user = useSelector((state) => state.user);
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
          alert("Please complete the User Profile section first!");
        }
        break;
      case 3:
        if (is_Page1 && is_Page2) {
          setCurrentStep(3);
        } else {
          if (!is_Page1) {
            alert("Please complete the User Profile section first!");
          } else if (!is_Page2) {
            alert("Please complete the Business Profile section first!");
          }
        }
        break;
      case 4:
        if (is_Page1 && is_Page2 && is_Page3) {
          setCurrentStep(4);
        } else {
          if (!is_Page1) {
            alert("Please complete the User Profile section first!");
          } else if (!is_Page2) {
            alert("Please complete the Business Profile section first!");
          } else if (!is_Page3) {
            alert("Please complete the Portfolio section first!");
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
      <h1>Hi {user.user_name}👋, Let's complete your profile!</h1>
      <br />
      <br />
        
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

export default BeforeAccept