import React, { useEffect, useState, useRef } from "react";
import "./SeletedCard.css";
import { IoClose } from "react-icons/io5";
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
  },
});

function SeletedCard({ type, onClose, selectedData, selectedOwner }) {
  const user = useSelector((state) => state.user);
  const [blockedDates, setBlockedDates] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    console.log("selectedData", selectedData);
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
    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email,
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
    }
  };

  const add_package_request = async () => {
    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email,
    };
    // console.log("datassssssssssssssssssss", data);

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
    }
  };

  const add_service_request = async () => {
    const data = {
      ...formData,
      event_name: type,
      sender_email: user.user_email,
      receiver_email: selectedOwner.user_email,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateDates()) {
      return;
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
          fontSize: "20px",
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
              <div className="info-section">
                <div className="info-group">
                  <label>Equipment Name</label>
                  <div className="info-value">{formData.name}</div>
                  {/* <div className="info-value">{formData.start_date}</div> */}
                </div>

                <div className="date-time-container">
                  <ThemeProvider theme={theme}>
                    <div className="date-input-group">
                      <label className="form-label">Start Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    <div className="date-input-group">
                      <label className="form-label">End Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </ThemeProvider>
                </div>
                <div className="info-group">
                  <label>Company</label>
                  <div className="info-value">{formData.equipment_company}</div>
                </div>
                <div className="info-group">
                  <label>Equipment Type</label>
                  <div className="info-value">{formData.equipment_type}</div>
                </div>
                <div className="info-group">
                  <label>Description</label>
                  <div className="info-value">
                    {formData.equipment_description}
                  </div>
                </div>
                <div className="info-group">
                  <label>Price per Day</label>
                  <div className="info-value">
                    {formData.equipment_price_per_day}
                  </div>
                </div>
              </div>

              {/* User Input Section */}
              <div className="form-group">
                <label>Number of Days Required</label>
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
              <div className="info-group total-amount">
                <label>Total Amount</label>
                <div className="info-value">₹{formData.total_amount}</div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-btn">
                Book Now
              </button>
            </form>
          </div>
        )}

        {type === "package" && (
          <div className="package-card-container-selected">
            <div className="package-card-title-selected">Package Booking</div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <div className="info-section">
                <div className="info-group">
                  <label>Package Name</label>
                  <div className="info-value">{formData.package_name}</div>
                </div>
                <div className="date-time-container">
                  <ThemeProvider theme={theme}>
                    <div className="date-input-group">
                      <label className="form-label">Start Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    <div className="date-input-group">
                      <label className="form-label">End Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </ThemeProvider>
                </div>
                <div className="info-group">
                  <label>Service</label>
                  <div className="info-value">{formData.service}</div>
                </div>
                <div className="info-group">
                  <label>Description</label>
                  <div className="info-value">{formData.description}</div>
                </div>
                <div className="info-group">
                  <label>Price</label>
                  <div className="info-value">{formData.price}</div>
                </div>
              </div>

              {/* User Input Section */}
              <div className="form-group">
                <label>Number of Days Required</label>
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
              <div className="info-group total-amount">
                <label>Total Amount</label>
                <div className="info-value">₹{formData.total_amount}</div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-btn">
                Book Package
              </button>
            </form>
          </div>
        )}

        {type === "service" && (
          <div className="service-card-container-selected">
            <div className="service-card-title-selected">Service Booking</div>
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Information Display Section */}
              <div className="info-section">
                <div className="info-group">
                  <label>Service Name</label>
                  <div className="info-value">{formData.service_name}</div>
                </div>
                <div className="date-time-container">
                  <ThemeProvider theme={theme}>
                    <div className="date-input-group">
                      <label className="form-label">Start Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    <div className="date-input-group">
                      <label className="form-label">End Date:</label>
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
                              sx: {
                                "& .MuiFormHelperText-root": {
                                  color: "#d32f2f",
                                  marginLeft: "0",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </ThemeProvider>
                </div>
                <div className="info-group">
                  <label>Description</label>
                  <div className="info-value">{formData.description}</div>
                </div>
                <div className="info-group">
                  <label>Price</label>
                  <div className="info-value">{formData.service_price}</div>
                </div>
              </div>

              {/* User Input Section */}
              <div className="form-group">
                <label>Number of Days Required</label>
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
              <div className="info-group total-amount">
                <label>Total Amount</label>
                <div className="info-value">₹{formData.total_amount}</div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-btn">
                Book Service
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeletedCard;
