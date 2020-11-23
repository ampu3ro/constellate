import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setHelpButton } from '../actions';
import axios from 'axios';

import { Dialog, DialogContent, LinearProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = (theme) => ({
  content: {
    margin: theme.spacing(1),
  },
});

class Loading extends Component {
  componentDidMount() {
    axios.get('/api/spotify/artists').then(() => {
      this.props.setHelpButton(false);
    });
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={() => null}>
        <DialogContent className={this.props.classes.content}>
          Loading artist data from Spotify
        </DialogContent>
        <LinearProgress />
      </Dialog>
    );
  }
}

export default connect(null, { setHelpButton })(withStyles(styles)(Loading));
