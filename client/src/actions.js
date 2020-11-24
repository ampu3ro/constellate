import axios from 'axios';

export const fetchCurrentUser = () => async (dispatch) => {
  const res = await axios.get('/api/current_user');
  dispatch({ type: 'current_user', payload: res.data });
};

export const checkActiveUser = (currentUser) => (dispatch) => {
  const active = Date.parse(currentUser?.tokenExpires) >= Date.now();
  dispatch({ type: 'active_user', payload: active });
};

export const fetchPublicUsers = () => async (dispatch) => {
  const res = await axios.get('/api/public_users');
  dispatch({ type: 'public_users', payload: res.data });
};

export const fetchArtists = (spotifyIds) => async (dispatch) => {
  const res = await axios.post('/api/artists', spotifyIds);
  dispatch({ type: 'artists', payload: res.data });
};

export const setUsers = (users) => ({
  type: 'selected_users',
  payload: users,
});

export const setHelpOpen = (open) => ({ type: 'help', payload: open });

export const setHelpButton = (clicked) => ({
  type: 'help_button',
  payload: clicked,
});

export const setNoteOpen = (open) => ({ type: 'note', payload: open });

export const setDeviceId = (deviceId) => ({
  type: 'device_id',
  payload: deviceId,
});

export const changePlayerState = (state) => ({
  type: 'player_state',
  payload: state,
});

export const getArtist = async (artistId) => {
  const res = await axios.get('/api/spotify/artist', { params: { artistId } });
  return { type: 'selected_artist', payload: res.data };
};

export const getSimilar = async (artistId) => {
  const res = await axios.get('/api/spotify/similar', { params: { artistId } });
  return { type: 'similar', payload: res.data };
};

export const updatePlayer = async (artistId, deviceId) => {
  await axios.put('/api/spotify/play', { artistId, deviceId });
  return { type: 'play' };
};
