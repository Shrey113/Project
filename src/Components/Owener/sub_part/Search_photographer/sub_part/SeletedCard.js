import React, { useEffect, useState, useRef } from "react";
import "./SeletedCard.css";
import { IoClose } from "react-icons/io5";
import { IoLocationOutline, IoCalendarOutline, IoArrowBack, IoCopyOutline } from "react-icons/io5";
import { BsCurrencyRupee, BsCheckCircleFill, BsChevronDown } from "react-icons/bs";
import { MdBusinessCenter, MdCategory } from "react-icons/md";
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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
    },
    MuiPickersPopper: {
      styleOverrides: {
        root: {
          zIndex: 9999,
          position: 'fixed'
        }
      }
    },
    MuiClickAwayListener: {
      styleOverrides: {
        root: {
          width: '100%',
          height: '100%'
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
  const [totalAmount, setTotalAmount] = useState(0);
  const [copyFirstDay, setCopyFirstDay] = useState(false);

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
    locationLink: "",
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
            locationLink: "",
            description: ""
          });
        }

        setDayDetails(newDayDetails);
      };
      generateDayDetails();
    }
  }, [formData.start_date, formData.end_date, eventType]);

  // Reset to page 1 when switching event types
  useEffect(() => {
    setCurrentPage(1);
  }, [eventType]);

  const handleDayDetailChange = (index, field, value) => {
    const updatedDayDetails = [...dayDetails];

    // Update the specific day's field
    updatedDayDetails[index] = {
      ...updatedDayDetails[index],
      [field]: value
    };

    // If this is the first day and copy is enabled, update all other days too
    if (index === 0 && copyFirstDay) {
      for (let i = 1; i < updatedDayDetails.length; i++) {
        updatedDayDetails[i] = {
          ...updatedDayDetails[i],
          [field]: value
        };
      }
    }

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
        ...(name === 'location' ? { location_error: "" } : {})
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

  const print_booking_details = () => {
    // Check if we have the required dates
    if (!validateDates()) {
      console.error("Date validation failed in print_booking_details");
      return null;
    }

    const formatBookingData = () => {
      const isOneDayEvent = eventType === "1-day";

      // Format dates properly for server with time component (YYYY-MM-DD HH:MM:SS format)
      const formatDate = (dateString) => {
        if (!dateString) return null;
        return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
      };

      // Get formatted dates for the overall booking
      const formattedStartDate = formatDate(formData.start_date);
      const formattedEndDate = isOneDayEvent
        ? formatDate(dayjs(formData.start_date).add(1, 'day')) // Add 1 day gap for end date
        : formatDate(formData.end_date);

      if (!formattedStartDate || (eventType !== "1-day" && !formattedEndDate)) {
        console.error("Missing formatted dates");
        return null;
      }

      const baseData = {
        event_request_type: "service",
        event_name: type,
        service_name: formData.service_name,
        service_description: formData.description,
        service_price_per_day: formData.service_price,
        services_id: formData.service_id,
        sender_email: user.user_email,
        receiver_email: selectedOwner,
        requirements: formData.requirements || "",
        days_required: isOneDayEvent ? 1 : dayDetails.length,
        total_amount: totalAmount,
        event_status: "Pending",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      if (isOneDayEvent) {
        return {
          ...baseData,
          location: formData.location,
          location_link: formData.locationLink || "",
          title: `${formData.service_name} booking`,
          schedule: [
            {
              day_number: 1,
              title: `${formData.service_name} Day 1`,
              start_date: formattedStartDate,
              end_date: formattedEndDate,
              location: formData.location,
              location_link: formData.locationLink || "",
              description: formData.description || "",
            }
          ]
        };
      } else {
        // Generate the schedule with proper date formatting
        const generateScheduleDates = () => {
          const startDate = dayjs(formData.start_date);
          const dates = [];

          for (let i = 0; i < dayDetails.length; i++) {
            const currentDate = startDate.add(i, 'day');
            const nextDate = currentDate.add(i, 'day'); // Next day for the end date

            dates.push({
              start: currentDate.format('YYYY-MM-DD HH:mm:ss'),
              end: nextDate.format('YYYY-MM-DD HH:mm:ss')
            });
          }

          return dates;
        };

        // Get all dates for the booking period
        const scheduleDates = generateScheduleDates();

        // Create schedule with properly formatted dates
        const schedule = dayDetails.map((day, index) => ({
          day_number: index + 1,
          title: day.title || `Day ${index + 1}`,
          start_date: scheduleDates[index].start,
          end_date: scheduleDates[index].end,
          location: day.location || "",
          location_link: day.locationLink || "",
          description: day.description || "",
        }));

        return {
          ...baseData,
          location: dayDetails[0]?.location || "",
          location_link: dayDetails[0]?.locationLink || "",
          title: dayDetails[0]?.title || `${formData.service_name} booking`,
          schedule: schedule,
        };
      }
    };

    const validateBookingData = (data) => {
      if (!data) return { isValid: false, errors: ["Failed to create booking data"] };

      const errors = [];

      if (!user?.user_email) errors.push("User information is missing");
      if (!selectedOwner) errors.push("Service provider information is missing");
      if (!data.services_id || !data.service_name) errors.push("Service information is incomplete");
      if (!data.start_date) errors.push("Start date is required");
      if (eventType === "multi-day" && !data.end_date) errors.push("End date is required");
      if (!data.location && eventType !== "multi-day") errors.push("Location is required");
      if (eventType === "multi-day" && (!dayDetails[0]?.location || dayDetails.some(day => !day.location))) {
        errors.push("Location is required for all days");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    try {
      const bookingData = formatBookingData();
      const validationResult = validateBookingData(bookingData);

      if (!validationResult.isValid) {
        showRejectToast({
          message: `Validation failed: ${validationResult.errors.join(", ")}`,
        });
        console.error("Validation errors:", validationResult.errors);
        return null;
      }

      console.log("Booking Data (Ready for submission):", JSON.stringify(bookingData, null, 2));
      return bookingData;
    } catch (error) {
      console.error("Error preparing booking data:", error);
      showRejectToast({
        message: `Error preparing booking data: ${error.message}`,
      });
      return null;
    }
  };

  const add_service_request = async () => {
    try {
      const bookingData = print_booking_details();

      if (!bookingData) {
        showRejectToast({ message: "Booking data is missing or invalid" });
        return;
      }

      console.log("Sending service request to server:", bookingData);

      // Send the formatted booking data to the server
      const response = await fetch(`${Server_url}/owner/add-service-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || "Service request failed";
        console.error("Server error response:", errorData);
        showRejectToast({ message: errorMessage });
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Service request succeeded:", responseData);
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

  // Add this function to log form data to help with debugging
  const logFormData = () => {
    console.log("Current form data:", {
      eventType,
      start_date: formData.start_date,
      end_date: formData.end_date,
      location: formData.location,
      service_name: formData.service_name,
      service_id: formData.service_id,
      service_price: formData.service_price,
      days_required: formData.days_required,
      total_amount: formData.total_amount,
      dayDetails // Log dayDetails to see location data
    });
  };

  const validateDates = () => {
    console.log("Inside validateDates for event type:", eventType);
    const errors = {};

    // Ensure consistent date formatting using dayjs
    const start = formData.start_date ? dayjs(formData.start_date) : null;
    const end = formData.end_date ? dayjs(formData.end_date) : null;

    // Check if dates are selected
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
      console.log("Start date is required");
    }

    // Only require end date for multi-day events
    if (eventType === "multi-day" && !formData.end_date) {
      errors.end_date = "End date is required";
      console.log("End date is required");
    }

    // Check if end date is after start date for multi-day events
    if (eventType === "multi-day" && start && end) {
      if (end.isBefore(start) || end.isSame(start, "day")) {
        errors.end_date = "End date must be after start date";
        console.log("End date must be after start date");
      }
    }

    // Check if dates are blocked
    if (start && shouldDisableDate(start)) {
      errors.start_date = "This date is not available";
      console.log("Start date is not available");
    }

    if (eventType === "multi-day" && end && shouldDisableDate(end)) {
      errors.end_date = "This date is not available";
      console.log("End date is not available");
    }

    // Update date errors
    setDateErrors({
      start_date: errors.start_date || "",
      end_date: errors.end_date || ""
    });

    console.log("Validation errors:", errors);

    // Scroll to top if there are errors
    if (errors.start_date || errors.end_date) {
      scrollToTop();
      return false;
    }

    return true;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data to help with debugging
    logFormData();

    console.log("Handling submit for eventType:", eventType);
    // For multi-day event on first page, go to next page
    if (eventType === "multi-day" && currentPage === 1) {
      handleNextPage(e);
      return;
    }

    // Validate dates
    if (!validateDates()) {
      console.log("Date validation failed");
      showRejectToast({ message: "Please select valid dates" });
      return;
    }

    // Validate location based on event type
    if (eventType === "1-day") {
      if (!formData.location.trim()) {
        setFormData((prev) => ({
          ...prev,
          location_error: "Location is required",
        }));
        showRejectToast({ message: "Location is required" });
        scrollToTop();
        return;
      }
    } else {
      // For multi-day events, check if all days have a location
      const missingLocation = dayDetails.some(day => !day.location.trim());
      if (missingLocation) {
        showRejectToast({ message: "Location is required for all days" });
        scrollToTop();
        return;
      }
    }

    // Prepare data for submission based on request type
    try {
      if (type === "equipment") {
        await add_equipment_request();
      } else if (type === "package") {
        await add_package_request();
      } else if (type === "service") {
        // For service, we need formatted data
        if (eventType === "multi-day" && dayDetails.length === 0) {
          showRejectToast({ message: "Day details are missing" });
          return;
        }

        // For 1-day events, ensure we have the required data
        if (eventType === "1-day") {
          if (!formData.start_date) {
            setDateErrors({
              start_date: "Start date is required",
              end_date: ""
            });
            showRejectToast({ message: "Please select a date" });
            return;
          }

          // For 1-day events, set end_date to start_date + 1 day if not already set
          if (!formData.end_date) {
            setFormData(prev => ({
              ...prev,
              end_date: dayjs(formData.start_date).add(1, 'day').toISOString()
            }));
          }
        }

        const bookingData = print_booking_details();
        if (!bookingData) {
          console.log("Booking data preparation failed");
          showRejectToast({ message: "Failed to prepare booking data" });
          return;
        }

        console.log("Submitting service request with data:", bookingData);
        await add_service_request();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      showRejectToast({ message: `Error: ${error.message}` });
    }
  };

  const handleDateChange = (name, newValue) => {
    if (!newValue) return;

    const newDate = dayjs(newValue);

    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: newDate.toISOString(),
    };

    // Handle start date change with validation
    if (name === "start_date") {
      // If eventType is multi-day, ensure end date is valid
      if (eventType === "multi-day") {
        if (formData.end_date) {
          const currentEndDate = dayjs(formData.end_date);

          // End date must be at least 1 day after start date
          if (currentEndDate.isSame(newDate, 'day') || currentEndDate.isBefore(newDate)) {
            // Set end date to start date + 1 day
            updatedFormData.end_date = newDate.add(1, 'day').toISOString();
          }
        } else {
          // If no end date is set, set it to start date + 1 day
          updatedFormData.end_date = newDate.add(1, 'day').toISOString();
        }
      }
    }

    // Handle end date change validation for multi-day events
    if (name === "end_date" && eventType === "multi-day") {
      const startDate = dayjs(formData.start_date);

      // Check if end date is before or same as start date
      if (newDate.isBefore(startDate) || newDate.isSame(startDate, 'day')) {
        // Show error but still update the date
        setDateErrors(prev => ({
          ...prev,
          end_date: "End date must be after start date"
        }));
      } else {
        // Clear end date error if valid
        setDateErrors(prev => ({
          ...prev,
          end_date: ""
        }));
      }
    }

    // Update days_required based on the two dates for multi-day events
    if (updatedFormData.start_date && updatedFormData.end_date && eventType === "multi-day") {
      const start = dayjs(updatedFormData.start_date);
      const end = dayjs(updatedFormData.end_date);
      const daysRequired = end.diff(start, 'day') + 1; // +1 to include the start date
      updatedFormData.days_required = daysRequired;
    }

    // Update state
    setFormData(updatedFormData);

    // Clear error for the field being changed
    setDateErrors(prev => ({
      ...prev,
      [name]: ""
    }));

    // If dates have changed for multi-day event, regenerate day details
    if (eventType === "multi-day" &&
      (name === "start_date" || name === "end_date") &&
      updatedFormData.start_date && updatedFormData.end_date) {
      regenerateDayDetails(updatedFormData);
    }
  };

  // Function to regenerate day details when dates change
  const regenerateDayDetails = (updatedFormData) => {
    const startDate = dayjs(updatedFormData.start_date);
    const endDate = dayjs(updatedFormData.end_date);
    const diffDays = endDate.diff(startDate, 'day') + 1;

    if (diffDays <= 0) return;

    // If there are existing day details, preserve their content when possible
    const newDayDetails = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = startDate.add(i, 'day');
      const dateStr = currentDate.format('YYYY-MM-DD');

      // Check if we had this date in previous details
      const existingDay = dayDetails.find(day => day.date === dateStr);

      if (existingDay) {
        // Use existing data
        newDayDetails.push(existingDay);
      } else {
        // Create new day with empty data or copy from day 1 if checkbox is checked
        if (i > 0 && copyFirstDay && dayDetails.length > 0) {
          // Copy from first day
          newDayDetails.push({
            date: dateStr,
            dayLabel: `Day ${i + 1} - ${currentDate.format('MMM D, YYYY')}`,
            title: dayDetails[0]?.title || "",
            location: dayDetails[0]?.location || "",
            locationLink: dayDetails[0]?.locationLink || "",
            description: dayDetails[0]?.description || ""
          });
        } else {
          // Create fresh entry
          newDayDetails.push({
            date: dateStr,
            dayLabel: `Day ${i + 1} - ${currentDate.format('MMM D, YYYY')}`,
            title: "",
            location: "",
            locationLink: "",
            description: ""
          });
        }
      }
    }

    setDayDetails(newDayDetails);
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

  // Calculate total amount whenever relevant values change
  useEffect(() => {
    // Calculate total amount based on event type
    const calculateTotalAmount = () => {
      let amount = 0;

      if (eventType === "1-day") {
        // For 1-day events, use the service price
        amount = type === "service" ? formData.service_price : 0;
      } else {
        // For multi-day events, multiply by days
        amount = type === "service" ? formData.service_price * dayDetails.length : 0;
      }

      setTotalAmount(amount);

      // Also update in formData
      setFormData(prev => ({
        ...prev,
        total_amount: amount
      }));
    };

    calculateTotalAmount();
  }, [formData.days_required, formData.service_price, eventType, dayDetails, type]);

  // Handle copying first day data to all days
  const handleCopyToAllDays = (e) => {
    const isChecked = e.target.checked;
    setCopyFirstDay(isChecked);

    if (isChecked && dayDetails.length > 1 && dayDetails[0]) {
      // Get the first day data
      const firstDay = dayDetails[0];

      // Update all other days with first day data
      const updatedDayDetails = dayDetails.map((day, index) => {
        if (index === 0) return day; // Keep first day unchanged
        return {
          ...day,
          title: firstDay.title,
          location: firstDay.location,
          locationLink: firstDay.locationLink,
          description: firstDay.description
        };
      });

      setDayDetails(updatedDayDetails);
    }
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
                            value={formData.start_date ? dayjs(formData.start_date) : null}
                            onChange={(newValue) => handleDateChange("start_date", newValue)}
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            closeOnSelect={true}
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
                              popper: {
                                disablePortal: false,
                                modifiers: [
                                  {
                                    name: 'preventOverflow',
                                    enabled: true,
                                    options: {
                                      boundary: document.body
                                    }
                                  }
                                ]
                              },
                              paper: {
                                sx: {
                                  zIndex: 9999
                                }
                              }
                            }}
                            onClose={() => {
                              // Force popper to close on outside click
                              document.activeElement.blur();
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
                            value={formData.end_date ? dayjs(formData.end_date) : null}
                            onChange={(newValue) => handleDateChange("end_date", newValue)}
                            minDate={dayjs(formData.start_date || new Date())}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            closeOnSelect={true}
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
                              popper: {
                                disablePortal: false,
                                modifiers: [
                                  {
                                    name: 'preventOverflow',
                                    enabled: true,
                                    options: {
                                      boundary: document.body
                                    }
                                  }
                                ]
                              },
                              paper: {
                                sx: {
                                  zIndex: 9999
                                }
                              }
                            }}
                            onClose={() => {
                              // Force popper to close on outside click
                              document.activeElement.blur();
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
                      <IoLocationOutline />
                      Location
                    </label>
                    <div className="location-input-container">
                      <div className="location-row">
                        <div className="location-input-col">
                          <div className="location-input-wrapper">
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="Enter service location"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="location-row mt-2">
                        <div className="location-input-col">
                          <label className="location-link-label">Location Link</label>
                          <div className="location-input-wrapper">
                            <input
                              type="text"
                              name="locationLink"
                              value={formData.locationLink}
                              onChange={handleChange}
                              placeholder="Enter location link (optional)"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.location_error && (
                        <div className="error-message">{formData.location_error}</div>
                      )}
                    </div>
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
                            value={formData.start_date ? dayjs(formData.start_date) : null}
                            onChange={(newValue) => handleDateChange("start_date", newValue)}
                            minDate={dayjs()}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            closeOnSelect={true}
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
                              popper: {
                                disablePortal: false,
                                modifiers: [
                                  {
                                    name: 'preventOverflow',
                                    enabled: true,
                                    options: {
                                      boundary: document.body
                                    }
                                  }
                                ]
                              },
                              paper: {
                                sx: {
                                  zIndex: 9999
                                }
                              }
                            }}
                            onClose={() => {
                              // Force popper to close on outside click
                              document.activeElement.blur();
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
                            value={formData.end_date ? dayjs(formData.end_date) : null}
                            onChange={(newValue) => handleDateChange("end_date", newValue)}
                            minDate={dayjs(formData.start_date || new Date())}
                            format="DD-MM-YYYY"
                            shouldDisableDate={shouldDisableDate}
                            renderDay={renderDay}
                            closeOnSelect={true}
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
                              popper: {
                                disablePortal: false,
                                modifiers: [
                                  {
                                    name: 'preventOverflow',
                                    enabled: true,
                                    options: {
                                      boundary: document.body
                                    }
                                  }
                                ]
                              },
                              paper: {
                                sx: {
                                  zIndex: 9999
                                }
                              }
                            }}
                            onClose={() => {
                              // Force popper to close on outside click
                              document.activeElement.blur();
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
                      <IoLocationOutline />
                      Location
                    </label>
                    <div className="location-input-container">
                      <div className="location-row">
                        <div className="location-input-col">
                          <div className="location-input-wrapper">
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="Enter event location"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="location-row mt-2">
                        <div className="location-input-col">
                          <label className="location-link-label">Location Link</label>
                          <div className="location-input-wrapper">
                            <input
                              type="text"
                              name="locationLink"
                              value={formData.locationLink}
                              onChange={handleChange}
                              placeholder="Enter location link (optional)"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.location_error && (
                        <div className="error-message">{formData.location_error}</div>
                      )}
                    </div>
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
                                  value={formData.start_date ? dayjs(formData.start_date) : null}
                                  onChange={(newValue) => handleDateChange("start_date", newValue)}
                                  minDate={dayjs()}
                                  format="DD-MM-YYYY"
                                  shouldDisableDate={shouldDisableDate}
                                  renderDay={renderDay}
                                  closeOnSelect={true}
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
                                    popper: {
                                      disablePortal: false,
                                      modifiers: [
                                        {
                                          name: 'preventOverflow',
                                          enabled: true,
                                          options: {
                                            boundary: document.body
                                          }
                                        }
                                      ]
                                    },
                                    paper: {
                                      sx: {
                                        zIndex: 9999
                                      }
                                    }
                                  }}
                                  onClose={() => {
                                    // Force popper to close on outside click
                                    document.activeElement.blur();
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
                                    value={formData.start_date ? dayjs(formData.start_date) : null}
                                    onChange={(newValue) => handleDateChange("start_date", newValue)}
                                    minDate={dayjs()}
                                    format="DD-MM-YYYY"
                                    shouldDisableDate={shouldDisableDate}
                                    renderDay={renderDay}
                                    closeOnSelect={true}
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
                                      popper: {
                                        disablePortal: false,
                                        modifiers: [
                                          {
                                            name: 'preventOverflow',
                                            enabled: true,
                                            options: {
                                              boundary: document.body
                                            }
                                          }
                                        ]
                                      },
                                      paper: {
                                        sx: {
                                          zIndex: 9999
                                        }
                                      }
                                    }}
                                    onClose={() => {
                                      // Force popper to close on outside click
                                      document.activeElement.blur();
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
                                    value={formData.end_date ? dayjs(formData.end_date) : null}
                                    onChange={(newValue) => handleDateChange("end_date", newValue)}
                                    minDate={dayjs()}
                                    format="DD-MM-YYYY"
                                    shouldDisableDate={shouldDisableDate}
                                    renderDay={renderDay}
                                    closeOnSelect={true}
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
                                      popper: {
                                        disablePortal: false,
                                        modifiers: [
                                          {
                                            name: 'preventOverflow',
                                            enabled: true,
                                            options: {
                                              boundary: document.body
                                            }
                                          }
                                        ]
                                      },
                                      paper: {
                                        sx: {
                                          zIndex: 9999
                                        }
                                      }
                                    }}
                                    onClose={() => {
                                      // Force popper to close on outside click
                                      document.activeElement.blur();
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
                              <IoLocationOutline />
                              Location
                            </label>
                            <div className="location-input-container">
                              <div className="location-row">
                                <div className="location-input-col">
                                  <div className="location-input-wrapper">
                                    <input
                                      type="text"
                                      name="location"
                                      value={formData.location}
                                      onChange={handleChange}
                                      placeholder="Enter service location"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="location-row mt-2">
                                <div className="location-input-col">
                                  <label className="location-link-label">Location Link</label>
                                  <div className="location-input-wrapper">
                                    <input
                                      type="text"
                                      name="locationLink"
                                      value={formData.locationLink}
                                      onChange={handleChange}
                                      placeholder="Enter location link (optional)"
                                    />
                                  </div>
                                </div>
                              </div>

                              {formData.location_error && (
                                <div className="error-message">{formData.location_error}</div>
                              )}
                            </div>
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

                    {/* Copy first day to all days checkbox */}
                    {dayDetails.length > 1 && (
                      <div className="copy-first-day-container">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={copyFirstDay}
                              onChange={handleCopyToAllDays}
                              color="primary"
                            />
                          }
                          label={
                            <div className="copy-label">
                              <IoCopyOutline />
                              <span>Copy Day 1 details to all days</span>
                            </div>
                          }
                        />
                      </div>
                    )}

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
                                disabled={copyFirstDay && index > 0}
                                onChange={(e) => {
                                  handleDayDetailChange(index, 'title', e.target.value);
                                  if (copyFirstDay && index === 0) {
                                    // If copying is enabled and this is the first day, update all days
                                    const newValue = e.target.value;
                                    const updatedDayDetails = dayDetails.map((d, i) =>
                                      i === 0 ? d : { ...d, title: newValue }
                                    );
                                    setDayDetails(updatedDayDetails);
                                  }
                                }}
                                placeholder="What's planned for this day?"
                                className={copyFirstDay && index > 0 ? "disabled-input" : ""}
                              />
                            </div>

                            <div className="form-group">
                              <label>
                                <IoLocationOutline />
                                Location
                              </label>
                              <div className="location-input-container">
                                <div className="location-row">
                                  <div className="location-input-col">
                                    <div className="location-input-wrapper">
                                      <input
                                        type="text"
                                        value={day.location}
                                        disabled={copyFirstDay && index > 0}
                                        onChange={(e) => handleDayDetailChange(index, 'location', e.target.value)}
                                        placeholder="Enter location for this day"
                                        required
                                        className={copyFirstDay && index > 0 ? "disabled-input" : ""}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="location-row mt-2">
                                  <div className="location-input-col">
                                    <label className="location-link-label">Location Link</label>
                                    <div className="location-input-wrapper">
                                      <input
                                        type="text"
                                        value={day.locationLink || ""}
                                        disabled={copyFirstDay && index > 0}
                                        onChange={(e) => handleDayDetailChange(index, 'locationLink', e.target.value)}
                                        placeholder="Enter location link (optional)"
                                        className={copyFirstDay && index > 0 ? "disabled-input" : ""}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Description or Notes</label>
                              <textarea
                                value={day.description}
                                disabled={copyFirstDay && index > 0}
                                onChange={(e) => {
                                  handleDayDetailChange(index, 'description', e.target.value);
                                  if (copyFirstDay && index === 0) {
                                    // If copying is enabled and this is the first day, update all days
                                    const newValue = e.target.value;
                                    const updatedDayDetails = dayDetails.map((d, i) =>
                                      i === 0 ? d : { ...d, description: newValue }
                                    );
                                    setDayDetails(updatedDayDetails);
                                  }
                                }}
                                rows="3"
                                placeholder="Add any details or specific requirements for this day"
                                className={copyFirstDay && index > 0 ? "disabled-input" : ""}
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
                  <label>TOTAL AMOUNT</label>
                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BsCurrencyRupee /> {totalAmount}
                  </div>
                </div>
              </div>

              {/* Button text based on context */}
              <button type={eventType === "multi-day" && currentPage === 1 ? "button" : "submit"} className="submit-btn" onClick={(e) => {
                if (eventType === "multi-day" && currentPage === 1) {
                  e.preventDefault(); // Prevent form submission
                  handleNextPage(e);
                }
              }}>
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