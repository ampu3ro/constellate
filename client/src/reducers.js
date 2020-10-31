import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
  currentUser: (state = null, action) =>
    action.type === 'current_user' ? action.payload || false : state,
  publicUsers: (state = [], action) =>
    action.type === 'public_users' ? action.payload || false : state,
  artists: (state = [], action) =>
    action.type === 'artists' ? action.payload || false : state,
  userActive: (state = false, action) =>
    action.type === 'active_user' ? !action.payload.error : state,
  helpOpen: (state = false, action) =>
    action.type === 'help' ? action.payload : state,
  playerState: (state = null, action) =>
    action.type === 'player' ? action.payload : state,
  form: formReducer,
});
