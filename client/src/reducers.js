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
    action.type === 'selected_artist' ? action.payload : state,
  similarArtists: (state = [], action) =>
    action.type === 'similar' ? action.payload : state,
  userActive: (state = false, action) =>
    action.type === 'active_user' ? action.payload : state,
  selectedUsers: (state = [], action) =>
    action.type === 'selected_users' ? action.payload : state,
  helpOpen: (state = false, action) =>
    action.type === 'help' ? action.payload : state,
  helpButton: (state = false, action) =>
    action.type === 'help_button' ? action.payload : state,
  dialOpen: (state = false, action) =>
    action.type === 'dial' ? action.payload : state,
  noteOpen: (state = false, action) =>
    action.type === 'note' ? action.payload : state,
  showGenres: (state = false, action) =>
    action.type === 'genres' ? action.payload : state,
  showOverlap: (state = false, action) =>
    action.type === 'overlap' ? action.payload : state,
  deviceId: (state = '', action) =>
    action.type === 'device_id' ? action.payload : state,
  playerState: (state = null, action) =>
    action.type === 'player_state' ? action.payload : state,
  form: formReducer,
});
