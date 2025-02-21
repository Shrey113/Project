import React from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  Server_url,
  showRejectToast,
  showAcceptToast,
} from "../../../../../redux/AllData";
function ShowContextMenuForCalendar({
  contextMenuPosition,
  contextMenuEvent,
  setEvents,
  events,
  setShowContextMenu,
  setIsEditing,
  setShowEventDetails,
  setSelectedEvent,
}) {
  const handleEditEvent = () => {
    setIsEditing(true);
    setShowEventDetails(true);
    setSelectedEvent(contextMenuEvent);
    setShowContextMenu(false);
  };

  const handleViewEvent = () => {
    setIsEditing(false);
    setSelectedEvent(contextMenuEvent);
    setShowEventDetails(true);
    setShowContextMenu(false);
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(
        `${Server_url}/calendar/events/${contextMenuEvent.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.message === "Event deleted successfully") {
        setEvents(events.filter((event) => event.id !== contextMenuEvent.id));
        setShowContextMenu(false);
        showAcceptToast({ message: "Event deleted successfully" });
      } else if (data.error) {
        showRejectToast({ message: data.error });
      }
    } catch (err) {
      console.error("Error deleting event:", err.message);
    }
  };

  return (
    <div
      className="context-menu"
      style={{
        position: "fixed",
        top: contextMenuPosition.y,
        left: contextMenuPosition.x,
        zIndex: 1000,
      }}
    >
      <button onClick={handleViewEvent} className="context-menu-item">
        <FiEye />
        View Details
      </button>
      <div className="context-menu-divider" />
      <button onClick={handleEditEvent} className="context-menu-item">
        <FiEdit2 />
        Edit Event
      </button>
      <div className="context-menu-divider" />
      <button onClick={handleDeleteEvent} className="context-menu-item delete">
        <FiTrash2 />
        Delete Event
      </button>
    </div>
  );
}

export default ShowContextMenuForCalendar;
