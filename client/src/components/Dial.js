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

class Dial extends Component {
  state = {
    open: false,
    loading: false,
    success: false,
    form: false,
  };

  componentDidMount() {
    this.props.fetchActiveUser();
  }

  render() {
    const { currentUser, userActive, history, TransitionProps } = this.props;

    if (currentUser === null) return <div></div>;

    const handleUpdate = async () => {
      this.setState({ loading: true, success: false });
      await axios.get('/api/spotify/artists');
      history.push('/');
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

    return (
      <SpeedDial
        ariaLabel="Spotify Speed Dial"
        icon={
          <SpeedDialIcon
            icon={<FontAwesomeIcon icon={faSpotify} size="2x" color="white" />}
          />
        }
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        direction="down"
        TransitionProps={TransitionProps}
      >
        <SpeedDialAction
          key="account"
          icon={<AccountCircleIcon />}
          tooltipTitle={
            userActive ? 'Log out' : currentUser ? 'Reconnect' : 'Log in'
          }
          FabProps={{
            href: userActive ? '/api/logout' : '/auth/spotify',
          }}
        />
        {currentUser && (
          <SpeedDialAction
            key="public"
            icon={<PublicIcon />}
            tooltipTitle={
              'Make artist data ' +
              (currentUser.isPublic ? 'private' : 'public')
            }
            onClick={handlePublic}
          />
        )}
        {userActive && !this.state.success && (
          <SpeedDialAction
            key="update"
            icon={this.state.loading ? <CircularProgress /> : <UpdateIcon />}
            tooltipTitle="Get/update data"
            onClick={handleUpdate}
          />
        )}
      </SpeedDial>
    );
  }
}

function mapStateToProps({ currentUser, userActive, form }) {
  return { currentUser, userActive, form };
}

export default connect(mapStateToProps, actions)(withRouter(Dial));
