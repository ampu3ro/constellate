import React from 'react';
import { Typography } from '@material-ui/core';
import Dial from './Dial';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
  },
  header: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
  },
  dial: {
    position: 'absolute',
    top: theme.spacing(2),
    right: 0,
  },
}));

const Landing = ({ TransitionProps }) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <Typography variant="h2">Constellate</Typography>
        <Typography variant="subtitle1">
          Visualize the constellation of artists you listen to on Spotify
        </Typography>
      </div>
      <div className={classes.dial}>
        <Dial TransitionProps={TransitionProps} />
      </div>
    </div>
  );
};

export default Landing;
