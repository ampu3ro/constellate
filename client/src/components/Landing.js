import React from 'react';
import { IconButton, Typography } from '@material-ui/core';
import Dial from './Dial';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
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

const Landing = ({ TransitionProps, onHelpClick }) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <Typography variant="h2">Constellate</Typography>
        <Typography variant="subtitle1">
          Explore the constellation of artists you listen to on Spotify
          <IconButton
            size="small"
            style={{ marginLeft: 5, marginBottom: 10 }}
            onClick={onHelpClick}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Typography>
      </div>
      <div className={classes.dial}>
        <Dial TransitionProps={TransitionProps} />
      </div>
    </div>
  );
};

export default Landing;
