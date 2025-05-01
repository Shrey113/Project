import { useEffect } from 'react';
import { Server_url } from "../../../../redux/AllData";
import axios from "axios";
import socket from "../../../../redux/socket";

/**
 * Component to handle event status updates based on time and team confirmations
 * 
 * This component will:
 * 1. Check for events with end times that have passed and update their status
 * 2. Check for team confirmations and update event status accordingly
 */
const EventStatusUpdater = ({ user_email, updateReceivedData }) => {
  useEffect(() => {
    if (!user_email) return;

    // Function to check for past events and update their status
    const checkPastEvents = async () => {
      try {
        const response = await axios.get(`${Server_url}/team_members/check-past-events/${user_email}`);
        if (response.data.updated) {
          // If any events were updated, refresh the data
          updateReceivedData();
        }
      } catch (error) {
        console.error("Error checking past events:", error);
      }
    };

    // Check past events initially and set up interval
    checkPastEvents();
    const pastEventsInterval = setInterval(checkPastEvents, 60000 * 10); // Check every 10 minutes

    // Set up socket listeners for team member confirmations
    if (socket) {
      // Listen for event-confirmation updates
      socket.on(`event-confirmation-updated`, (data) => {
        if (data.receiver_email === user_email) {
          updateReceivedData();
        }
      });

      // Listen for event status changes
      socket.on(`event-status-update-${user_email}`, () => {
        updateReceivedData();
      });
    }

    return () => {
      clearInterval(pastEventsInterval);

      if (socket) {
        socket.off(`event-confirmation-updated`);
        socket.off(`event-status-update-${user_email}`);
      }
    };
  }, [user_email, updateReceivedData]);

  // This is a utility component with no UI
  return null;
};

export default EventStatusUpdater; 