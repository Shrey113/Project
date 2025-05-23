import React, { useEffect, useRef, useState, } from "react";
import { useLocation, useNavigate, useParams, } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./OwnerDetails.css";
// import NoDataForEquipment from "./NoDataForEquipment.png";
import { Server_url } from "../../../../../redux/AllData";
// import { IoArrowBack } from "react-icons/io5";
// import {  FaMapMarkerAlt } from "react-icons/fa";
import SeletedCard from "./SeletedCard";
import { MdOutlineAttachEmail, MdOutlineInsertLink, MdOutlineDesignServices, MdBusinessCenter, MdOutlineKeyboardDoubleArrowRight, MdLocationPin, MdPhone } from "react-icons/md";
import { IoIosShareAlt, IoMdCall } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { MdPhotoCamera } from 'react-icons/md';
import { FaCameraRetro } from 'react-icons/fa';
import { BiCameraMovie } from 'react-icons/bi';
import { BsPersonSquare } from 'react-icons/bs';




import "react-calendar/dist/Calendar.css";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaPinterest,
  FaGlobe,
} from "react-icons/fa";

import camera_icon from "./test_img_equipment/camera.png";
import drone_icon from "./test_img_equipment/drone.png";
import tripod_icon from "./test_img_equipment/Tripod.png";
import lens_icon from "./test_img_equipment/lens.png";
// import { FaAngleDoubleDown } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudDownloadAlt } from "react-icons/fa";
import SharePopup from "./SharePopup";
import { MdContentPasteOff } from "react-icons/md";
import { BiSolidCamera } from "react-icons/bi";
import { FaBoxOpen, FaFileInvoiceDollar } from "react-icons/fa";

const NoDataComponent = ({ type }) => {
  // Define the icon and message based on type
  let icon, message, description;

  switch (type) {
    case "equipment":
      icon = <FaBoxOpen className="no-data-icon" />;
      message = "NO EQUIPMENT AVAILABLE";
      description = "This photographer hasn't added any equipment yet.";
      break;
    case "packages":
      icon = <FaFileInvoiceDollar className="no-data-icon" />;
      message = "NO PACKAGES AVAILABLE";
      description = "This photographer hasn't created any packages yet.";
      break;
    case "photos":
      icon = <BiSolidCamera className="no-data-icon" />;
      message = "NO PHOTOS AVAILABLE";
      description = "This photographer hasn't uploaded any photos yet.";
      break;
    default:
      icon = <MdContentPasteOff className="no-data-icon" />;
      message = "NO DATA AVAILABLE";
      description = "No information has been added yet.";
  }

  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <div className="empty-state-icon-container">
          {icon}
        </div>
        <h3 className="empty-state-title">{message}</h3>
        <p className="empty-state-description">{description}</p>
      </div>
    </div>
  );
};

