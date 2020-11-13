import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getArtist, getSimilar, updatePlayer } from './actions';

export const useArtistSelected = () => {
  const dispatch = useDispatch();
  const deviceId = useSelector(({ deviceId }) => deviceId);

  const artistSelected = useCallback(
    async (artistId) => {
      const selected = await getArtist(artistId);
      const similar = await getSimilar(artistId);
      dispatch(selected);
      dispatch(similar);
      updatePlayer(artistId, deviceId);
    },
    [dispatch, deviceId]
  );

  return { artistSelected };
};
