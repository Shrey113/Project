import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import LoginRegisterOwener from "./Components/Owener/Login_Register.js";
import LoginRegisterClient from "./Components/Client/login_register.js";
import ShowLoder from "./Components/Owener/sub_components/show_loder.js";
import { useDispatch, useSelector } from "react-redux";
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf

import "./Components/Owener/css/Dashboard.css";
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf
// set etewt weewfsf
import HomePage from "./Components/Client/HomePage.js";

import PageNotFound from "./PageNotFound.js";

import {
  localstorage_key_for_client,
  localstorage_key_for_jwt_user_side_key,
  Server_url,
  localstorage_key_for_admin_login,
} from "./redux/AllData.js";
// import Admin from "./Components/Admin/Admin.js";
import BeforeLogin from "./Components/BeforeLogin/BeforeLogin.js";
import Admin2 from "./Components/Admin_2/Admin.js";

// import Admin from "./Components/Admin/Admin.js";
// import Calendar from "./Components/Admin_2/sub_part/Calendar.js";

import socket from "./redux/socket.js";
import OwnerSideBar from "./Components/Owener/Owner_side_bar.js";
import OwnerHome from "./Components/Owener/sub_part/OwnerHome";
import TeamOverview from "./Components/Owener/sub_part/TeamOverview";


// import Search_photographer from "./Components/Owener/sub_part/Search_photographer/Search_photographer.js";
import Profile from "./Components/Owener/profile_part_2/Profile";
import Search_photographer from "./Components/Owener/sub_part/Search_photographer/Search_photographer.js";
import DetailedView from "./Components/Owener/sub_part/Search_photographer/sub_part/DetailedView.js";
import OwnerDetails from "./Components/Owener/sub_part/Search_photographer/sub_part/OwnerDetails.js";
// import Profile from "./Components/Owener/sub_part/Profile.js";

// https://trello.com/b/mpwGf27w/msu-project



import EventManagement from "./Components/Owener/sub_part/Event Management/EventManagement.js";
import Packages from "./Components/Owener/sub_part/Packages/Packages.js";
import {
  BeforeAccept,
  PendingStatus,
  RejectedStatus,
} from "./Components/Owener/before accept/before_accept.js";

import TableToggleButtons from "./Components/Owener/sub_part/Invoic_part/Sub_component/TableToggleButtons.js";
import { Toaster } from "react-hot-toast";

import OwnerNavbar from "./Components/Owener/OwnerNavbar.js";
// import Calendar from "./Components/Owener/sub_part/Calendar/Calendar.js";

import AllPhotoFiles from "./Components/Owener/sub_part/Search_photographer/sub_part/AllPhotoFiles.js";

