import React, { useState, useEffect } from "react";

import search_icon from "./../../img/search.png";
import setting_icon from "./../../img/setting.png";
// import bell_b_icon from "./../../img/bell_b.png";

import "./res_css.css";


// import test_0 from "./bg/test_1.webp";

import user_profile from "./../Dashboard/profile_pic/user2.jpg";


// import icon_1 from './sub_part/sub_img/icon-biology.png'
// import credit_card_icon from './../../img/profile/credit-card.png'
// import shield_icon from './../../img/profile/shield.png'
// import wallet_icon from './../../img/profile/wallet.png'


// const Profile = ()=>{


//     return (
//       <div className="profile_con_full">
//       <div className="user_con">


//         <div className="data">
//           <div className="user_profile">
//             <img src={user_profile} alt="" />
//           </div>


//         <div className="profile_data">
//           <div className="name">Shrey Patel</div>
//           <div className="type">Admin</div>
//           <div className="email">info@gmail.com</div>
//         </div>

//         </div>

//         <div className="more_option">

//           <div className="more_data">
//             <div className="icon" style={{background:"#e5f3fb"}}>
//               <img src={wallet_icon} alt="" />
//             </div>
//             <div className="info" >
//               <div className="name">My Profile</div>
//               <div className="name_info">Account Settings</div>
//             </div>
//           </div>


//           <div className="more_data">
//             <div className="icon" style={{background:"#defff2"}}>
//               <img src={shield_icon} alt="" />
//             </div>
//             <div className="info">
//               <div className="name">My Inbox</div>
//               <div className="name_info">Messages & Email</div>
//             </div>
//           </div>

//           <div className="more_data">
//             <div className="icon" style={{background:"#feece9"}}>
//               <img src={credit_card_icon} alt="" />
//             </div>
//             <div className="info">
//               <div className="name">My Tasks</div>
//               <div className="name_info">To-do and Daily Tasks</div>
//             </div>
//           </div>


//           <button>Logout</button>

//         </div>


//       </div>

//     </div>
//     )
//   }

function TitleBar({ adminSettings, setActiveRow, activeRow, admin_email }) {

  // const [show_user_profile, set_show_user_profile] = useState(false);

  // State for profile image
  const [profileImage, setProfileImage] = useState(user_profile);

  // Load profile image from localStorage when component mounts
  useEffect(() => {
    if (admin_email) {
      const savedImage = localStorage.getItem(`profile_picture_${admin_email}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [admin_email]);



  const getTitleInfo = () => {
    switch (activeRow) {
      case 0:
        return { title: "Dashboard", info: "Payment Updates" };
      case 1:
        return { title: "Database Manager", info: "Profile Management" };
      case 2:
        return { title: "Analytics", info: "Data Visualization" };
      case 3:
        return { title: "Admin Profile", info: "Account Information" };
      case 4:
        return { title: "Settings", info: "Application Configuration" };
      default:
        return { title: "Dashboard", info: "Payment Updates" };
    }
  };

  const titleInfo = getTitleInfo();

  return (
    <div className={`title_bar ${adminSettings?.show_navbar ? 'fixed_navbar' : ''}`}>
      <div className="left_title_con">
        <div className="title">{titleInfo.title}</div>
        <div className="title_info">{titleInfo.info}</div>
      </div>

      <div className="custom_input">
        <div className="icon">
          <img src={search_icon} alt="" />
        </div>
        <input type="text" placeholder="Search" />
      </div>

      <div className="other_option">

        {/* <div className="icon" >
        <img src={bell_b_icon} alt="" />
      </div> */}
        <div className="icon" onClick={() => { setActiveRow(4) }}>
          <img src={setting_icon} alt="" />
        </div>
        <div className="profile_con" onClick={() => { setActiveRow(3) }}>
          <div className="profile">
            <img src={profileImage} alt="" />
          </div>
          <div className="data">
            <div className="name">Shrey Patel</div>
            <div className="type">Admin</div>
          </div>
        </div>
      </div>




    </div>
  )
}

export default TitleBar
