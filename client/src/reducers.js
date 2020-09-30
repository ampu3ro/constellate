import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
  currentUser: (state = null, action) =>
    action.type === 'current_user' ? action.payload || false : state,
  publicUsers: (state = [], action) =>
    action.type === 'public_users' ? action.payload || false : state,
  artists: (state = [], action) =>
    action.type === 'artists' ? action.payload || false : state,
  form: formReducer,
});
