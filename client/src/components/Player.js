import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changePlayerState } from '../actions';
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
    width: 'auto',
    margin: theme.spacing(5),
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
  state = { ready: false };

  componentDidMount() {
    const { currentUser, userActive } = this.props;

    if (window.Spotify === null || !currentUser || !userActive) return;

    const { accessToken } = currentUser;

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

    this.player.addListener('player_state_changed', (state) =>
      this.props.changePlayerState(state)
    );

    this.player.addListener('ready', async ({ device_id }) => {
      await axios.put(
        'https://api.spotify.com/v1/me/player',
        { device_ids: [device_id], play: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      this.setState({ ready: true });
      console.log('Connected with Device ID', device_id);
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.connect();
  }

  render() {
    const { classes, playerState } = this.props;
    const { ready } = this.state;

    if (!ready || playerState === null) {
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

function mapStateToProps({ currentUser, userActive, playerState }) {
  return { currentUser, userActive, playerState };
}

export default connect(mapStateToProps, { changePlayerState })(
  withStyles(styles)(Player)
);
