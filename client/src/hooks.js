import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getArtist, getSimilar, updatePlayer, setNoteOpen } from './actions';

export const useArtistSelected = () => {
  const dispatch = useDispatch();
  const userActive = useSelector(({ userActive }) => userActive);
  const deviceId = useSelector(({ deviceId }) => deviceId);

  const artistSelected = useCallback(
    async (artistId) => {
      if (!artistId) return;
      if (userActive) {
        const selected = await getArtist(artistId);
        const similar = await getSimilar(artistId);
        dispatch(selected);
        dispatch(similar);
        updatePlayer(artistId, deviceId);
      } else {
        dispatch(setNoteOpen(true));
      }
    },
    [dispatch, userActive, deviceId]
  );

  return artistSelected;
};
