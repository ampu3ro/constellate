import React from 'react';
import { Typography } from '@material-ui/core';

const Landing = () => {
  return (
    <div>
      <Typography variant="h2" style={{ marginTop: '20px' }}>
        Constellate
      </Typography>
      <Typography style={{ marginBottom: '50px' }}>
        Visualize the constellation of artists you listen to on Spotify
      </Typography>
    </div>
  );
};

export default Landing;
