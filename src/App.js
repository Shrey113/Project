import {
  Route,
  Routes,
  // useParams,
} from "react-router-dom";
import "./App.css"
import React, { useState, useEffect } from "react";
import LoginRegisterOwener from "./Components/Owener/Login_Register.js";
import LoginRegisterClient from "./Components/Client/login_register.js";
import ShowLoder from "./Components/Owener/sub_components/show_loder.js";
import { useDispatch, useSelector } from "react-redux";
import { UIProvider } from "./redux/UIContext.js";
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
// import BeforeLogin from "./Components/BeforeLogin/BeforeLogin.js";
import BeforeLogin2 from "./Components/BeforeLogin/new_design/BeforeLogin2.js"
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
import AllServices from "./Components/Owener/sub_part/Search_photographer/sub_part/AllServices .js";
import StackingCards from "./Components/BeforeLogin/new_design/StackingCards/StackingCards.js";
import OwnerLayout from "./Components/Owener/OwnerLayout.js";
import DriveMainPage from "./Components/Owener/sub_part/DrivePart/drive_main_page.js";
import DriveHome from "./Components/Owener/sub_part/DrivePart/DriveHome.js";
import SharedFilesPage from "./Components/Owener/sub_part/DrivePart/SharedFiles/SharedFilesPage.js";
import StarredItems from "./Components/Owener/sub_part/DrivePart/StarredItems.js";


function App() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Socket connection management with useEffect
  useEffect(() => {
    // Only emit if we have a valid email
    if (user.user_email) {
      socket.emit('user_connected', { email: user.user_email });

      return () => {
        socket.emit('user_disconnected', { email: user.user_email });
        socket.off('disconnect');
      };
    }
  }, [user.user_email]);

  const [authStatus, setAuthStatus] = useState({
    Admin: null,
    owner: null,
    client: null,
  });

  const [OwnerStatus, setOwnerStatus] = useState("");

  // const { owner_email } = useParams();

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
    const [selectedLocation, setSelectedLocation] = useState("all");
    const location = window.location.pathname;

    return OwnerStatus === "Accept" ? (
      <OwnerLayout>
        <OwnerNavbar
          searchTerm={location === "/Owner/search_photographer" ? searchTerm : ''}
          setSearchTerm={location === "/Owner/search_photographer" ? setSearchTerm : ''}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        <ActivePage
          category={category}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        <div className="footer-bottom">
          <p>&copy; 2025 Photography Hub. All rights reserved.</p>
        </div>
      </OwnerLayout>
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
            // Create a payload with only the fields that have changed
            const userFields = [
              'client_id', 'user_name', 'user_email', 'user_password',
              'business_name', 'business_address', 'mobile_number',
              'gst_number', 'user_Status', 'admin_message',
              'set_status_by_admin', 'first_name', 'last_name', 'gender',
              'social_media', 'website', 'services', 'business_email',
              'business_profile_base64', 'user_profile_image_base64'
            ];

            const payload = {};
            let hasChanges = false;

            userFields.forEach(field => {
              const newValue = data.user[field] || null;
              if (user[field] !== newValue) {
                payload[field] = newValue;
                hasChanges = true;
              }
            });

            // Only dispatch if there are actual changes
            if (hasChanges) {
              dispatch({
                type: "SET_USER_Owner",
                payload
              });
            }

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
  }, [dispatch, user]);

  // 3. Show Loader
  if (
    authStatus.owner === null ||
    authStatus.client === null ||
    authStatus.admin === null
  ) {
    return <ShowLoder />;
  }

  return (
    <UIProvider>
      <>
        <Routes>
          {/* testing part */}
          <Route path="/Admin2" element={<Admin2 socket={socket} />} />
          {/* <Route path="/Admin1" element={<Admin/> } /> */}
          <Route path="/BeforeLogin" element={<BeforeLogin2 />} />

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
                <BeforeLogin2 />
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

          <Route
            path="/Owner/Event/services"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={EventManagement} category="Service" />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />
          {/* <Route
            path="/Owner/Event/services"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={Services} /> 
              ) : (
                <LoginRegisterOwener />
              )
            }
          /> */}

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
            path="/Owner/search_photographer/:owner_email/all_services"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={AllServices} />
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
          <Route
            path="/Owner/drive"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={DriveMainPage} />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />

          {/* Owner Drive Routes */}
          <Route
            path="/Owner/drive/home"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={DriveHome} />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />
          <Route
            path="/Owner/drive/shared"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={SharedFilesPage} />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />
          <Route
            path="/Owner/drive/starred"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={StarredItems} />
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

          <Route
            path="/Owner/share_profile/:owner_email/:type"
            element={<DetailedView />
            }
          />

          <Route
            path="/Owner/share_profile/:owner_email/all_photos"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={AllPhotoFiles} />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />

          <Route
            path="/Owner/share_profile/:owner_email/all_services"
            element={
              authStatus.owner ? (
                <SetOwnerPage ActivePage={AllServices} />
              ) : (
                <LoginRegisterOwener />
              )
            }
          />

          <Route
            path="/test"
            element={<StackingCards />}
          />

          {/* 404 Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        {authStatus.owner && OwnerStatus === "Accept" && !window.location.pathname.includes("/Owner/share_profile") && (
          <OwnerSideBar />
        )}

        <Toaster position="top-right" />
      </>
    </UIProvider>
  );
}

export default App;
