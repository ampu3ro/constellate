import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';

import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

class Note extends Component {
  render() {
    const { noteOpen, setNoteOpen, setDialOpen } = this.props;

    const handleClose = (event, reason) => {
      if (reason === 'clickaway') return;
      setNoteOpen(false);
      setDialOpen(true);
    };

    return (
      <Snackbar
        className={this.props.className}
        open={noteOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <MuiAlert severity="info" variant="filled" onClose={handleClose}>
          Reconnect to Spotify to play sample music
        </MuiAlert>
      </Snackbar>
    );
  }
}

function mapStateToProps({ noteOpen }) {
  return { noteOpen };
}

export default connect(mapStateToProps, actions)(Note);
