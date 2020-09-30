import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../actions';

import axios from 'axios';
import { withRouter } from 'react-router';

import { withStyles } from '@material-ui/core/styles';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import UpdateIcon from '@material-ui/icons/Update';
import PublicIcon from '@material-ui/icons/Public';

import { CircularProgress } from '@material-ui/core';

const dialStyles = (theme) => ({
  root: {
    transform: 'translateZ(0px)',
    flexGrow: 1,
  },
  wrapper: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    height: 380,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class Dial extends Component {
  state = { open: false, loading: false, success: false, form: false };

  componentDidMount() {
    this.props.fetchCurrentUser();
  }

  render() {
    const { currentUser, classes, history } = this.props;

    if (currentUser === null) return <div></div>;

    const handleUpdate = async () => {
      this.setState({ loading: true, success: false });
      await axios.get('/api/spotify');
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
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <SpeedDial
            ariaLabel="Spotify Speed Dial"
            icon={
              <SpeedDialIcon
                icon={
                  <FontAwesomeIcon icon={faSpotify} size="2x" color="white" />
                }
              />
            }
            onClose={() => this.setState({ open: false })}
            onOpen={() => this.setState({ open: true })}
            open={this.state.open}
            direction="down"
          >
            <SpeedDialAction
              key="account"
              icon={<AccountCircleIcon />}
              tooltipTitle={currentUser ? 'Log out' : 'Log in'}
              FabProps={{ href: currentUser ? '/api/logout' : '/auth/spotify' }}
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
            {currentUser && !this.state.success && (
              <SpeedDialAction
                key="update"
                icon={
                  this.state.loading ? <CircularProgress /> : <UpdateIcon />
                }
                tooltipTitle="Get/update data"
                onClick={handleUpdate}
              />
            )}
          </SpeedDial>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ currentUser, form }) {
  return { currentUser, form };
}

export default connect(
  mapStateToProps,
  actions
)(withStyles(dialStyles)(withRouter(Dial)));
