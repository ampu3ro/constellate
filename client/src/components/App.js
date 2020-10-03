import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Landing from './Landing';
import Artists from './Artists';

import {
  Container,
  CssBaseline,
  Modal,
  Fade,
  Backdrop,
  Typography,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import spotifyTheme from '../theme';

class App extends Component {
  state = { open: false, in: false };

  componentDidMount() {
    this.props.fetchCurrentUser().then(() => {
      const { currentUser } = this.props;
      this.setState({
        open: !currentUser,
        in: !!currentUser,
      });
    });
  }

  render() {
    const timeout = 1000;

    return (
      <div>
        <ThemeProvider theme={spotifyTheme}>
          <CssBaseline>
            <Modal
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              open={this.state.open}
              onClose={() => this.setState({ open: false, in: true })}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{ timeout }}
            >
              <Fade in={this.state.open} timeout={{ enter: timeout, exit: 0 }}>
                <Container style={{ outline: 'none' }}>
                  <Typography>
                    Constellate is an interactive visualization of the artists
                    you listen to most on Spotify. Once you connect to your
                    account and update your data, you will see a network graph
                    linking artists that are similar (according to Spotify's
                    analysis). This visual representation highlights clusters or
                    "constellations", which can be compared to those of other
                    users that make their data public. Ideally, it will help you
                    gain a better understanding of the types of music you and
                    your friends listen to, and eventually leads to discovery of
                    new artists and sounds!
                  </Typography>
                </Container>
              </Fade>
            </Modal>

            <Container>
              <BrowserRouter>
                <div>
                  <Route exact path="/">
                    <Landing TransitionProps={{ in: this.state.in, timeout }} />
                  </Route>
                  <Artists />
                </div>
              </BrowserRouter>
            </Container>
          </CssBaseline>
        </ThemeProvider>
      </div>
    );
  }
}

function mapStateToProps({ currentUser }) {
  return { currentUser };
}

export default connect(mapStateToProps, actions)(App);