function App() {
  const [authStatus, setAuthStatus] = useState({
    Admin: null,
    owner: null,
    client: null,
  });


  const [OwnerStatus, setOwnerStatus] = useState("");


  const { owner_email } = useParams();

  const dispatch = useDispatch();
  const isMobile = useSelector((state) => state.user.isMobile);

  // const activeIndex = useSelector((state) => state.user.activeIndex);



  // useEffect(() => {
  //   const handleResize = () => {
  //     const isMobileView = window.innerWidth <= 1200;
  //     dispatch({
  //       type: "SET_USER_Owner",
  //       payload: {
  //         isMobile: isMobileView,
  //         isSidebarOpen: !isMobileView,
  //       },
  //     });
  //   };

  //   handleResize(); // Call initially
  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []); // No dependencies since `dispatch` is stable in Redux

  useEffect(() => {
    const setActiveIndex = (value) => {
      dispatch({
        type: "SET_USER_Owner",
        payload: {
          activeIndex: value,
        },
      });
    };



    const location = window.location.pathname;
    if (location === "/Owner") {
      setActiveIndex(0);
    } else if (location === "/Owner/Event") {
      setActiveIndex(1);
    } else if (location === "/Owner/Team") {
      setActiveIndex(2);
    } else if (location === "/Owner/Invoice") {
      setActiveIndex(3);
    } else if (location === "/Owner/Packages") {
      setActiveIndex(4);
    } else if (location === "/Owner/search_photographer") {
      setActiveIndex(5);
    } else if (location === "/Owner/Event/packages") {
      setActiveIndex(1.1);
    } else if (location === "/Owner/Event/equipment") {
      setActiveIndex(1.2);
    } else if (location === "/Owner/Profile") {
      setActiveIndex(8);
    }

  }, [dispatch, owner_email]);

  const renderStatus = () => {
    switch (OwnerStatus) {
      case "Reject":
        return <RejectedStatus />;
      case null:
        return <BeforeAccept />;
      case "Pending":
        return <PendingStatus />;
      default:
        return null;
    }
  };

  const SetOwnerPage = ({ ActivePage, category }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const location = window.location.pathname;
    return OwnerStatus === "Accept" ? (
      <div
        className={`Owner_main_home_pag_con ${isMobile ? "for_mobile" : ""} 
          }`}
      >
        <div className="main_part">

          <OwnerNavbar

            searchTerm={location === "/Owner/search_photographer" ? searchTerm : ''}

            setSearchTerm={location === "/Owner/search_photographer" ? setSearchTerm : ''} />



          <ActivePage

            category={category}

            searchTerm={searchTerm}

            setSearchTerm={setSearchTerm} />
        </div>
      </div>
    ) : (
      renderStatus()
    );
  };

  // 1. Check Admin Token
  useEffect(() => {
    const checkAdminToken = async () => {
      const jwtToken = localStorage.getItem(localstorage_key_for_admin_login);
      if (!jwtToken) return;

      try {
        const response = await fetch(`${Server_url}/Admin/check-jwt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: jwtToken }),
        });

        const result = await response.json();
        if (response.ok) {
          result.message === "Token is valid" &&
            setAuthStatus((prev) => ({ ...prev, admin: true }));
        } else {
          setAuthStatus((prev) => ({ ...prev, admin: false }));
        }
      } catch (err) {
        console.error("Admin token check error:", err);
        setAuthStatus((prev) => ({ ...prev, admin: false }));
      }
    };

    checkAdminToken();
  }, []);

  // 2. Check Owner and Client Token
  useEffect(() => {
    const authenticateUser = async () => {
      const ownerToken = window.localStorage.getItem(
        localstorage_key_for_jwt_user_side_key
      );
      const clientToken = window.localStorage.getItem(
        localstorage_key_for_client
      );

      try {
        // 1
        if (ownerToken) {
          const response = await fetch(`${Server_url}/get_user_data_from_jwt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jwt_token: ownerToken }),
          });

          const data = await response.json();

          if (data.user) {
            dispatch({
              type: "SET_USER_Owner",
              payload: {
                client_id: data.user.client_id || null,
                user_name: data.user.user_name || null,
                user_email: data.user.user_email || null,
                user_password: data.user.user_password || null,
                business_name: data.user.business_name || null,
                business_address: data.user.business_address || null,
                mobile_number: data.user.mobile_number || null,
                gst_number: data.user.gst_number || null,
                user_Status: data.user.user_Status || null,
                admin_message: data.user.admin_message || null,
                set_status_by_admin: data.user.set_status_by_admin || null,
                first_name: data.user.first_name || null,
                last_name: data.user.last_name || null,
                gender: data.user.gender || null,
                social_media: data.user.social_media || null,
                website: data.user.website || null,
                services: data.user.services || null,
                business_email: data.user.business_email || null,

                business_profile_base64:
                  data.user.business_profile_base64 || null,
                user_profile_image_base64:
                  data.user.user_profile_image_base64 || null,
              },
            });

            setOwnerStatus(data.user.user_Status);

            setAuthStatus((prev) => ({ ...prev, owner: true }));
          } else {
            setAuthStatus((prev) => ({ ...prev, owner: false }));
          }
        } else {
          setAuthStatus((prev) => ({ ...prev, owner: false }));
        }
        // 2
        if (clientToken) {
          const response = await fetch(
            `${Server_url}/get_client_data_from_jwt`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jwt_token: clientToken }),
            }
          );

          const data = await response.json();
          if (data.user) {
            dispatch({
              type: "SET_USER_Client",
              payload: {
                client_id: 1,
                user_name: data.user.user_name || null,
                user_email: data.user.user_email || null,
                user_password: data.user.user_password || null,
                business_name: data.user.business_name || null,
                business_address: data.user.business_address || null,
                mobile_number: data.user.mobile_number || null,
                gst_number: data.user.gst_number || null,
              },
            });
            setAuthStatus((prev) => ({ ...prev, client: true }));
          } else {
            setAuthStatus((prev) => ({ ...prev, client: false }));
          }
        } else {
          setAuthStatus((prev) => ({ ...prev, client: false }));
        }
        //  last
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthStatus({ owner: false, client: false });
      }
    };

    authenticateUser();
  }, [dispatch]);

  // 3. Show Loader
  if (
    authStatus.owner === null ||
    authStatus.client === null ||
    authStatus.admin === null
  ) {
    return <ShowLoder />;
  }

  return (
    <Router>
      <Routes>
        {/* testing part */}
        <Route path="/Admin2" element={<Admin2 socket={socket} />} />
        {/* <Route path="/Admin1" element={<Admin/> } /> */}
        <Route path="/BeforeLogin" element={<BeforeLogin />} />

        {/* Default route */}
        <Route
          path="/"
          element={
            authStatus.client ? (
              <HomePage />
            ) : authStatus.owner ? (
              <SetOwnerPage ActivePage={OwnerHome} />
            ) : authStatus.admin ? (
              <Admin2 />
            ) : (
              <BeforeLogin />
            )
          }
        />

        {/* Client routes */}
        <Route
          path="/Client"
          element={authStatus.client ? <HomePage /> : <LoginRegisterClient />}
        />
        <Route
          path="/Client/HomePage"
          element={authStatus.client ? <HomePage /> : <LoginRegisterClient />}
        />

        {/* -------------------------------------------------------------------------------------------------------------- */}

        {/* Owner routes */}
        <Route
          path="/Owner"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={OwnerHome} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        {/* Owner routes Event Management */}
        {/* <Route
          path="/Owner/Event"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={EventManagement} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        /> */}
        <Route
          path="/Owner/Event/packages"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={EventManagement} category="Packages" />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />
        <Route
          path="/Owner/Event/equipment"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={EventManagement} category="Equipment" />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        {/* Owner routes Team Management */}
        <Route
          path="/Owner/Team"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={TeamOverview} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        {/* Owner routes Invoice */}
        <Route
          path="/Owner/Invoice"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={TableToggleButtons} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />


        {/* Owner routes Packages */}
        <Route
          path="/Owner/Packages"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={Packages} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        {/* Owner routes calendar */}
        {/* <Route path="/Owner/calendar" element={authStatus.owner ? 
          <SetOwnerPage ActivePage={Calendar} /> : 
          <LoginRegisterOwener />
        } /> */}

        <Route
          path="/Owner/search_photographer"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={Search_photographer} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        <Route
          path="/Owner/search_photographer/:owner_email"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={OwnerDetails} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />
        <Route
          path="/Owner/search_photographer/:owner_email/:type"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={DetailedView} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        <Route
          path="/Owner/search_photographer/:owner_email/all_photos"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={AllPhotoFiles} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        <Route
          path="/Owner/Profile"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={Profile} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        {/* -------------------------------------------------------------------------------------------------------------- */}

        <Route
          path="/Owner_profile/search_photographer/:owner_email"
          element={
            authStatus.owner ? (
              <SetOwnerPage ActivePage={OwnerDetails} />
            ) : (
              <LoginRegisterOwener />
            )
          }
        />

        <Route
          path="/Owner/share_profile/:owner_email"
          element={<OwnerDetails />
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {authStatus.owner && OwnerStatus === "Accept" && !window.location.pathname.includes("/Owner/share_profile") && (
        <OwnerSideBar />
      )}

      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
