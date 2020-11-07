import React from 'react';

import {
  Modal,
  Fade,
  Backdrop,
  Paper,
  Typography,
  Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: '80%',
    outline: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typography: {
    margin: theme.spacing(5),
  },
}));

const Help = ({ open, onClose, timeout }) => {
  const classes = useStyles();

  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout }}
    >
      <Fade in={open} timeout={{ enter: timeout, exit: 0 }}>
        <Paper className={classes.paper}>
          <div className={classes.typography}>
            <Typography paragraph>
              Constellate is an interactive visualization of the artists you
              listen to most on Spotify. Once you connect to your account and
              update your data, you will see a network graph linking artists
              that are{' '}
              <Link
                href="https://artists.spotify.com/blog/how-fans-also-like-works"
                target="_"
              >
                similar
              </Link>
              .
            </Typography>
            <Typography paragraph>
              This visual representation highlights clusters or
              "constellations", which can also be compared to those of other
              users that make their data public. It can help you gain a better
              understanding of the types of music you listen to, and where there
              are similarities with your friends' preferences.
            </Typography>
            <Typography>
              Click on a node/star to play top songs from that artist and
              discover music others listen to. Scroll to zoom in and out of the
              star map and drag to pan.
            </Typography>
          </div>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default Help;
