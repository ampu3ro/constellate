import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import axios from 'axios';
import { withRouter } from 'react-router';

import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import UpdateIcon from '@material-ui/icons/Update';
import PublicIcon from '@material-ui/icons/Public';
import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
  tooltip: {
    maxWidth: 600,
  },
});

class Dial extends Component {
  state = {
    loading: false,
    success: false,
    form: false,
  };

  tick = () => {
    this.props.checkActiveUser(this.props.currentUser);
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {
      classes,
      currentUser,
      userActive,
      dialOpen,
      setDialOpen,
      TransitionProps,
    } = this.props;

    if (currentUser === null) return <div></div>;

    const handleUpdate = async () => {
      this.setState({ loading: true, success: false });
      await axios.get('/api/spotify/artists');
      this.setState({ loading: false, success: true });
    };

    const handlePublic = async () => {
      const user = {
        spotifyId: currentUser.spotifyId,
        isPublic: !currentUser.isPublic,
      };
      await axios.post('/api/update_user', user);
      await this.props.fetchCurrentUser();
      await this.props.fetchPublicUsers();
    };

    const isTouch = 'ontouchstart' in window;

    return (
      <SpeedDial
        ariaLabel="Spotify Speed Dial"
        icon={
          <SpeedDialIcon
            icon={<FontAwesomeIcon icon={faSpotify} size="2x" color="white" />}
          />
        }
        onClose={() => setDialOpen(false)}
        onOpen={() => setDialOpen(true)}
        open={dialOpen}
        direction="down"
        TransitionProps={TransitionProps}
      >
        <SpeedDialAction
          key="account"
          icon={<AccountCircleIcon />}
          className={classes.tooltip}
          tooltipTitle={
            userActive ? 'Log out' : currentUser ? 'Reconnect' : 'Log in'
          }
          tooltipOpen={isTouch}
          FabProps={{
            href: userActive
              ? '/api/logout'
              : currentUser
              ? '/auth/spotify/reconnect'
              : '/auth/spotify',
          }}
        />
        {userActive && (
          <SpeedDialAction
            key="public"
            icon={<PublicIcon />}
            className={classes.tooltip}
            tooltipTitle={
              'Make artist data ' +
              (currentUser.isPublic ? 'private' : 'public')
            }
            tooltipOpen={isTouch}
            onClick={handlePublic}
          />
        )}
        {userActive && !this.state.success && (
          <SpeedDialAction
            key="update"
            icon={this.state.loading ? <CircularProgress /> : <UpdateIcon />}
            className={classes.tooltip}
            tooltipTitle="Get/update data"
            tooltipOpen={isTouch}
            onClick={handleUpdate}
          />
        )}
      </SpeedDial>
    );
  }
}

function mapStateToProps({ currentUser, userActive, dialOpen, form }) {
  return { currentUser, userActive, dialOpen, form };
}

export default connect(
  mapStateToProps,
  actions
)(withRouter(withStyles(styles)(Dial)));
