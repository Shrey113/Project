import React, { useState, useEffect } from 'react';
import './AdminProfile.css';
import saveIcon from './sub_img/diskette.png';
import { format } from 'date-fns';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import user_img_1 from './profile_pic/user1.jpg';
import user_img_2 from './profile_pic/user2.jpg';
import user_img_3 from './profile_pic/user3.jpg';
import user_img_4 from './profile_pic/user4.jpg';
import ForgotPasswordPopup from './sub_part/ForgotPasswordPopup';
import { localstorage_key_for_admin_login, Server_url, showRejectToast, showAcceptToast, ConfirmMessage } from '../../../../redux/AllData';


function AdminProfile({ admin_email }) {
  const initial_data = {
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    role: '',
    admin_id: '',
    join_date: '',
    last_login: ''
  };



  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    isVisible: false,
    message_title: "",
    message: "",
    onConfirm: () => { }
  });



  const [data_error, set_data_error] = useState({
    full_name_error: '',
    email_error: '',
    phone_number_error: '',
    address_error: '',
    role_error: '',
    admin_id_error: '',
    join_date_error: '',
    last_login_error: ''

  });

  const [basic_info, set_basic_info] = useState(initial_data);
  const [original_data, set_original_data] = useState(initial_data);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordDataError, setPasswordDataError] = useState({
    oldPasswordError: '',
    newPasswordError: '',
    confirmPasswordError: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);

  const defaultImages = [
    { id: 1, src: user_img_1 },
    { id: 2, src: user_img_2 },
    { id: 3, src: user_img_3 },
    { id: 4, src: user_img_4 },
  ];

  const handleImageSelect = (imageSrc) => {
    setSelectedImage(imageSrc);
    localStorage.setItem(`profile_picture_${admin_email}`, imageSrc);
    setShowProfilePopup(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setSelectedImage(imageData);
        localStorage.setItem(`profile_picture_${admin_email}`, imageData);
        setShowProfilePopup(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateTimeString;
    }
  };

  useEffect(() => {
    if (admin_email) {
      fetch(`${Server_url}/Admin/get_admin_by_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_email })
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching admin data:', data.error);
            return;
          }



          const mapped_data = {
            full_name: data.admin_name || '',
            email: data.admin_email || '',
            phone_number: data.admin_phone_number || '',
            address: data.admin_address || '',
            role: data.access_type || '',
            admin_id: data.admin_id || '',
            join_date: data.date_of_joining || '',
            last_login: data.last_login || '',
            _original_join_date: data.date_of_joining || '',
            _original_last_login: data.last_login || ''
          };

          set_basic_info(mapped_data);
          set_original_data(mapped_data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }

    // Load profile picture from localStorage when component mounts
    const savedImage = localStorage.getItem(`profile_picture_${admin_email}`);
    if (savedImage) {
      setSelectedImage(savedImage);
    } else {
      setSelectedImage(user_img_1); // Default image if nothing is saved
    }
  }, [admin_email]);



  const has_changes = (field) => basic_info[field] !== original_data[field];

  const handle_input_change = (field, value) => {
    set_basic_info((prev) => ({ ...prev, [field]: value }));
  };

  const handle_save = (field) => {
    set_original_data((prev) => ({ ...prev, [field]: basic_info[field] }));

    console.log(`Saved ${field}:`, basic_info[field]);
  };

  const has_section_changes = (fields) => {
    return fields.some((field) => has_changes(field));
  };

  const prepareUpdateData = (fields) => {
    const updateData = { admin_email };

    fields.forEach(field => {
      if (has_changes(field)) {
        switch (field) {
          case 'full_name':
            updateData.admin_name = basic_info.full_name;
            break;
          case 'phone_number':
            updateData.admin_phone_number = basic_info.phone_number;
            break;
          case 'address':
            updateData.admin_address = basic_info.address;
            break;
          case 'role':
            updateData.access_type = basic_info.role;
            break;
          default:
            console.warn(`Unhandled field in prepareUpdateData: ${field}`);
            break;
        }
      }
    });

    return updateData;
  };

  const saveAdminData = async (fields) => {
    setIsLoading(true);
    try {
      const updateData = prepareUpdateData(fields);
      const roleIsChanging = fields.includes('role') && has_changes('role');

      const response = await fetch(`${Server_url}/Admin/save_admin_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.error) {
        showRejectToast({ message: 'Error saving data: ' + data.error });
        return false;
      }

      set_data_error({
        full_name_error: '',
        email_error: '',
        phone_number_error: '',
        address_error: '',
        role_error: '',
        admin_id_error: '',
        join_date_error: '',
        last_login_error: ''
      });

      // If role was changed, show message and log out
      if (roleIsChanging) {
        showAcceptToast({ message: 'Role updated successfully. Please log in again with your new permissions.' });
        setTimeout(() => {
          localStorage.removeItem(localstorage_key_for_admin_login);
          window.location.reload();
        }, 2000); // Give time for the toast message to be seen
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error making request:', error);
      showRejectToast({ message: 'Error saving data. Please try again.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  function is_valid_basic_info(fields) {
    let is_valid = true;
    if (!basic_info.full_name || typeof basic_info.full_name !== 'string' || basic_info.full_name.trim() === '') {

      set_data_error((prev) => ({ ...prev, full_name_error: "Full name is required and cannot be empty." }));
      is_valid = false;
    }

    // Check if email is valid
    if (!basic_info.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(basic_info.email)) {
      set_data_error((prev) => ({ ...prev, email_error: "Please enter a valid email address." }));
      is_valid = false;
    }

    // Check if phone number is valid
    if (!basic_info.phone_number || !/^\+?\d{10,15}$/.test(basic_info.phone_number)) {
      set_data_error((prev) => ({ ...prev, phone_number_error: "Please enter a valid phone number with 10 to 15 digits." }));
      is_valid = false;
    }

    // Check if address is valid
    if (!basic_info.address || typeof basic_info.address !== 'string' || basic_info.address.trim() === '') {
      set_data_error((prev) => ({ ...prev, address_error: "Address is required and cannot be empty." }));
      is_valid = false;
    }
    if (is_valid) {
      saveAdminData(fields).then(success => {
        if (success) {
          fields.forEach((field) => {
            handle_save(field);
          });
        }
      });
    }

  }

  function is_valid_account_details(fields) {
    let is_valid = true;

    if (!basic_info.role || basic_info.role === '') {
      set_data_error((prev) => ({ ...prev, role_error: "Please select an admin role." }));
      is_valid = false;
    }

    if (!basic_info.admin_id) {
      set_data_error((prev) => ({ ...prev, admin_id_error: "Admin ID is required and cannot be empty." }));
      is_valid = false;
    }

    if (!basic_info.join_date || typeof basic_info.join_date !== 'string' || basic_info.join_date.trim() === '') {
      set_data_error((prev) => ({ ...prev, join_date_error: "Join date is required and cannot be empty." }));
      is_valid = false;
    }

    if (!basic_info.last_login || typeof basic_info.last_login !== 'string' || basic_info.last_login.trim() === '') {
      set_data_error((prev) => ({ ...prev, last_login_error: "Last login is required and cannot be empty." }));
      is_valid = false;
    }

    if (is_valid) {
      saveAdminData(fields).then(success => {
        if (success) {
          fields.forEach((field) => {
            handle_save(field);
          });
        }
      });
    }
  }

  const handleRoleChange = (e) => {
    if (basic_info.role === 'Full' && e.target.value === 'Read Write') {
      // First check if this is the last Full admin in the system
      setIsLoading(true);
      fetch(`${Server_url}/Admin/count-full-admins`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(data => {
          setIsLoading(false);
          if (data.fullAdmins <= 1) {
            // This is the last Full admin, cannot change role
            setShowDeleteConfirm({
              isVisible: true,
              message_title: "Cannot Change Role",
              message: "As the last Full Access admin, your role cannot be changed to Read Write. A minimum of one Full Access admin must exist in the system for security reasons.",
              onConfirm: () => setShowDeleteConfirm({ isVisible: false }),
              buttonText: "Ok"
            });
          } else {
            // Not the last Full admin, confirm before changing
            setShowDeleteConfirm({
              isVisible: true,
              message_title: "Confirm Role Change",
              message: "Are you sure you want to change the role to Read Write? After save, this action cannot be reverted.",
              onConfirm: () => {
                handle_input_change('role', e.target.value);
              },
              buttonText: "Confirm"
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.error('Error checking admin count:', error);
          showRejectToast({ message: "Error checking admin status. Please try again." });
        });
    } else {
      // Changing to Full or already a Read Write admin, no restrictions
      handle_input_change('role', e.target.value);
    }
  };

  const validatePassword = (password) => {
    const minLength = 4;
    const hasNumber = /\d/.test(password);
    const hasCapital = /[A-Z]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 4 characters long";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasCapital) {
      return "Password must contain at least one capital letter";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate new password
    if (name === 'newPassword') {
      const error = validatePassword(value);
      setPasswordDataError(prev => ({
        ...prev,
        newPasswordError: error
      }));

      // Check if confirm password matches
      if (passwordData.confirmPassword) {
        setPasswordDataError(prev => ({
          ...prev,
          confirmPasswordError: value !== passwordData.confirmPassword
            ? "Passwords do not match"
            : ""
        }));
      }
    }

    // Validate confirm password
    if (name === 'confirmPassword') {
      setPasswordDataError(prev => ({
        ...prev,
        confirmPasswordError: value !== passwordData.newPassword
          ? "Passwords do not match"
          : ""
      }));
    }
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const newPasswordError = validatePassword(passwordData.newPassword);
    const confirmError = passwordData.newPassword !== passwordData.confirmPassword
      ? "Passwords do not match"
      : "";

    setPasswordDataError({
      oldPasswordError: passwordData.oldPassword ? "" : "Current password is required",
      newPasswordError,
      confirmPasswordError: confirmError
    });

    // Only proceed if there are no errors
    if (!newPasswordError && !confirmError && passwordData.oldPassword) {


      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    }
  };


  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleDeleteAccountClick = () => {
    // If user is a Full admin, we need to check if they're the last one
    if (basic_info.role === 'Full') {
      setIsLoading(true);
      fetch(`${Server_url}/Admin/count-full-admins`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(data => {
          setIsLoading(false);
          if (data.fullAdmins <= 1) {
            // This is the last Full admin, show warning message
            setShowDeleteConfirm({
              isVisible: true,
              message_title: "Cannot Delete Account",
              message: "As the last Full Access admin, your account cannot be deleted. A minimum of one Full Access admin must exist in the system for security reasons.",
              onConfirm: () => setShowDeleteConfirm({ isVisible: false }),
              buttonText: "Ok"
            });
          } else {
            // Not the last Full admin, show delete form
            setShowDeleteAccount(true);
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.error('Error checking admin count:', error);
          showRejectToast({ message: "Error checking admin status. Please try again." });
        });
    } else {
      // Read Write admin can delete their account without checking
      setShowDeleteAccount(true);
    }
  };

  const handleDeleteAccount = () => {
    const handleDeleteSubmit = () => {
      let isValid = true;

      if (!deletePassword) {
        setDeletePasswordError("Password is required");
        isValid = false;
      } else {
        setDeletePasswordError("");
      }

      if (deleteConfirmText.toLowerCase() !== 'confirm delete') {
        setDeleteError("Please type 'confirm delete' exactly");
        isValid = false;
      } else {
        setDeleteError("");
      }

      if (isValid) {
        // Check if the user is a Full admin and if they're the last one
        if (basic_info.role === 'Full') {
          // First check if this is the last Full admin in the system
          fetch(`${Server_url}/Admin/count-full-admins`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })
            .then(response => response.json())
            .then(data => {
              console.log("data from count-full-admins", data);
              if (data.fullAdmins <= 1) {
                // This is the last Full admin, cannot delete
                setDeleteError("Cannot delete the last Full admin account. Please assign Full access to another admin first.");
                return;
              } else {
                // Not the last Full admin, proceed with deletion
                proceedWithDeletion();
              }
            })
            .catch(error => {
              console.error('Error checking admin count:', error);
              setDeleteError("Error verifying admin status. Please try again.");
            });
        } else {
          // This is a Read Write admin, can delete without checking
          proceedWithDeletion();
        }
      }
    };

    const proceedWithDeletion = () => {
      fetch(`${Server_url}/Admin/delete_admin`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_email, admin_password: deletePassword })
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'No admin account found with this email') {
            showRejectToast({ message: "Your account not found with this email" });
          } else if (data.message === 'Incorrect password') {
            setDeletePasswordError("Your password is incorrect");
            showRejectToast({ message: "Your password is incorrect" });
          }

          if (data.status === 'success') {
            setShowDeleteAccount(false);
            showAcceptToast({ message: 'Account deleted successfully. You will be logged out now.' });

            // Log out user after successful deletion
            setTimeout(() => {
              localStorage.removeItem(localstorage_key_for_admin_login);
              window.location.reload();
            }, 2000); // Give time for the toast message to be seen
          }
        });
    };

    return (
      <div className="delete_account_popup">
        <button
          className="close_popup"
          onClick={() => setShowDeleteAccount(false)}
        >
          ✕
        </button>

        <h3>Delete Account</h3>
        <div className="delete_warning">
          <p>⚠️ Warning: This action cannot be undone!</p>
          <p>All your data will be permanently deleted.</p>
          {basic_info.role === 'Full' && (
            <p className="full_admin_warning">Note: If you are the last Full admin, deletion will not be allowed.</p>
          )}
        </div>

        <div className="delete_confirm_input">
          <label htmlFor="confirm_delete_password">Enter Password:</label>
          <div className="password_input_wrapper">
            <input
              type={showDeletePassword ? "text" : "password"}
              id="confirm_delete_password"
              placeholder="Enter Password"
              className="delete_input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <button
              type="button"
              className="password_toggle_btn"
              onClick={() => setShowDeletePassword(!showDeletePassword)}
            >
              {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="delete_error_input">
            {deletePasswordError}
          </div>
        </div>

        <div className="delete_confirm_input">
          <label htmlFor="confirm_delete_text">Type 'confirm delete' to proceed:</label>
          <input
            type="text"
            id="confirm_delete_text"
            placeholder="confirm delete"
            className="delete_input"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <div className="delete_error_input">
            {deleteError}
          </div>
        </div>

        <div className="delete_actions">
          <button
            className="delete_confirm_btn"
            onClick={handleDeleteSubmit}
          >
            Delete Account
          </button>
          <button
            className="delete_cancel_btn"
            onClick={() => setShowDeleteAccount(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };


  const handleForgotPassword = () => {
    // First validate the email
    if (!basic_info.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(basic_info.email)) {
      setPasswordDataError(prev => ({
        ...prev,
        oldPasswordError: "Please provide a valid email address"
      }));
      return;
    }

    setIsLoading(true);

    fetch(`${Server_url}/Admin/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_email })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setShowForgotPasswordPopup(true);
          setPasswordDataError(prev => ({
            ...prev,
            oldPasswordError: "" // Clear any previous errors
          }));
        } else {
          // Handle different error cases
          if (data.message === 'No admin account found with this email') {
            setPasswordDataError(prev => ({
              ...prev,
              oldPasswordError: "No account found with this email"
            }));
          } else {
            setPasswordDataError(prev => ({
              ...prev,
              oldPasswordError: "An error occurred. Please try again later."
            }));
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPasswordDataError(prev => ({
          ...prev,
          oldPasswordError: "Network error. Please check your connection."
        }));
      })
      .finally(() => {
        setIsLoading(false); // Hide loading state
      });
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault(); // Prevent form submission

    // Validate current password
    if (!passwordData.oldPassword) {
      setPasswordDataError(prev => ({
        ...prev,
        oldPasswordError: "Current password is required"
      }));
      return;
    }

    setIsLoading(true); // Show loading state

    fetch(`${Server_url}/Admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_email,
        current_password: passwordData.oldPassword,
        new_password: passwordData.newPassword
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          showAcceptToast({ message: 'Password changed successfully!' });
          setShowChangePassword(false);

          setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordDataError({
            oldPasswordError: '',
            newPasswordError: '',
            confirmPasswordError: ''
          });
        } else {

          if (data.message === 'No admin account found with this email') {
            setPasswordDataError(prev => ({
              ...prev,
              oldPasswordError: "Account not found"
            }));
          } else if (data.message === 'Current password is incorrect') {
            setPasswordDataError(prev => ({
              ...prev,
              oldPasswordError: "Current password is incorrect"
            }));
          } else if (data.message === 'Password reset successfully') {
            setShowForgotPasswordPopup(false);
          }

          else {
            setPasswordDataError(prev => ({
              ...prev,
              oldPasswordError: "An error occurred. Please try again."
            }));
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPasswordDataError(prev => ({
          ...prev,
          oldPasswordError: "Network error. Please try again later."
        }));
      })
      .finally(() => {
        setIsLoading(false); // Hide loading state
      });
  };

  const logout_as_admin = () => {
    setShowDeleteConfirm({
      isVisible: true,
      message_title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      onConfirm: () => {
        localStorage.removeItem(localstorage_key_for_admin_login); // Remove admin token from localStorage
        window.location.reload(); // Reload the page to reset the app state
      },
      buttonText: "Logout"
    });
  };


  return (
    <div className="admin_profile_container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div>Saving your data...</div>
          </div>
        </div>
      )}

      <section>
        <h3>Basic Information</h3>
        <div className="profile_item">
          <label>Profile Picture:</label>
          <div className="profile_img_wrapper">
            <img src={selectedImage} alt="Profile" className="profile_img" />
            <button
              className="change_img_btn"
              onClick={() => setShowProfilePopup(true)}
            >
              Change
            </button>
          </div>
        </div>

        <div className="profile_item">
          <label>Full Name:</label>
          <div className="editable_field">
            <input id="full_name" type="text" value={basic_info.full_name} onChange={(e) => handle_input_change('full_name', e.target.value)} className={`${data_error.full_name_error ? 'error_input' : ''}`} />
            <div className="all_error_input">
              {data_error.full_name_error}
            </div>
          </div>

        </div>

        <div className="profile_item">
          <label>Email Address:</label>
          <div className="editable_field">
            <input id="email" type="text" value={basic_info.email} onChange={(e) => handle_input_change('email', e.target.value)} className={`${data_error.email_error ? 'error_input' : ''}`} readOnly={true} title="This field is read-only" />
            <div className="all_error_input">
              {data_error.email_error}
            </div>
          </div>
        </div>


        <div className="profile_item">
          <label>Phone Number:</label>
          <div className="editable_field">
            <input
              id="phone_number"
              type="text"
              value={basic_info.phone_number}
              onChange={(e) => handle_input_change('phone_number', e.target.value)}
              className={`${data_error.phone_number_error ? 'error_input' : ''}`}
            />
            <div className="all_error_input">
              {data_error.phone_number_error}
            </div>
          </div>
        </div>

        <div className="profile_item">
          <label>Address:</label>
          <div className="editable_field">
            <input
              id="address"
              type="text"
              value={basic_info.address}
              onChange={(e) => handle_input_change('address', e.target.value)}
              className={`${data_error.address_error ? 'error_input' : ''}`}
            />
            <div className="all_error_input">
              {data_error.address_error}
            </div>
          </div>
        </div>

        {has_section_changes(['full_name', 'email', 'phone_number', 'address']) && (
          <button className="save_button" onClick={() => is_valid_basic_info(['full_name', 'email', 'phone_number', 'address'])}>
            <img src={saveIcon} alt="Save" className="save_icon" />
            <span>Save all </span>
          </button>
        )}
      </section>

      <section>
        <h3>Account Details</h3>
        <div className="profile_item">
          <label>Admin Role:</label>
          <div className="editable_field">
            <select
              id="role"
              value={basic_info.role}
              onChange={handleRoleChange}
              className={`select_input ${data_error.role_error ? 'error_input' : ''} ${original_data.role === 'Read Write' ? 'disabled-select' : ''
                }`}
              disabled={original_data.role === 'Read Write'}
            >
              <option value="Full">Full Access</option>
              <option value="Read Write">Read Write</option>
            </select>
            <div className="all_error_input">
              {data_error.role_error}
            </div>
          </div>
        </div>

        <div className="profile_item">
          <label>Admin ID:</label>
          <div className="editable_field">
            <input
              id="admin_id"
              type="text"
              value={basic_info.admin_id}
              onChange={(e) => handle_input_change('admin_id', e.target.value)}
              className={`${data_error.admin_id_error ? 'error_input' : ''}`}
              readOnly={true}

              title="This field is read-only"
            />
            <div className="all_error_input">
              {data_error.admin_id_error}
            </div>
          </div>
        </div>

        <div className="profile_item">
          <label>Date of Joining:</label>
          <div className="editable_field">
            <input
              id="join_date"
              type="text"
              value={formatDateTime(basic_info.join_date)}
              onChange={(e) => handle_input_change('join_date', e.target.value)}
              className={`${data_error.join_date_error ? 'error_input' : ''}`}
              readOnly={true}
              title="This field is read-only"
            />
            <div className="all_error_input">
              {data_error.join_date_error}
            </div>
          </div>
        </div>

        <div className="profile_item">
          <label>Last Login:</label>
          <div className="editable_field">
            <input
              id="last_login"
              type="text"
              value={formatDateTime(basic_info.last_login)}
              onChange={(e) => handle_input_change('last_login', e.target.value)}
              className={`${data_error.last_login_error ? 'error_input' : ''}`}
              readOnly={true}
              title="This field is read-only"
            />
            <div className="all_error_input">
              {data_error.last_login_error}
            </div>
          </div>
        </div>

        {has_section_changes(['role', 'admin_id', 'join_date', 'last_login']) && (
          <button className="save_button" onClick={() => is_valid_account_details(['role', 'admin_id', 'join_date', 'last_login'])}>
            <img src={saveIcon} alt="Save" className="save_icon" />
            Save all
          </button>
        )}
      </section>
      <section className='security_settings'>
        <h3>Security Settings</h3>

        <div className="button_con">
          <button
            className="change_password"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
          <button
            className="delete_account"
            onClick={handleDeleteAccountClick}
          >
            Delete Account
          </button>
          <button className="Logout_button" onClick={() => logout_as_admin()}>Logout</button>
        </div>
      </section>


      {showProfilePopup && (
        <div className="profile_popup_overlay">
          <div className="profile_popup">
            <h4>Select Profile Picture</h4>
            <div className="default_images">
              {defaultImages.map((image) => (
                <img
                  key={image.id}
                  src={image.src}
                  alt={`Default ${image.id}`}
                  onClick={() => handleImageSelect(image.src)}
                />
              ))}
            </div>
            <div className="upload_section">
              <h4>Or upload your own</h4>
              <input
                type="file"
                accept="image/*"
                id="profile_upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="profile_upload">Choose File</label>
            </div>
            <button
              className="close_popup"
              onClick={() => setShowProfilePopup(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="profile_popup_overlay" onClick={() => setShowChangePassword(false)}>
          <div className="change_password_container" onClick={e => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form className="password_form" onSubmit={handleSubmitPassword}>
              <div className="password_field">
                <label>Current Password:</label>
                <div className="password_input_wrapper">
                  <input
                    type={showPasswords.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password_toggle_btn"
                    onClick={() => togglePasswordVisibility('oldPassword')}
                  >
                    {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordDataError.oldPasswordError && (
                  <span className="error_message">{passwordDataError.oldPasswordError}</span>
                )}
              </div>

              <div className="password_field">
                <label>New Password:</label>
                <div className="password_input_wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password_toggle_btn"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordDataError.newPasswordError && (
                  <span className="error_message">{passwordDataError.newPasswordError}</span>
                )}
              </div>

              <div className="password_field">
                <label>Confirm New Password:</label>
                <div className="password_input_wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password_toggle_btn"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordDataError.confirmPasswordError && (
                  <span className="error_message">{passwordDataError.confirmPasswordError}</span>
                )}
              </div>
              <div className="forgot_password_text">
                <span onClick={() => handleForgotPassword()}>
                  Forgot Password?
                </span>
              </div>
              <div className="password_buttons">
                <button type="submit" className="change_pwd_btn" onClick={handleForgotPasswordSubmit}>
                  Change Password
                </button>
                <button
                  type="button"
                  className="forgot_pwd_btn"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div className="profile_popup_overlay">

          {handleDeleteAccount()}

        </div>
      )}

      {showForgotPasswordPopup && (
        <ForgotPasswordPopup
          closeFunction={() => setShowForgotPasswordPopup(false)}
          admin_email={basic_info.email}
        />
      )}


      {showDeleteConfirm.isVisible && (
        <ConfirmMessage
          message_title={showDeleteConfirm.message_title}
          message={showDeleteConfirm.message}
          onCancel={() => setShowDeleteConfirm({ ...showDeleteConfirm, isVisible: false })}
          onConfirm={showDeleteConfirm.onConfirm}
          button_text={showDeleteConfirm.buttonText || "Ok"}
        />
      )}
    </div>
  );
}

export default AdminProfile;
