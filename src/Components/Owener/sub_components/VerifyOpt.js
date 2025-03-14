import React, { useState } from 'react';
import './../css/VerifyOpt.css';

import ShowLoder from './../sub_components/show_loder.js';
// import {local_storage_key} from './sub_component/All_data.js'
import close_button from './../../../Assets/Owener/cross.png'

import {localstorage_key_for_jwt_user_side_key,Server_url,showAcceptToast,showRejectToast,ConfirmMessage} from './../../../redux/AllData.js'

function VerifyOpt({ user_name,
  user_email,
  user_password,
  business_name,
  business_address,
  mobile_number,
  GST_number
  , close_function }) {
  const [show_loder, set_show_loder] = useState(false);

 

  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    button_text: "",
    onConfirm: () => {},
  });



  const [OTP, set_OTP] = useState('');

  function set_input_otp(input) {
    set_OTP(input);
  }

  function close_me(){
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Are you sure you want to close?",
      message: "OTP will not be verified if you close",
      button_text: "Close",
      onConfirm: () => {
        close_function()
      }
    });
  }

  const verify_opt = (e) => {
    e.preventDefault();
    fetch(`${Server_url}/owner/verify_otp_owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          type:"owener",
          user_send_otp: OTP,
          user_name: user_name,
          user_email: user_email,
          user_password: user_password,
          business_name: business_name,
          business_address: business_address,
          mobile_number: mobile_number,
          GST_number: GST_number,
        }
      ),
    })
      .then((response) => {
        if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json();
      }).then((data) => {
        if (data.message === "OTP verified successfully") {
          console.log("OTP verification passed");
          set_show_loder(true);
          setTimeout(() => {
            set_show_loder(false);
            if(data.user_key){
              showAcceptToast({message: "OTP verified successfully" });
              localStorage.setItem(localstorage_key_for_jwt_user_side_key,data.user_key)                
            }else{
              showRejectToast({message: "Not able to store a Data" });
            }
            window.location.reload();
          }, 1000);
        } else {  
          showRejectToast({message: "OTP NOT match" });
          console.log("Message not matched:", data.message);
        }
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  return (
    <div className="verify-opt-container">
      <form onSubmit={verify_opt}>
        {show_loder && <ShowLoder />}
        <span htmlFor="OTP">Verify OTP</span>
        <input
          type="text"
          id="OTP"
          placeholder="Enter your OTP"
          value={OTP}
          onChange={(e) => set_input_otp(e.target.value)}
        />
        <input type="submit" />
        <p className="message"><strong>OTP</strong> will be send on <strong>register email {user_email}</strong>.</p>
              <div onClick={close_me} className='close_con'>
        <img src={close_button} alt="close me" />
      </div>
      </form>

      {
        showDeleteConfirm.isVisible && (
          <ConfirmMessage message_title={showDeleteConfirm.message_title} message={showDeleteConfirm.message} 
          onCancel={() => setShowDeleteConfirm({...showDeleteConfirm, isVisible:false})} onConfirm={showDeleteConfirm.onConfirm} 
          button_text={showDeleteConfirm.button_text}/>
        )
      }

    </div>
  );
}

export default VerifyOpt;
