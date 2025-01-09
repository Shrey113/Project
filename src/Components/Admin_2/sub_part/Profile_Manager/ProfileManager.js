import React, {useState, useEffect } from 'react'
import './ProfileManager.css'
import AdminDataList from './sub_part/AdminDataList';
import OwnerManager from './sub_part/OwnerManager.js'
import { Server_url } from '../../../../redux/AllData.js';




function ProfileManager({admin_email}) {

  const [accessType, setAccessType] = useState(null);
  let email = admin_email;

  useEffect(() => {
   
    const fetchAdminAccessType = async () => {
      try {
        const response = await fetch(`${Server_url}/get_admin_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          
          return;
        }

        const data = await response.json();
        console.log(data);
        
        setAccessType(data.access_type);

      } catch (err) {
        console.log(err);
        
      }
    };

    if (email) {
      fetchAdminAccessType();
    }
  }, [email]);
  return (
    <div className='ProfileManager'>
      <OwnerManager admin_email={admin_email}/>
      <AdminDataList admin_email={admin_email} accessType={accessType}/>
    
    </div>
  )
}

export default ProfileManager;
