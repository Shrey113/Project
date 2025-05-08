const initialState = {
  client_id: 0,
  user_name: '',
  user_email: '',
  user_password: '',
  business_name: '',
  business_address: '',
  mobile_number: '',
  gst_number: '',
  user_Status: '',
  admin_message: '',
  user_role: 'test',
  set_status_by_admin: '',
  first_name: '',
  last_name: '',
  gender: '',
  social_media: '',
  website: '',
  services: '',
  business_email: '',
  skill: '',

  user_profile_image_base64: '',
  business_profile_base64: '',

  // UI state is now managed via React Context instead of Redux
  // to prevent unnecessary re-renders
};

// Create a shallow copy of state only when necessary
// This helps prevent unnecessary re-renders
const user_data = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_Owner': {
      // Only create a new state object if something actually changed
      const newState = { ...state };
      let hasChanged = false;

      Object.entries(action.payload).forEach(([key, value]) => {
        if (state[key] !== value) {
          newState[key] = value;
          hasChanged = true;
        }
      });

      return hasChanged ? newState : state;
    }
    case 'RESET_USER_Owner':
      return initialState;
    default:
      return state;
  }
};

export default user_data;
