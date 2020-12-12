import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Landing from './Landing';
import Help from './Help';
import Artists from './Artists';
import Loading from './Loading';

import { Container, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import spotifyTheme from '../theme';

class App extends Component {
  state = { in: false, open: false };

  componentDidMount() {
    this.props.fetchCurrentUser().then(() => {
      const { currentUser } = this.props;
      this.props.setHelpOpen(!currentUser);
      this.setState({ in: !!currentUser });
    });
  }

  render() {
    const timeout = 1000;
    const {
      currentUser,
      userActive,
      helpOpen,
      setHelpOpen,
      helpButton,
    } = this.props;

    const onClose = () => {
      setHelpOpen(false);
      this.setState({ in: true });
    };

    return (
      <div>
        <ThemeProvider theme={spotifyTheme}>
          <CssBaseline>
            <BrowserRouter>
              <Help open={helpOpen} onClose={onClose} timeout={timeout} />
              {userActive ? <Loading open={helpButton} /> : null}
              <Container>
                <div>
                  <Route exact path="/">
                    <Landing
                      TransitionProps={{ in: this.state.in, timeout }}
                      onHelpClick={() => setHelpOpen(true)}
                    />
                  </Route>
                  {currentUser ? <Artists /> : null}
                </div>
              </Container>
            </BrowserRouter>
          </CssBaseline>
        </ThemeProvider>
      </div>
    );
  }
}

function mapStateToProps({ currentUser, helpOpen, userActive, helpButton }) {
  return { currentUser, helpOpen, userActive, helpButton };
}

export default connect(mapStateToProps, actions)(App);
