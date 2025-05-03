import React, { useEffect, useState, useRef } from "react";
import "./SeletedCard.css";
import { IoClose } from "react-icons/io5";
import { IoLocationOutline, IoCalendarOutline, IoArrowBack } from "react-icons/io5";
import { BsCurrencyRupee, BsCheckCircleFill, BsChevronDown } from "react-icons/bs";
import { MdBusinessCenter, MdCategory, MdLocationOn } from "react-icons/md";
import { FaMapMarkerAlt, FaTasks } from "react-icons/fa";
import {
  Server_url,
  showAcceptToast,
  showRejectToast,
} from "../../../../../redux/AllData";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4f46e5",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6b7280",
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          fontWeight: "600",
          "&.Mui-selected": {
            backgroundColor: "#4f46e5",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }
      }
    }
  },
});

// Collapsible section component
const CollapsibleSection = ({ title, children, icon, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="booking-section">
      <div
        className={`collapsible-header ${isOpen ? 'collapsible-header-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="collapsible-title">
          {icon}
          <span>{title}</span>
        </div>
        <BsChevronDown
          className={`collapsible-icon ${isOpen ? 'collapsible-icon-open' : ''}`}
          size={16}
        />
      </div>
      <div className={`collapsible-content ${isOpen ? 'collapsible-content-open' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function SeletedCard({ type, onClose, selectedData, selectedOwner }) {
  const user = useSelector((state) => state.user);
  const [blockedDates, setBlockedDates] = useState([]);
  const containerRef = useRef(null);
  const [eventType, setEventType] = useState("1-day");
  const [dayDetails, setDayDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (type === "equipment" && selectedData.equipment_id) {
      fetch(`${Server_url}/get_equpment_by_time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipment_id: selectedData.equipment_id }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Blocked dates received:", data);
          setBlockedDates(data);
        })
        .catch((error) => {
          console.error("Error fetching equipment availability:", error);
        });
    }
  }, [selectedData, type]);

  const [formData, setFormData] = useState({
    // package
    package_id: selectedData.id,
    package_name: selectedData.package_name,
    service: selectedData.service,
    description: selectedData.description,
    price: selectedData.price,

    // equipment
    equipment_id: selectedData.equipment_id,
    equipment_name: selectedData.name,
    name: selectedData.name,
    equipment_company: selectedData.equipment_company,
    equipment_type: selectedData.equipment_type,
    equipment_description: selectedData.equipment_description,
    equipment_price_per_day: selectedData.equipment_price_per_day,

    // service
    service_id: selectedData.id,
    service_name: selectedData.service_name || "",
    service_price: selectedData.price_per_day || 0,

    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
    location: "",
    location_error: "",
    requirements: "",
    requirements_error: "",
    days_required: 1,
    days_required_error: "",
    total_amount:
      type === "equipment"
        ? selectedData.equipment_price_per_day
        : type === "package" ? selectedData.price * 1 : type === "service" ? selectedData.price_per_day : 0,
  });

  const [dateErrors, setDateErrors] = useState({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (eventType === "multi-day" && formData.start_date && formData.end_date) {
      generateDayDetails();
    }
  }, [formData.start_date, formData.end_date, eventType]);
  
  // Reset to page 1 when switching event types
  useEffect(() => {
    setCurrentPage(1);
  }, [eventType]);
  
  const generateDayDetails = () => {
    const startDate = dayjs(formData.start_date);
    const endDate = dayjs(formData.end_date);
    const diffDays = endDate.diff(startDate, 'day') + 1;
    
    if (diffDays <= 0) return;
    
    const newDayDetails = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = startDate.add(i, 'day');
      newDayDetails.push({
        date: currentDate.format('YYYY-MM-DD'),
        dayLabel: `Day ${i + 1} - ${currentDate.format('MMM D, YYYY')}`,
        title: "",
        location: "",
        description: ""
      });
    }
    
    setDayDetails(newDayDetails);
  };
  
  const handleDayDetailChange = (index, field, value) => {
    const updatedDayDetails = [...dayDetails];
    updatedDayDetails[index] = {
      ...updatedDayDetails[index],
      [field]: value
    };
    setDayDetails(updatedDayDetails);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "days_required") {
      const days = parseInt(value) || 0;

      // Update start_date and end_date based on days_required
      const newStartDate = new Date();
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + days);

      setFormData({
        ...formData,
        [name]: days,
        days_required_error: days < 1 ? "Days must be at least 1" : "",
        start_date: newStartDate.toISOString(),
        end_date: newEndDate.toISOString(),
        total_amount:
          type === "equipment"
            ? days * formData.equipment_price_per_day
            : type === "service"
              ? days * formData.service_price
              : type === "package" ? days * formData.price : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const add_equipment_request = async () => {
    if (!user || !user.user_email) {
      showRejectToast({ message: "User information is missing" });
      return;
    }

    if (!selectedOwner) {
      showRejectToast({ message: "Owner information is missing" });
      return;
    }

    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner,
    };
    console.log("form data", data);

    try {
      const response = await fetch(
        `${Server_url}/owner/add-equipment-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        showRejectToast({ message: "Equipment request failed" });
        throw new Error("Request failed");
      }
      showAcceptToast({ message: "Equipment request added successfully" });

      onClose();
    } catch (error) {
      console.error("Error adding equipment request:", error);
      showRejectToast({ message: `Error: ${error.message}` });
    }
  };

  const add_package_request = async () => {
    if (!user || !user.user_email) {
      showRejectToast({ message: "User information is missing" });
      return;
    }

    if (!selectedOwner) {
      showRejectToast({ message: "Owner information is missing" });
      return;
    }

    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email,
    };

    try {
      const response = await fetch(`${Server_url}/owner/add-package-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        showRejectToast({ message: "Package request failed" });
        throw new Error("Request failed");
      }
      showAcceptToast({ message: "Package request added successfully" });
      onClose();
    } catch (error) {
      console.error("Error adding package request:", error);
      showRejectToast({ message: `Error: ${error.message}` });
    }
  };

  const add_service_request = async () => {
    console.log("add_service_request", selectedOwner);
    if (!user || !user.user_email) {
      showRejectToast({ message: "User information is missing" });
      return;
    }

    if (!selectedOwner) {
      showRejectToast({ message: "Owner information is missing" });
      return;
    }

    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner,
    };
    console.log("Service form data", data);

    try {
      const response = await fetch(`${Server_url}/owner/add-service-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        showRejectToast({ message: "Service request failed" });
        throw new Error("Request failed");
      }
      showAcceptToast({ message: "Service request added successfully" });

      onClose();
    } catch (error) {
      console.error("Error adding service request:", error);
      showRejectToast({ message: `Error: ${error.message}` });
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const validateDates = () => {
    const errors = {};
    const start = dayjs(formData.start_date);
    const end = dayjs(formData.end_date);

    // Clear previous errors
    errors.start_date = "";
    errors.end_date = "";

    // Check if dates are selected
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      errors.end_date = "End date is required";
    }

    // Check if end date is after start date
    if (start && end && end.isBefore(start)) {
      errors.end_date = "End date must be after start date";
    }

    // Check if dates are blocked
    if (start && shouldDisableDate(start)) {
      errors.start_date = "This date is not available";
    }
    if (end && shouldDisableDate(end)) {
      errors.end_date = "This date is not available";
    }

    setDateErrors(errors);

    // If there are errors, scroll to top
    if (Object.values(errors).some((error) => error !== "")) {
      scrollToTop();
    }

    return Object.values(errors).every((error) => error === "");
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    
    // Validate dates before proceeding to the next page
    if (validateDates()) {
      setCurrentPage(2);
      // Scroll to top when navigating to next page
      scrollToTop();
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(1);
  };

  const handleOpenMapPicker = (index = -1) => {
    // This would open a map picker modal in a real implementation
    // For demonstration, we'll just show a toast message
    const message = index >= 0 
      ? `Opening map picker for Day ${index + 1}...` 
      : "Opening map picker...";
    
    showAcceptToast({ message });
    
    // In a real implementation, you would:
    // 1. Open a modal with a map (Google Maps, Mapbox, etc.)
    // 2. Let the user select a location
    // 3. Update the location value with the selected address
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For multi-day event on first page, go to second page
    if (eventType === "multi-day" && currentPage === 1) {
      handleNextPage(e);
      return;
    }

    // Validate all fields
    if (eventType === "multi-day") {
      if (!validateDates()) {
        return;
      }
    } else {
      // Validate single date
      if (!formData.start_date) {
        setDateErrors({
          ...dateErrors,
          start_date: "Date is required"
        });
        return;
      }
    }

    // Validate location
    if (!formData.location.trim()) {
      setFormData((prev) => ({
        ...prev,
        location_error: "Location is required",
      }));
      return;
    }

    if (type === "equipment") {
      await add_equipment_request();
    } else if (type === "package") {
      await add_package_request();
    } else if (type === "service") {
      await add_service_request();
    }
  };

  const handleDateChange = (name, newValue) => {
    if (newValue) {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: dayjs(newValue).toISOString(),
        };

        // If start_date is changed, update days_required based on end_date
        if (name === "start_date") {
          const endDate = dayjs(updatedFormData.end_date);
          const daysRequired = endDate.diff(dayjs(newValue), 'day') + 1; // +1 to include the start date
          updatedFormData.days_required = daysRequired > 0 ? daysRequired : 1; // Ensure at least 1 day
        }

        // If end_date is changed, update days_required based on start_date
        if (name === "end_date") {
          const startDate = dayjs(updatedFormData.start_date);
          const daysRequired = dayjs(newValue).diff(startDate, 'day') + 1; // +1 to include the start date
          updatedFormData.days_required = daysRequired > 0 ? daysRequired : 1; // Ensure at least 1 day
        }

        return updatedFormData;
      });

      // Clear error when date is changed
      setDateErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Add this function to check if a date should be disabled
  const shouldDisableDate = (date) => {
    const checkDate = dayjs(date).startOf("day"); // Convert to start of day for comparison

    return blockedDates.some((period) => {
      // Parse the datetime strings from backend
      const startDate = dayjs(period.start_date).startOf("day");
      const endDate = dayjs(period.end_date).startOf("day");

      // Check if the date falls within the blocked period using isAfter/isBefore/isSame
      return (
        (checkDate.isAfter(startDate) || checkDate.isSame(startDate)) &&
        (checkDate.isBefore(endDate) || checkDate.isSame(endDate))
      );
    });
  };

  // Add this function for custom day rendering
  const renderDay = (date, selectedDates, pickersDayProps) => {
    const isDisabled = shouldDisableDate(date);
    return (
      <PickersDay
        {...pickersDayProps}
        disabled={isDisabled}
        sx={{
          ...(isDisabled && {
            backgroundColor: "#ffebee !important",
            color: "#d32f2f !important",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "#ffcdd2 !important",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "2px solid #d32f2f",
              borderRadius: "50%",
              boxSizing: "border-box",
            },
          }),
        }}
      />
    );
  };

  return (
    <div
      className="owner-selected-overlay-container"
      onClick={(e) => {
        onClose();
      }}
    >
      <div className="on_close" onClick={onClose}>
        <IoClose style={{
          fontWeight: "600",
          fontSize: "18px",
        }} />
      </div>
      <div
        className="selected-card-container"
        onClick={(e) => {
          e.stopPropagation();
        }}
        ref={containerRef}
      >
        {type === "equipment" && (
          <div className="equipment-card-container-selected">
            <div className="equipment-card-title-selected">
              Equipment Booking
            </div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <CollapsibleSection
                title="Equipment Details"
                icon={<MdBusinessCenter size={16} />}
              >
                <div className="info-section">
                  <div className="info-group">
                    <label>Equipment Name</label>
                    <div className="info-value">{formData.name}</div>
                  </div>

                  <div className="info-group">
                    <label>Company</label>
                    <div className="info-value">{formData.equipment_company}</div>
                  </div>
                  <div className="info-group">
                    <label>Equipment Type</label>
                    <div className="info-value">{formData.equipment_type}</div>
                  </div>
                  <div className="info-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <div className="info-value">
                      {formData.equipment_description}
                    </div>
                  </div>
                  <div className="info-group">
                    <label>Price per Day</label>
                    <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
                      <BsCurrencyRupee /> {formData.equipment_price_per_day}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Combined Booking Details Section */}
              <div className="booking-section">


                {/* Date Selection */}
                <div style={{ marginBottom: "16px" }}>
                  <div className="date-time-container">
                    <ThemeProvider theme={theme}>
                      <div className="date-input-group">
                        <label className="form-label">
                          <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                          Start Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            value={
                              formData.start_date
                                ? dayjs(formData.start_date)
                                : null
                            }
                            onChange={(newValue) =>
                              handleDateChange("start_date", newValue)
                            }
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            slotProps={{
                              textField: {
                                className: "form-input",
                                error: !!dateErrors.start_date,
                                helperText: dateErrors.start_date,
                                size: "small",
                                sx: {
                                  "& .MuiFormHelperText-root": {
                                    color: "#d32f2f",
                                    marginLeft: "0",
                                    fontSize: "0.7rem",
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>

                      <div className="date-input-group">
                        <label className="form-label">
                          <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                          End Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            value={
                              formData.end_date ? dayjs(formData.end_date) : null
                            }
                            onChange={(newValue) =>
                              handleDateChange("end_date", newValue)
                            }
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            slotProps={{
                              textField: {
                                className: "form-input",
                                error: !!dateErrors.end_date,
                                helperText: dateErrors.end_date,
                                size: "small",
                                sx: {
                                  "& .MuiFormHelperText-root": {
                                    color: "#d32f2f",
                                    marginLeft: "0",
                                    fontSize: "0.7rem",
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </ThemeProvider>
                  </div>
                </div>

                {/* Other Booking Details */}
                <div className="compact-fields">
                  <div className="form-group">
                    <label>Days Required</label>
                    <input
                      type="number"
                      name="days_required"
                      value={formData.days_required}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                    {formData.days_required_error && (
                      <div className="error-message">
                        {formData.days_required_error}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <IoLocationOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter delivery location"
                      required
                    />
                    {formData.location_error && (
                      <div className="error-message">{formData.location_error}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Requirements (Optional)</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Any specific requirements for your booking"
                  />
                </div>

                <div className="info-group total-amount">
                  <label>Total Amount</label>
                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BsCurrencyRupee /> {formData.total_amount}
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                <BsCheckCircleFill style={{ marginRight: "8px" }} /> Book Now
              </button>
            </form>
          </div>
        )}

        {type === "package" && (
          <div className="package-card-container-selected">
            <div className="package-card-title-selected">Package Booking</div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <CollapsibleSection
                title="Package Details"
                icon={<MdBusinessCenter size={16} />}
              >
                <div className="info-section">
                  <div className="info-group">
                    <label>Package Name</label>
                    <div className="info-value">{formData.package_name}</div>
                  </div>
                  <div className="info-group">
                    <label>Service</label>
                    <div className="info-value">{formData.service}</div>
                  </div>
                  <div className="info-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <div className="info-value">{formData.description}</div>
                  </div>
                  <div className="info-group">
                    <label>Price</label>
                    <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
                      <BsCurrencyRupee /> {formData.price}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Combined Booking Details Section */}
              <div className="booking-section">

                {/* Date Selection */}
                <div style={{ marginBottom: "16px" }}>
                  <div className="date-time-container">
                    <ThemeProvider theme={theme}>
                      <div className="date-input-group">
                        <label className="form-label">
                          <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                          Start Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            value={
                              formData.start_date
                                ? dayjs(formData.start_date)
                                : null
                            }
                            onChange={(newValue) =>
                              handleDateChange("start_date", newValue)
                            }
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            slotProps={{
                              textField: {
                                className: "form-input",
                                error: !!dateErrors.start_date,
                                helperText: dateErrors.start_date,
                                size: "small",
                                sx: {
                                  "& .MuiFormHelperText-root": {
                                    color: "#d32f2f",
                                    marginLeft: "0",
                                    fontSize: "0.7rem",
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>

                      <div className="date-input-group">
                        <label className="form-label">
                          <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                          End Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            value={
                              formData.end_date ? dayjs(formData.end_date) : null
                            }
                            onChange={(newValue) =>
                              handleDateChange("end_date", newValue)
                            }
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            slotProps={{
                              textField: {
                                className: "form-input",
                                error: !!dateErrors.end_date,
                                helperText: dateErrors.end_date,
                                size: "small",
                                sx: {
                                  "& .MuiFormHelperText-root": {
                                    color: "#d32f2f",
                                    marginLeft: "0",
                                    fontSize: "0.7rem",
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </ThemeProvider>
                  </div>
                </div>

                {/* Other Booking Details */}
                <div className="compact-fields">
                  <div className="form-group">
                    <label>Days Required</label>
                    <input
                      type="number"
                      name="days_required"
                      value={formData.days_required}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                    {formData.days_required_error && (
                      <div className="error-message">
                        {formData.days_required_error}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <IoLocationOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                      required
                    />
                    {formData.location_error && (
                      <div className="error-message">{formData.location_error}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Requirements (Optional)</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Any specific requirements for your package"
                  />
                </div>

                <div className="info-group total-amount">
                  <label>Total Amount</label>
                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BsCurrencyRupee /> {formData.total_amount}
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                <BsCheckCircleFill style={{ marginRight: "8px" }} /> Book Package
              </button>
            </form>
          </div>
        )}

        {type === "service" && (
          <div className="service-card-container-selected">
            <div className="service-card-title-selected">
              {eventType === "multi-day" && currentPage === 2 ? (
                <div className="page-header">
                  <button className="back-button" onClick={handlePrevPage}>
                    <IoArrowBack />
                  </button>
                  <span>Daily Schedule</span>
                </div>
              ) : (
                "Service Booking"
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Only show service details and toggle on first page */}
              {!(eventType === "multi-day" && currentPage === 2) && (
                <>
                  <CollapsibleSection
                    title="Service Details"
                    icon={<MdCategory size={16} />}
                  >
                    <div className="info-section">
                      <div className="info-group">
                        <label>Service Name</label>
                        <div className="info-value">{formData.service_name}</div>
                      </div>
                      <div className="info-group" style={{ gridColumn: "1 / -1" }}>
                        <label>Description</label>
                        <div className="info-value">{formData.description}</div>
                      </div>
                      <div className="info-group">
                        <label>Price</label>
                        <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
                          <BsCurrencyRupee /> {formData.service_price}
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Event Type Toggle */}
                  <div className="event-toggle-container">
                    <div className="event-toggle-label">Event Type:</div>
                    <div className="toggle-switch-container">
                      <div 
                        className={`toggle-option ${eventType === "1-day" ? "toggle-option-active" : ""}`}
                        onClick={() => setEventType("1-day")}
                      >
                        1-Day Event
                      </div>
                      <div 
                        className={`toggle-option ${eventType === "multi-day" ? "toggle-option-active" : ""}`}
                        onClick={() => setEventType("multi-day")}
                      >
                        Multi-Day Event
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* First page for both event types OR second page for multi-day */}
              <div className="booking-section">
                {/* 1-Day Event OR Multi-Day First Page */}
                {(eventType === "1-day" || (eventType === "multi-day" && currentPage === 1)) && (
                  <>
                    {/* Date Selection - based on event type */}
                    <div style={{ marginBottom: "16px" }}>
                      <div className="date-time-container">
                        <ThemeProvider theme={theme}>
                          {eventType === "1-day" ? (
                            <div className="single-date-input-group">
                              <label className="form-label">
                                <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                Service Date
                              </label>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  value={
                                    formData.start_date
                                      ? dayjs(formData.start_date)
                                      : null
                                  }
                                  onChange={(newValue) =>
                                    handleDateChange("start_date", newValue)
                                  }
                                  minDate={dayjs()}
                                  format="DD-MM-YYYY"
                                  shouldDisableDate={shouldDisableDate}
                                  renderDay={renderDay}
                                  slotProps={{
                                    textField: {
                                      className: "form-input",
                                      error: !!dateErrors.start_date,
                                      helperText: dateErrors.start_date,
                                      size: "small",
                                      sx: {
                                        "& .MuiFormHelperText-root": {
                                          color: "#d32f2f",
                                          marginLeft: "0",
                                          fontSize: "0.7rem",
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                          ) : (
                            <>
                              <div className="date-input-group">
                                <label className="form-label">
                                  <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                  Start Date
                                </label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    value={
                                      formData.start_date
                                        ? dayjs(formData.start_date)
                                        : null
                                    }
                                    onChange={(newValue) =>
                                      handleDateChange("start_date", newValue)
                                    }
                                    minDate={dayjs()}
                                    format="DD-MM-YYYY"
                                    shouldDisableDate={shouldDisableDate}
                                    renderDay={renderDay}
                                    slotProps={{
                                      textField: {
                                        className: "form-input",
                                        error: !!dateErrors.start_date,
                                        helperText: dateErrors.start_date,
                                        size: "small",
                                        sx: {
                                          "& .MuiFormHelperText-root": {
                                            color: "#d32f2f",
                                            marginLeft: "0",
                                            fontSize: "0.7rem",
                                          },
                                        },
                                      },
                                    }}
                                  />
                                </LocalizationProvider>
                              </div>

                              <div className="date-input-group">
                                <label className="form-label">
                                  <IoCalendarOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                  End Date
                                </label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    value={
                                      formData.end_date ? dayjs(formData.end_date) : null
                                    }
                                    onChange={(newValue) =>
                                      handleDateChange("end_date", newValue)
                                    }
                                    minDate={dayjs()}
                                    format="DD-MM-YYYY"
                                    shouldDisableDate={shouldDisableDate}
                                    renderDay={renderDay}
                                    slotProps={{
                                      textField: {
                                        className: "form-input",
                                        error: !!dateErrors.end_date,
                                        helperText: dateErrors.end_date,
                                        size: "small",
                                        sx: {
                                          "& .MuiFormHelperText-root": {
                                            color: "#d32f2f",
                                            marginLeft: "0",
                                            fontSize: "0.7rem",
                                          },
                                        },
                                      },
                                    }}
                                  />
                                </LocalizationProvider>
                              </div>
                            </>
                          )}
                        </ThemeProvider>
                      </div>
                    </div>

                    {/* Only show location and requirements for 1-day event */}
                    {eventType === "1-day" && (
                      <>
                        <div className="compact-fields">
                          <div className="form-group">
                            <label>
                              <IoLocationOutline style={{ marginRight: "5px", verticalAlign: "middle" }} />
                              Location
                            </label>
                            <div className="location-input-container">
                              <div className="location-input-wrapper">
                                <input
                                  type="text"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleChange}
                                  placeholder="Enter service location"
                                  required
                                />
                                <button 
                                  type="button" 
                                  className="map-picker-button"
                                  onClick={() => handleOpenMapPicker()}
                                >
                                  <MdLocationOn size={18} />
                                </button>
                              </div>
                              {formData.location && (
                                <a href={`https://maps.google.com/?q=${encodeURIComponent(formData.location)}`} 
                                  className="map-link" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <FaMapMarkerAlt /> View on Map
                                </a>
                              )}
                            </div>
                            {formData.location_error && (
                              <div className="error-message">{formData.location_error}</div>
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Requirements (Optional)</label>
                          <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Any specific requirements for this service"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Multi-Day Event Second Page */}
                {eventType === "multi-day" && currentPage === 2 && (
                  <div className="multi-day-details">
                    <div className="date-summary">
                      <div className="date-summary-item">
                        <label>START:</label>
                        <span>{dayjs(formData.start_date).format('MMM D, YYYY')}</span>
                      </div>
                      <div className="date-summary-item">
                        <label>END:</label>
                        <span>{dayjs(formData.end_date).format('MMM D, YYYY')}</span>
                      </div>
                      <div className="date-summary-item">
                        <label>DAYS:</label>
                        <span>{dayDetails.length}</span>
                      </div>
                    </div>
                    
                    <div className="days-container">
                      {dayDetails.map((day, index) => (
                        <CollapsibleSection
                          key={index}
                          title={`Day ${index + 1} - ${dayjs(day.date).format('MMM D, YYYY')}`}
                          icon={<IoCalendarOutline size={18} style={{ marginRight: "8px" }} />}
                          defaultOpen={index === 0}
                        >
                          <div className="day-details-form">
                            <div className="form-group">
                              <label>Title/Task for the Day</label>
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => handleDayDetailChange(index, 'title', e.target.value)}
                                placeholder="What's planned for this day?"
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>
                                <IoLocationOutline />
                                Location
                              </label>
                              <div className="location-input-container">
                                <div className="location-input-wrapper">
                                  <input
                                    type="text"
                                    value={day.location}
                                    onChange={(e) => handleDayDetailChange(index, 'location', e.target.value)}
                                    placeholder="Enter location for this day"
                                  />
                                  <button 
                                    type="button" 
                                    className="map-picker-button"
                                    onClick={() => handleOpenMapPicker(index)}
                                  >
                                    <MdLocationOn size={18} />
                                  </button>
                                </div>
                                {day.location && (
                                  <a href={`https://maps.google.com/?q=${encodeURIComponent(day.location)}`} 
                                    className="map-link" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <FaMapMarkerAlt /> View on Map
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div className="form-group">
                              <label>Description or Notes</label>
                              <textarea
                                value={day.description}
                                onChange={(e) => handleDayDetailChange(index, 'description', e.target.value)}
                                rows="3"
                                placeholder="Add any details or specific requirements for this day"
                              />
                            </div>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>
                  </div>
                )}

                {/* Always show total amount */}
                <div className="info-group total-amount">
                  <label>Total Amount</label>
                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BsCurrencyRupee /> {formData.total_amount}
                  </div>
                </div>
              </div>

              {/* Button text based on context */}
              <button type="submit" className="submit-btn">
                <BsCheckCircleFill style={{ marginRight: "8px" }} />
                {eventType === "multi-day" && currentPage === 1 
                  ? "Next Page" 
                  : "Book Service"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeletedCard;
//  need to manage a total-amount  like all day like for one day and mnay day all totola aomout will not count that need to fix in this ...... and in location need to fix that like 2 input fild in one line like side bay side in this one is locaitn and locatin link this 2 input fild side by side on it in this way we need to udpate a a full ui on it .... and Date piker like out sdie clcik to clsoe this is a bug  and then we need to add a like start day and end day will be like start day wil nevery less then a end date thsi way i need on it like if user will pikc a start day 5th then it will not able to pikc a less then 5 this way we need to fix a all ui and logic on it 