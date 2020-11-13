import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
  currentUser: (state = null, action) =>
    action.type === 'current_user' ? action.payload : state,
  publicUsers: (state = [], action) =>
    action.type === 'public_users' ? action.payload : state,
  artists: (state = [], action) =>
    action.type === 'artists' ? action.payload : state,
  selectedArtist: (state = null, action) =>
    action.type === 'selected' ? action.payload : state,
  similarArtists: (state = [], action) =>
    action.type === 'similar' ? action.payload : state,
  userActive: (state = false, action) =>
    action.type === 'active_user' ? !action.payload.error : state,
  helpOpen: (state = false, action) =>
    action.type === 'help' ? action.payload : state,
  deviceId: (state = '', action) =>
    action.type === 'device_id' ? action.payload : state,
  playerState: (state = null, action) =>
    action.type === 'player_state' ? action.payload : state,
  form: formReducer,
});
