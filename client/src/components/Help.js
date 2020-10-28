import React from 'react';

import {
  Modal,
  Fade,
  Backdrop,
  Container,
  Typography,
  Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
        <Container style={{ outline: 'none' }}>
          <Typography>
            <p>
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
            </p>
            <p>
              This visual representation highlights clusters or
              "constellations", which can be compared to those of other users
              that make their data public. It can help you gain a better
              understanding of the types of music you and your friends listen
              to, and even discover new artists and sounds!
            </p>
          </Typography>
        </Container>
      </Fade>
    </Modal>
  );
};

export default Help;
