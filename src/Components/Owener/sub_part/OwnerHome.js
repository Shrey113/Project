import React   from 'react';
import { useSelector } from 'react-redux';
import './OwnerHome.css';
// import Search from './Dashboard/part/search.js';
import Calendar from './Calendar/Calendar.js';
// import Scheduler from './Dashboard/part/Scheduler.js';
// import Uploadfile from './Dashboard/test_data.js';


function OwnerHome() {
  const user = useSelector((state) => state.user);

  return (
    <div className='owner_home_page_container'>
              <div className="user_data">
          <div className="user_name">Hey, {user.user_name} 👋</div>
          <div className="user_message">
            Here's what's happening in your workspace
          </div>
        </div>

    {/* <Search/> */}
    <Calendar/>
    {/* <Uploadfile/> */}
    {/* <Scheduler/> */}
      <div className="title_bar">

      </div>
    </div>
  );
}

export default OwnerHome;
