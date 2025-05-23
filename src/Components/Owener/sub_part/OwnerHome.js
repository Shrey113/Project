import React from "react";
import "./OwnerHome.css";
import Calendar from "./Calendar/Calendar.js";
import {
  FaCalendarAlt,
  FaUsers,
  FaFileInvoiceDollar,
  // FaBoxOpen,
} from "react-icons/fa";
import { Server_url } from "../../../redux/AllData.js";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import welcome_bg from "./Calendar/custom_css/welcome-bg.png";
import { useCount } from "./../../../redux/CountContext.js";

function OwnerHome() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { count } = useCount();

  // const [package_count, set_package_count] = useState(0);

  const userName = user.user_name;
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const [todayEvents, setTodayEvents] = React.useState({
    total: 0,
    events: [],
  });
  const [teamStatus, setTeamStatus] = React.useState({
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
  });

  const setActiveIndex = (value, path) => {
    dispatch({
      type: "SET_USER_Owner",
      payload: {
        activeIndex: value,
      },
    });
    navigate(`/Owner/${path}`);
  };

  React.useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const response = await fetch(
          `${Server_url}/calendar/get_all_today_events`
        );
        const data = await response.json();
        setTodayEvents({
          total: data.total_events,
          events: data.events,
        });
      } catch (error) {
        console.error("Error fetching today's events:", error);
      }
    };

    const fetchTeamStatus = async () => {
      try {
        const response = await fetch(`${Server_url}/team_members/team_status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner_email: user.user_email,
          }),
        });
        const data = await response.json();
        setTeamStatus(data);
      } catch (error) {
        console.error("Error fetching team status:", error);
      }
    };

    fetchTodayEvents();
    fetchTeamStatus();
  }, [user.user_email]);

  const getGreeting = (user_email) => {
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // useEffect(() => {
  //   const fetchPackageCount = async (user_email) => {
  //     try {
  //       const response = await fetch(`${Server_url}/fetch_package_count`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           owner_email: user_email,
  //         }),
  //       });
  //       const data = await response.json();
  //       if (!response.ok) {
  //         console.log("error fetching packages ");
  //       }
  //       set_package_count(data.package_count);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchPackageCount(user.user_email);
  // }, [user.user_email]);

  return (
    <div className="owner_home_page_container">
      <div className="welcome_section">
        <div className="welcome_text">
          <h1>
            {getGreeting()}, <span className="highlight">{userName}</span>!
          </h1>
          <p className="subtitle">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="current_date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <img src={welcome_bg} alt="welcome_bg" className="welcome_bg" />
      </div>

      <div className="dashboard_cards_container">
        {/* Today's Events Card */}
        <div className="dashboard_card">
          <div className="card_icon events">
            <FaCalendarAlt />
          </div>
          <div className="card_content">
            <h3>Today's Events</h3>
            <p className="number">{todayEvents.total}</p>
            <p className="label">Events Today</p>
          </div>
        </div>

        {/* Team Management Card */}
        <div
          className="dashboard_card"
          onClick={() => setActiveIndex(2, "Team")}
        >
          <div className="card_icon team">
            <FaUsers />
          </div>
          <div className="card_content">
            <h3>Team Status</h3>
            <p className="number">{teamStatus.total_members}</p>
            <div className="status-pills">
              <span className="status-pill active">
                {teamStatus.active_members} Available
              </span>
              <span className="status-pill busy">
                {teamStatus.inactive_members} Busy
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Card */}
        <div
          className="dashboard_card"
          onClick={() => setActiveIndex(3, "Invoice")}
        >
          <div className="card_icon invoice">
            <FaFileInvoiceDollar />
          </div>
          <div className="card_content">
            <h3>Pending Invoices</h3>
            <p className="number">{count}</p>
            <p className="label">Draft Invoices</p>
          </div>
        </div>

        {/* Packages Card */}
        {/* <div
          className="dashboard_card"
          onClick={() => setActiveIndex(4, "Packages")}
        >
          <div className="card_icon packages">
            <FaBoxOpen />
          </div>
          <div className="card_content">
            <h3>Active Packages</h3>
            <p className="number">{package_count}</p>
            <p className="label">Packages</p>
          </div>
        </div> */}
      </div>
      <Calendar />
    </div>
  );
}

export default OwnerHome;
