import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from '@material-ui/core';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/SkipNext';

const styles = (theme) => ({
  root: {
    display: 'flex',
  },
  cover: {
    width: 151,
    margin: theme.spacing(1),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
});

class Player extends Component {
  componentDidMount() {
    if (!window.Spotify || window.Spotify === null) return;

    const { accessToken } = this.props.currentUser;

    // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/

    this.player = new window.Spotify.Player({
      name: 'Constellate Web App',
      getOAuthToken: (cb) => {
        cb(accessToken);
      },
    });

    this.player.addListener('initialization_error', ({ message }) => {
      console.error(message);
    });
    this.player.addListener('authentication_error', ({ message }) => {
      console.error(message);
    });
    this.player.addListener('account_error', ({ message }) => {
      console.error(message);
    });
    this.player.addListener('playback_error', ({ message }) => {
      console.error(message);
    });

    this.player.addListener('player_state_changed', (state) => {
      this.props.changePlayerState(state);
    });

    this.player.addListener('ready', ({ device_id }) => {
      axios
        .put('/api/spotify/player', { deviceId: device_id })
        .catch((err) => console.log(err.response));
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.connect();

    this.props.setDeviceId(this.player._options.id);
  }

  render() {
    const { classes, userActive, selectedArtist, playerState } = this.props;

    if (!userActive || selectedArtist === null || playerState === null) {
      return <div></div>;
    }

    const { paused } = playerState;
    const { name, album, artists } = playerState.track_window.current_track;

    return (
      <Card className={classes.root}>
        {album.images.length && (
          <CardMedia
            className={classes.cover}
            image={album.images[0].url}
            title={album.name}
          />
        )}
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {artists.map(({ name }) => name).join(', ')}
            </Typography>
          </CardContent>
          <div className={classes.controls}>
            <IconButton
              aria-label="previous"
              onClick={() => this.player.previousTrack()}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              aria-label="play/pause"
              onClick={() => this.player.togglePlay()}
            >
              {paused ? (
                <PlayArrowIcon className={classes.playIcon} />
              ) : (
                <PauseIcon className={classes.playIcon} />
              )}
            </IconButton>
            <IconButton
              aria-label="next"
              onClick={() => this.player.nextTrack()}
            >
              <SkipNextIcon />
            </IconButton>
          </div>
        </div>
      </Card>
    );
  }
}

function mapStateToProps({
  currentUser,
  userActive,
  selectedArtist,
  playerState,
}) {
  return { currentUser, userActive, selectedArtist, playerState };
}

export default connect(mapStateToProps, actions)(withStyles(styles)(Player));
