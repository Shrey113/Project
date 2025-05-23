import React, { useState, useEffect } from 'react';
import './welcome_user.css';
import Notification from './sub_part/Notification';

import user_icon_1 from './profile_pic/user1.jpg';
// import user_icon_2 from './profile_pic/user2.jpg';
// import user_icon_3 from './profile_pic/user3.jpg';
// import user_icon_4 from './profile_pic/user4.jpg';

import socket from './../../../../redux/socket.js'

import { Server_url } from '../../../../redux/AllData.js';

function WelcomeUser({ setActiveRow }) {
  const [notifications, setNotifications] = useState([]);



  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${Server_url}/notifications_for_test`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setNotifications(data);  // Set the notifications data
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    // Socket event listener
    socket.on('new_notification', (message) => {
      console.log('Notification received:', message);
      fetchNotifications();
    });


    // Cleanup function
    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };

  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Function to format time in 12-hour format (HH:MM AM/PM)
  const formatTime = (createdAt) => {
    const date = new Date(createdAt);  // Convert the string to a Date object
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';  // AM/PM logic
    hours = hours % 12;  // Convert to 12-hour format
    hours = hours ? hours : 12;  // The hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;  // Pad single digit minutes
    return `${hours}:${strMinutes} ${ampm}`;  // Format time as "HH:MM AM/PM"
  };

  // Filter notifications with notification_type "padding_owner"
  const filteredNotifications = notifications.filter(
    (notification) => notification.notification_type === 'padding_owner'
  );



  return (
    <div className='welcome_message_con'>
      <h2>Latest Notifications</h2>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <Notification
            key={notification.id}
            notificationType={notification.notification_type}
            notificationTitle={notification.notification_title}
            notificationMessage={notification.notification_message}
            notificationTime={formatTime(notification.created_at)}
            onClick={() => setActiveRow(1)}
            set_img={user_icon_1}
          />
        ))
      ) : (
        <div className="set_me_set" >No padding owner notifications found.</div>
      )}
    </div>
  );
}

export default WelcomeUser;