const OwnerDetails = () => {
  const equipmentTypes = [
    { type: "Camera", icon: camera_icon },
    { type: "Drone", icon: drone_icon },
    { type: "Tripod", icon: tripod_icon },
    { type: "Lens", icon: lens_icon },
  ];


  function get_img_by_name(name) {
    if (!name) return camera_icon;
    const equipment = equipmentTypes.find(
      (equipment) => equipment.type.toLowerCase() === name.toLowerCase()
    );

    return equipment ? equipment.icon : camera_icon; // Default to Camera icon if no match
  }

  // const [packagesMoreThan4, setpackagesMoreThan4] = useState(false);
  const [equipmentMoreThan4, setEquipmentMoreThan4] = useState(false);
  const [servicesMoreThan4, setServicesMoreThan4] = useState(false);

  const [showSelectedCard, setShowSelectedCard] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [services, setServices] = useState([]);


  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { owner_email } = useParams();

  const [ownerData, setOwnerData] = useState(location.state?.ownerData || owner_email);
  const [selectedOwner, setSelectedOwner] = useState(location.state?.selectedOwner || owner_email);

  const [isOpen, setIsOpen] = useState(false);
  const [at_share_link, set_at_share_link] = useState(false);

  const swiperRefPackage = useRef(null);
  const swiperRefEquipment = useRef(null);
  useEffect(() => {
    if (swiperRefPackage.current && swiperRefPackage.current.swiper) {
      swiperRefPackage.current.swiper.params.navigation.prevEl = ".custom-swiper-button-prev-packages";
      swiperRefPackage.current.swiper.params.navigation.nextEl = ".custom-swiper-button-next-packages";
      swiperRefPackage.current.swiper.navigation.init();
      swiperRefPackage.current.swiper.navigation.update();
    }
  }, []);

  useEffect(() => {
    if (showSelectedCard) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [showSelectedCard]);

  useEffect(() => {
    if (swiperRefEquipment.current && swiperRefEquipment.current.swiper) {
      swiperRefEquipment.current.swiper.params.navigation.prevEl = ".custom-swiper-button-prev-equipment";
      swiperRefEquipment.current.swiper.params.navigation.nextEl = ".custom-swiper-button-next-equipment";
      swiperRefEquipment.current.swiper.navigation.init();
      swiperRefEquipment.current.swiper.navigation.update();
    }
  }, []);

  useEffect(() => {
    if (!location.state?.ownerData) {

      async function get_owner_data(email) {
        try {
          const response = await fetch(`${Server_url}/api/owner-all-details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_email: email }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch owner details");
          }

          const data = await response.json();
          if (data && data.equipment && data.packages && data.photo_files) {
            setOwnerData(data);
          } else {
            console.error("Data format is not as expected:", data);
          }
        } catch (error) {
          console.error("Error fetching owner details:", error);
        }
      }
      get_owner_data(owner_email)
    }
  }, [location.state, owner_email])

  useEffect(() => {
    if (!location.state?.selectedOwner) {
      async function selected_owner_data_fetch(owner_email) {
        try {
          const response = await fetch(`${Server_url}/api/owner-table-all-details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_email: owner_email }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch owner details");
          }

          const data = await response.json();
          if (!response.ok) {
            throw new Error("Failed to fetch owner details");
          }
          setSelectedOwner(data.owner[0]);


        } catch (error) {
          console.error("Error fetching owner details:", error);
        }
      }
      selected_owner_data_fetch(owner_email)
    }
  }, [location.state, owner_email])

  useEffect(() => {
    if (location.pathname.includes("/Owner/share_profile")) {
      set_at_share_link(true);
    }
  }, [location.pathname, owner_email])


  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [fullViewImage, setFullViewImage] = useState("");

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (imageRef.current && !imageRef.current.contains(event.target)) {
  //       setFullViewImage("");
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [setFullViewImage]);

  useEffect(() => {
    if (fullViewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [fullViewImage]);

  const handleDownload = () => {
    if (fullViewImage) {
      const link = document.createElement("a");
      link.href = fullViewImage;
      link.download = fullViewImage.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchFolderData = async (user_email) => {
      console.log("sssssssssssssssssssss", user_email);

      try {
        const response = await fetch(
          `${Server_url}/owner_drive/get_folder_preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user_email }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTimeout(() => {
          if (data.success) {
            setFolders(data.data);
            setActiveFolder(data.data[0]);
            setPhotos(data.data[0]?.photo_list || []);
          } else {
            setFolders([]);
            setPhotos([]);
          }
        }, 100);
      } catch (error) {
        console.error("Error fetching folder data:", error.message);
      }
    };
    if (selectedOwner.user_email) {
      fetchFolderData(selectedOwner.user_email);
    }

  }, [selectedOwner.user_email]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [photos]);

  const handleTabSwitch = (folder, index) => {
    setActiveFolder(folder);
    setLoading(true);
    if (index === 0) {
      setPhotos(folder.photo_list);
      setLoading(false);
    } else {
      handleFolderPhotoFetch(folder.folder_id);
    }
  };

  const handleFolderPhotoFetch = async (folder_id) => {
    try {
      const response = await fetch(
        `${Server_url}/owner_drive/get_folder_photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id }),
        }
      );

      const data = await response.json();
      setTimeout(() => {
        setPhotos(data.photos && Array.isArray(data.photos) ? data.photos : []);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Error fetching folder photos:", error);
      setLoading(false);
    }
  };




  useEffect(() => {
    const fetch_services = async (user_email) => {
      try {
        const response = await fetch(`${Server_url}/fetch_services_for_preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: user_email }),
        });

        if (!response.ok) {
          console.log("Error:", response.statusText);
          return;
        }

        const data = await response.json();
        setServices(data.services);

      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };

    if (selectedOwner?.user_email) {
      fetch_services(selectedOwner.user_email);
    }

  }, [selectedOwner?.user_email]);

  useEffect(() => {
    const handleBackEvent = (event) => {

      navigate(`/Owner/search_photographer`);
    };

    window.addEventListener("popstate", handleBackEvent);

    return () => {
      window.removeEventListener("popstate", handleBackEvent);
    };
  }, [navigate, dispatch]);


  useEffect(() => {
    if (fullViewImage) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [fullViewImage]);

  useEffect(() => {
    // if (ownerData?.packages?.length >= 4) {
    //   setpackagesMoreThan4(true);
    // } else {
    //   setpackagesMoreThan4(false);
    // }
    if (ownerData?.equipment?.length > 4) {
      setEquipmentMoreThan4(true);
    } else {
      setEquipmentMoreThan4(false);
    }
    if (ownerData?.services?.length >= 3) {
      console.log("services", ownerData.services.length);
      setServicesMoreThan4(true);
    } else {
      setServicesMoreThan4(false);
    }
  }, [ownerData.packages, ownerData.equipment, ownerData.services]);

  const fetchPackagesData = async () => {
    const email = selectedOwner?.user_email;
    if (!email) return;

    try {
      const response = await fetch(`${Server_url}/api/packages/${email}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchEquipmentData = async () => {
    const email = selectedOwner?.user_email;
    if (!email) return;

    try {
      const response = await fetch(`${Server_url}/api/equipment/${email}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const handleShowAllClick = async (type) => {
    const email = selectedOwner?.user_email;

    if (email) {
      let fetchedData;

      if (type === "packages") {
        fetchedData = await fetchPackagesData();
        if (at_share_link) {
          navigate(`/Owner/share_profile/${email}/${type}`, {
            state: { data: fetchedData, dataType: type },
          });
          console.log(fetchedData, type);

        } else {
          navigate(`/Owner/search_photographer/${email}/${type}`, {
            state: { data: fetchedData, dataType: type },
          });
        }

      } else if (type === "equipments") {
        fetchedData = await fetchEquipmentData();


        if (at_share_link) {
          navigate(`/Owner/share_profile/${email}/${type}`, {
            state: { data: fetchedData, dataType: type },
          });
        } else {
          navigate(`/Owner/search_photographer/${email}/${type}`, {
            state: { data: fetchedData, dataType: type },
          });
        }

      } else if (type === "all_photos") {
        if (at_share_link) {
          navigate(`/Owner/share_profile/${email}/${type}`);
        } else {
          navigate(`/Owner/search_photographer/${email}/${type}`);
        }

      } else if (type === "services") {
        if (at_share_link) {
          navigate(`/Owner/share_profile/${email}/all_services`);
        } else {
          navigate(`/Owner/search_photographer/${email}/all_services`);
        }
      }
    }
  };

  useEffect(() => {
    const handleBackEvent = (event) => {
      navigate(`/Owner/search_photographer`);
    };

    window.addEventListener("popstate", handleBackEvent);

    return () => {
      window.removeEventListener("popstate", handleBackEvent);
    };
  }, [navigate, dispatch]);

  const handleItemClick = (item, type) => {
    if (at_share_link) {
      // alert("Sorry, you can't view the photos of other photographers.");
      navigate(`/Owner`, {
        state: {
          message: "user will come with view data",
          selectedOwner: selectedOwner,
          at_share_link: true,
        },
      });
      return;
    }
    setSelectedData(item);
    setSelectedType(type);
    setShowSelectedCard(true);
  };

  if (!ownerData || !selectedOwner) {
    return <p>Loading owner details...</p>;
  }


  const getSocialIcon = (link) => {
    if (link.includes("instagram"))
      return {
        icon: <FaInstagram className="social-icon instagram" />,
        label: "Instagram",
      };
    if (link.includes("facebook"))
      return {
        icon: <FaFacebook className="social-icon facebook" />,
        label: "Facebook",
      };
    if (link.includes("youtube"))
      return {
        icon: <FaYoutube className="social-icon youtube" />,
        label: "YouTube",
      };
    if (link.includes("pinterest"))
      return {
        icon: <FaPinterest className="social-icon pinterest" />,
        label: "Pinterest",
      };

    try {
      const domain = new URL(link).hostname.replace("www.", "");
      const label = domain.charAt(0).toUpperCase() + domain.slice(1);
      return {
        icon: <FaGlobe className="social-icon default" />,
        label: label || "Website",
      };
    } catch (error) {
      return {
        icon: <FaGlobe className="social-icon default" />,
        label: "Website", // Fallback in case URL parsing fails
      };
    }
  };

  const getBackgroundColor = (label) => {
    const colors = {
      Facebook: "#D8EAFB",
      Twitter: "#D0F0FD",
      Instagram: "#FAD3E6",
      LinkedIn: "#DCEEF9",
      WhatsApp: "#D4F8D4",
      YouTube: "#FDDDDD",
      Pinterest: "#FAD4D4",
      Snapchat: "#FFF5D1",
      Default: "#EAEAEA"
    };
    return colors[label] || colors["Default"];
  };

  // Function to create a slightly darker border color
  const getBorderColor = (label) => {
    const borderColors = {
      Facebook: "#A0C4E8",
      Twitter: "#A0D0E5",
      Instagram: "#E8A7C2",
      LinkedIn: "#B0D0E0",
      WhatsApp: "#A0D8A0",
      YouTube: "#E0A0A0",
      Pinterest: "#E0A0A0",
      Snapchat: "#E8D090",
      Default: "#C0C0C0"
    };
    return borderColors[label] || borderColors["Default"];
  };
  // const handleShare = async () => {
  //   const currentUrl = window.location.href.replace("search_photographer", "share_profile");
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: "Check out this profile!",
  //         text: "Check out this photographer's profile:",
  //         url: currentUrl,
  //       });
  //       console.log("Shared successfully!");
  //     } catch (error) {
  //       console.error("Error sharing:", error);
  //     }
  //   } else {
  //     alert("Your browser does not support Web Share API.");
  //   }
  // };



  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  function cleanUrl(url) {
    if (!url) return "";

    try {
      let hostname = new URL(url).hostname; // Extract hostname from URL
      return hostname.replace(/^www\./, ''); // Remove "www." if present
    } catch (error) {
      // Handle cases where the input isn't a valid URL
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
  }


  function redirectToUrl(url) {
    if (url && url !== "Not Available") {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      window.open(fullUrl, "_blank");
    }
  }

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();

    // Wedding and celebration photography
    if (name.includes('wedding') || name.includes('proposal') || name.includes('engagement')) {
      return <BiCameraMovie className="service-icon wedding" />;
    }
    // Events and gatherings
    else if (name.includes('event') || name.includes('concert') || name.includes('festival') || name.includes('performance')) {
      return <FaCameraRetro className="service-icon event" />;
    }
    // People-focused photography
    else if (name.includes('portrait') || name.includes('headshot') || name.includes('family') ||
      name.includes('maternity') || name.includes('newborn') || name.includes('boudoir')) {
      return <BsPersonSquare className="service-icon portrait" />;
    }
    // Nature and outdoors
    else if (name.includes('landscape') || name.includes('nature') || name.includes('wildlife') ||
      name.includes('travel') || name.includes('adventure') || name.includes('underwater')) {
      return <MdPhotoCamera className="service-icon nature" />;
    }
    // Food and product
    else if (name.includes('food') || name.includes('product') || name.includes('commercial') ||
      name.includes('e-commerce')) {
      return <MdPhotoCamera className="service-icon product" />;
    }
    // Architecture and real estate
    else if (name.includes('architectural') || name.includes('real estate') || name.includes('interior')) {
      return <MdPhotoCamera className="service-icon architectural" />;
    }
    // Fashion and style
    else if (name.includes('fashion') || name.includes('editorial') || name.includes('glamour') ||
      name.includes('model')) {
      return <FaCameraRetro className="service-icon fashion" />;
    }
    // Specialty photography
    else if (name.includes('aerial') || name.includes('drone') || name.includes('macro') ||
      name.includes('astro') || name.includes('night')) {
      return <BiCameraMovie className="service-icon specialty" />;
    }
    // Sports and action
    else if (name.includes('sport') || name.includes('action') || name.includes('adventure')) {
      return <FaCameraRetro className="service-icon sports" />;
    }
    // Art and creative
    else if (name.includes('fine art') || name.includes('abstract') || name.includes('black and white') ||
      name.includes('conceptual') || name.includes('creative')) {
      return <MdPhotoCamera className="service-icon art" />;
    }
    // Business and corporate
    else if (name.includes('corporate') || name.includes('business') || name.includes('professional')) {
      return <BsPersonSquare className="service-icon corporate" />;
    }
    // Default icon for any other type
    else {
      return <MdPhotoCamera className="service-icon" />;
    }
  };



  return (
    <div className="owner-details-container" id="owner-details-container">
      {at_share_link ? (<div style={{ marginTop: "50px" }}></div>) : (
        <></>)
      }

      <div className="owner-info-details">
        <div className="owner-profile-container">
          <div className="share_icon" onClick={togglePopup}>
            <IoIosShareAlt />
          </div>
          <div className="owner-profile-left">
            <div className="owner_details_img_container">
              <img
                src={
                  `${Server_url}/owner/business-profile-image/${selectedOwner?.user_email}?t=${new Date().getTime()}` ||
                  "/default-user.jpg"
                }
                alt="Owner"
                className="owner-profile-img"
              />
            </div>
            <div className="owner-status">
              <p>{selectedOwner?.user_name || "Not Available"}</p>

              {/* Skills section */}
              <div className="skills-container">
                {/* <div className="skills-header">
                  <MdOutlineDesignServices className="skills-icon" />
                  <h3>Skills</h3>
                </div> */}
                <div className="skills-list">
                  {true ? (
                    <div className="skills-items">
                      <span className="skill-tag">Portrait Photography</span>
                      <span className="skill-tag">Landscape</span>
                      <span className="skill-tag">Product Shoots</span>
                      <span className="skill-tag">Wedding</span>
                      <span className="skill-tag">Photo Editing</span>
                      <span className="skill-tag">Videography</span>
                      <span className="skill-tag">Drone Photography</span>
                      <span className="skill-tag">Studio Lighting</span>
                    </div>
                  ) : (
                    <div className="no-skills-message">
                      <p>No skills listed</p>
                    </div>
                  )}
                </div>
              </div>
              {/* <hr style={{ width: "90%", border: " 1px solid #c1c1c1" }} /> */}
              <div className="all_links">
                {selectedOwner?.social_media_links?.length > 0 ? (
                  selectedOwner.social_media_links.map((link, index) => {
                    const { icon, label } = getSocialIcon(link);
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        title={label}
                        style={{
                          backgroundColor: getBackgroundColor(label),
                          border: `2px solid ${getBorderColor(label)}`
                        }}
                      >
                        {icon}
                      </a>
                    );
                  })
                ) : (
                  <p> </p>
                )}
              </div>
            </div>


          </div>

          <div className="owner-profile-right">
            {/* <div className="info-card"> */}
            <div className="email_business_website">
              <div className="details_1">
                <div className="info-card">
                  <div className="info-item">
                    <div className="icon-container">
                      <MdOutlineAttachEmail className="icon" />
                    </div>
                    <div>
                      <label>Email</label>
                      <a
                        href={`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${selectedOwner?.user_email}&su=Photography%20Equipment%20Rental%20Inquiry&body=Hello%2C%20I%20am%20interested%20in%20renting%20photography%20equipment.%20Could%20you%20please%20provide%20more%20details%20regarding%20the%20available%20gear%20and%20rental%20process%3F%20Thank%20you.`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue', textDecoration: 'underline' }}
                      >
                        {selectedOwner?.user_email}
                      </a>

                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-item">
                    <div className="icon-container">
                      <MdPhone className="icon" />
                    </div>
                    <div>
                      <label>Mobile</label>
                      <div className="mobile-with-call-button">
                        <p>{selectedOwner?.mobile_number || "Not Available"}</p>
                        {selectedOwner?.mobile_number && (
                          <a
                            href={`tel:${selectedOwner.mobile_number}`}
                            className="call-button"
                          >
                            <IoMdCall className="call-icon" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-item">
                    <div className="icon-container">
                      <MdLocationPin className="icon" />
                    </div>
                    <div>
                      <label>Business Address</label>
                      <p>
                        {selectedOwner.business_address || "Not Available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="details_2">
                <div className="info-card">
                  <div className="info-item">
                    <div className="icon-container">
                      <MdBusinessCenter className="icon" />
                    </div>
                    <div>
                      <label>Business Name</label>
                      <p>{selectedOwner?.business_name || "Not Available"}</p>
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-item">
                    <div className="icon-container">
                      <MdOutlineInsertLink className="icon" />
                    </div>
                    <div>
                      <label>Website</label>
                      <p onClick={() => redirectToUrl(selectedOwner?.social_media)} style={{ color: "blue", cursor: "pointer" }}>
                        {cleanUrl(selectedOwner?.social_media || "Not Available")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="services_in_profile">
              <div className="info-item ">
                <div
                  className="icon-container"
                // style={{ marginLeft: "20px" }}
                >
                  <MdOutlineDesignServices className="icon" />
                </div>
                <div className="service-list">
                  <div className="service_title">Freelancing Services</div>
                  <div className="service_items">
                    {services && services?.length > 0 ? (
                      services?.map((service, index) => (
                        <p className="service-item" key={index}>
                          {service.service_name}
                        </p>
                      ))
                    ) : (
                      <p>No services available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>

      <div
        className={`section photo_section`}
      >

        {ownerData.photo_files?.length > 0 ? (
          <div className="photos-container">
            <div className="profile_preview_photos_title">
              <div className="photos-card-title">Photos</div>
              <div className="tabs">
                {folders &&
                  folders?.slice(0, 5).map((folder, index) => (
                    <h3
                      key={index}
                      className={`folder_tab ${activeFolder?.folder_name === folder.folder_name
                        ? "active"
                        : ""
                        }`}
                      onClick={() => handleTabSwitch(folder, index)}
                    >
                      {folder.folder_name}
                    </h3>
                  ))}
              </div>

              <div className="see_all_button" onClick={() => handleShowAllClick("all_photos")}>See All <MdOutlineKeyboardDoubleArrowRight style={{ fontSize: "20px" }} /></div>
            </div>
            <hr style={{ width: "98%", margin: "auto" }} />

            <div className="profile_preview_images">
              {loading || isLoading ? (
                <div className="photo_container">
                  <div className="photos_grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div key={n} className="photo_card">
                        <div className="skeleton-photo-card"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="photo_container">
                  {photos.length === 0 ? (
                    <NoDataComponent type="photos" />
                  ) : (
                    <div className="photos_grid">
                      {photos.slice(0, 10).map((photoItem, index) => (
                        <div key={index} className="photo_card">

                          {activeFolder?.folder_name === "Portfolio" ? (
                            <img
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                setFullViewImage(e.target.src);
                              }}
                              src={`${Server_url}/owner/portfolio-image/${photoItem.photo_id}?t=${Date.now()}`}
                              alt={photoItem.photo_name}
                              className="photo_image"
                            />
                          ) : (
                            <img
                              style={{ cursor: "pointer" }}
                              src={
                                `${Server_url}/owner/portfolio-image-file?path=${encodeURIComponent(photoItem.file_data)}`
                              }
                              alt={photoItem.photo_name}
                              className="photo_image"
                              onClick={(e) => {
                                setFullViewImage(e.target.src);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <NoDataComponent type="photos" />
        )}
      </div>

      {/* Packages Section */}

      {/* <div className="section packages_section">


        {ownerData.packages?.length > 0 ? (
          <div className="package-list">
            <div className="profile_preview_packages_title">
              <div className="packages-card-title">Packages</div>
              {packagesMoreThan4 && (
                <div className="see_all_button" onClick={() => handleShowAllClick("packages")}>
                  See All <MdOutlineKeyboardDoubleArrowRight style={{ fontSize: "20px" }} />
                </div>
              )}
            </div>

            <hr style={{ width: "98%", margin: "auto" }} />

            <div className="swiper_container_for_packages">
              <div className="custom-swiper-button-prev-packages"
                style={{
                  display: `${ownerData.packages?.length > 3 ? "flex" : "none"}`,
                }}
              >❮</div>

              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                useRef={swiperRefPackage}
                slidesPerView="auto"
                autoplay={{
                  delay: 5000,
                }}
                loop={true}
                navigation={{
                  nextEl: ".custom-swiper-button-next-packages",
                  prevEl: ".custom-swiper-button-prev-packages",
                }}

                spaceBetween={10}
                pagination={{
                  clickable: true,
                  renderBullet: (index, className) =>
                    `<span class="${className} custom-swiper-pagination-bullet"></span>`,
                }}
                breakpoints={{
                  350: { slidesPerView: 1.2 },
                  450: { slidesPerView: 1.2, spaceBetween: 5 },
                  500: { slidesPerView: 1.5 },
                  580: { slidesPerView: 1.5, spaceBetween: 8 },

                  640: { slidesPerView: 2.2, spaceBetween: 10 },
                  768: { slidesPerView: 2.5, spaceBetween: 10 },
                  860: { slidesPerView: 3, spaceBetween: 10 },
                  1024: { slidesPerView: 3.5, spaceBetween: 15 },
                }}
              >
                {ownerData.packages.map((pkg, index) => (
                  <SwiperSlide key={pkg.id || index} className="package-card" style={{
                    backgroundColor: `#ffffff`,
                    borderTop: `6px solid ${pkg.card_color || "#6fa8dc"}`,
                    borderRight: "1px solid #919394",
                    borderLeft: "1px solid #919394",
                    borderBottom: "1px solid #919394",
                  }}
                    onClick={() => handleItemClick(pkg, "package")}>

                    <div className="package_title">
                      <div className="package_name">{pkg.package_name || "Package Name"}</div>
                    </div>

                    <div className="package_pricing" style={{ color: pkg.card_color || "#6fa8dc" }}>
                      <div className="rupee_symbol">₹</div>
                      <div className="value">{pkg.price || "Price"}</div>
                      <span>/day</span>
                    </div>

                    <hr style={{ width: "96%", margin: "8px 0" }} />

                    <div className="package_Services">
                      {Array.isArray(pkg.service) && pkg.service.length > 0 ? (
                        pkg.service.map((srv, idx) => (
                          <div key={idx} className="service_item">
                            <div className="key" style={{ backgroundColor: pkg.card_color, color: pkg.text_color || "#fff" }}>
                              {idx + 1}
                            </div>
                            <div className="individual_services">{srv}</div>
                          </div>
                        ))
                      ) : (
                        <span style={{ alignSelf: "center" }}>No services available</span>
                      )}
                    </div>

                    <div
                      className="book-package-button"
                      onClick={() => handleItemClick(pkg, "package")}
                      style={{ backgroundColor: pkg.card_color || "#6fa8dc", color: "#fff" }}
                    >
                      Book Package
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="custom-swiper-button-next-packages"
                style={{
                  display: `${ownerData.packages?.length > 3 ? "flex" : "none"}`,
                }}
              >❯</div>
            </div>
          </div>
        ) : (
          <NoDataComponent type="packages" />
        )}
      </div> */}

      {/* Equipment Section */}
      <div className="section equipment_section">
        {ownerData.equipment?.length > 0 ? (
          <ul className="equipment-list" >
            <div className="profile_preview_equipment_title">
              <div className="equipment-card-title">Equipment</div>

              {equipmentMoreThan4 && (
                <div className="see_all_button" onClick={() => handleShowAllClick("equipments")}>See All <MdOutlineKeyboardDoubleArrowRight style={{ fontSize: "20px" }} /></div>
              )}
            </div>

            <hr style={{ width: "98%", margin: "auto" }} />


            <div className="swiper_container_for_equipment">

              <div className="custom-swiper-button-prev-equipment"
                style={{
                  display: `${ownerData.equipment?.length > 3 ? "flex" : "none"}`,
                }}
              >❮</div>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                slidesPerView="auto"
                ref={swiperRefEquipment}
                spaceBetween={10}
                autoplay={{
                  delay: 4000,
                }}
                loop={true}
                pagination={{
                  clickable: true,
                  renderBullet: (index, className) =>
                    `<span class="${className} custom-swiper-pagination-bullet"></span>`,
                }}
                breakpoints={{
                  320: { slidesPerView: 1.1, spaceBetween: 5 },
                  450: { slidesPerView: 1.2, spaceBetween: 5 },
                  500: { slidesPerView: 1.2, spaceBetween: 8 },
                  640: { slidesPerView: 1.5, spaceBetween: 10 },
                  768: { slidesPerView: 2, spaceBetween: 10 },
                  1024: { slidesPerView: 3, spaceBetween: 15 },
                }}
              >

                {ownerData?.equipment?.map((item, index) => (
                  <SwiperSlide key={index} className="equipment_item" onClick={() => handleItemClick(item, "equipment")}>
                    {/* <li className="equipment_item"> */}
                    <div className="photo_container_for_equipment">
                      <img src={get_img_by_name(item.equipment_type)} alt={item.equipment_type} />
                      <p>{item.name || "Not Available"}</p>
                    </div>
                    <div className="other_details_for_equipment">
                      <div>{item.equipment_company || "Not Available"}</div>
                      <div>• {item.equipment_type || "Not Available"}</div>
                    </div>
                    <div className="equipment_price_container">
                      <p>Rs. {item.equipment_price_per_day || "Not Available"} /Day</p>
                    </div>
                    <div className="equipment_description">
                      <strong>Details:</strong>
                      <p>{item.equipment_description || "Not Available"}</p>
                    </div>

                    {/* </li> */}

                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="custom-swiper-button-next-equipment"
                style={{
                  display: `${ownerData.equipment?.length > 3 ? "flex" : "none"}`,
                }}
              >❯</div>
            </div>
          </ul>
        ) : (
          <NoDataComponent type="equipment" />
        )}
      </div>

      {/* Services Section  */}

      <div className="section services_section">
        {ownerData.services?.length > 0 ? (
          <ul className="services-list">
            <div className="profile_preview_services_title">
              <div className="services-card-title">Freelancing Services</div>
              {servicesMoreThan4 && (
                <div onClick={() => handleShowAllClick("services")} className="see_all_button">
                  See All <MdOutlineKeyboardDoubleArrowRight style={{ fontSize: "20px" }} />
                </div>
              )}
            </div>

            <hr style={{ width: "98%", margin: "auto" }} />

            <div className="swiper_container_for_services">
              <div className="custom-swiper-button-prev-services"
                style={{
                  display: `${ownerData.services?.length > 3 ? "flex" : "none"}`,
                }}
              >❮</div>

              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                slidesPerView="auto"
                spaceBetween={10}
                autoplay={{
                  delay: 7000,
                }}
                loop={true}
                navigation={{
                  nextEl: ".custom-swiper-button-next-services",
                  prevEl: ".custom-swiper-button-prev-services",
                }}
                pagination={{
                  clickable: true,
                  renderBullet: (index, className) =>
                    `<span class="${className} custom-swiper-pagination-bullet"></span>`,
                }}
                breakpoints={{
                  450: { spaceBetween: 5 },
                  500: { spaceBetween: 8 },
                  640: { slidesPerView: 1.5, spaceBetween: 10 },
                  768: { slidesPerView: 2, spaceBetween: 10 },
                  1024: { slidesPerView: 3, spaceBetween: 15 },
                }}
              >
                {ownerData.services.map((item, index) => (
                  <SwiperSlide key={index} className="service_item">
                    <div className="container_for_services_name">
                      <div className="servers_icon">
                        {getServiceIcon(item.service_name)}
                        <p style={{ width: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.service_name || "Not Available"}</p>
                      </div>
                    </div>

                    <div className="for_service_price_and_book_button">
                      <div className="services_price_container">
                        <div className="rupee_symbol"> ₹</div>
                        <div className="service_price">{item.price_per_day || "Not Available"}</div>
                        <span className="per_day">/Day</span>
                      </div>
                      <hr style={{ width: "98%", marginTop: "20px", marginBottom: "15px" }} />
                      <button onClick={() => handleItemClick(item, "service")}>Book Service</button>

                      <div className="service-description" >
                        {item.description}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="custom-swiper-button-next-services"
                style={{
                  display: `${ownerData.services?.length > 3 ? "flex" : "none"}`,
                }}
              >❯</div>
            </div>
          </ul>
        ) : (
          <div className="no_services">
            <NoDataComponent type="services" />
          </div>
        )}
      </div>



      {
        showSelectedCard && selectedData && (
          <SeletedCard
            type={selectedType}
            onClose={() => {
              setShowSelectedCard(false);
              setSelectedData(null);
              setSelectedType(null);
            }}
            selectedOwner={selectedOwner.user_email}
            selectedData={selectedData}
          />
        )
      }

      {/* Loading Animation */}
      {
        isLoading && (
          <div className="loading-container">
            <div className="skeleton-loader"></div>
          </div>
        )
      }

      {/* OR for the dots loader: */}
      {
        isLoading && (
          <div className="loading-container">
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )
      }



      {
        fullViewImage && (
          <div
            className="full_view_image_container" onClick={() => setFullViewImage("")} >
            <div className="full_view_image_wrapper" onClick={(e) => e.stopPropagation()} >
              <img src={fullViewImage} className="full_view_image" alt="Full view" />
              <div className="button_container">

                <button className="download_button" onClick={(e) => { e.stopPropagation(); handleDownload(); }} >
                  <FaCloudDownloadAlt className="close_logo" style={{ fontSize: "18px" }} />
                  Download
                </button>

                <button className="close_button" onClick={() => setFullViewImage("")} >
                  <IoCloseSharp className="download_logo" style={{ fontSize: "18px" }} />
                  Close
                </button>

              </div>
            </div>
          </div>
        )
      }

      {isOpen && (
        <SharePopup onClose={() => setIsOpen(false)} />
      )}

    </div >
  );
};

export default OwnerDetails;
