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

    if (window.Spotify === null || !userActive) return;

    const { accessToken } = currentUser;

    // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/

    const player = new window.Spotify.Player({
      name: 'Constellate Web App',
      getOAuthToken: (cb) => {
        cb(accessToken);
      },
    });

    player.addListener('initialization_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('authentication_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('account_error', ({ message }) => {
      console.error(message);
    });
    player.addListener('playback_error', ({ message }) => {
      console.error(message);
    });

    player.addListener('player_state_changed', (state) =>
      this.props.changePlayerState(state)
    );

    player.addListener('ready', async ({ device_id }) => {
      await axios.put(
        'https://api.spotify.com/v1/me/player',
        { device_ids: [device_id], play: false },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      this.setState({ ready: true });
      console.log('Connected with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.connect();

    this.props.storePlayer(player);
  }

  render() {
    const { classes, player, playerState } = this.props;
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
              onClick={() => player.previousTrack()}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              aria-label="play/pause"
              onClick={() => player.togglePlay()}
            >
              {paused ? (
                <PlayArrowIcon className={classes.playIcon} />
              ) : (
                <PauseIcon className={classes.playIcon} />
              )}
            </IconButton>
            <IconButton aria-label="next" onClick={() => player.nextTrack()}>
              <SkipNextIcon />
            </IconButton>
          </div>
        </div>
      </Card>
    );
  }
}

function mapStateToProps({ currentUser, userActive, player, playerState }) {
  return { currentUser, userActive, player, playerState };
}

export default connect(mapStateToProps, actions)(withStyles(styles)(Player));
