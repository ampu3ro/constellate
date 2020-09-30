import axios from 'axios';

export const fetchCurrentUser = () => async (dispatch) => {
  const res = await axios.get('/api/current_user');
  dispatch({ type: 'current_user', payload: res.data });
};

export const fetchPublicUsers = () => async (dispatch) => {
  const res = await axios.get('/api/public_users');
  dispatch({ type: 'public_users', payload: res.data });
};

export const fetchArtists = (values) => async (dispatch) => {
  const res = await axios.post('/api/artists', values);
  dispatch({ type: 'artists', payload: res.data });
};
