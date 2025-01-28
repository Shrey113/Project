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
  
  user_profile_image_base64: '',
  business_profile_base64: '',
};

const user_data = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_Owner':
      return { ...state, ...action.payload };
    case 'RESET_USER_Owner':
      return initialState;
    default:
      return state;
  }
};

export default user_data;
