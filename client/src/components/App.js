import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Landing from './Landing';
import Help from './Help';
import Artists from './Artists';

import { Container, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import spotifyTheme from '../theme';

class App extends Component {
  state = { in: false };

  componentDidMount() {
    this.props.fetchCurrentUser().then(() => {
      const { currentUser } = this.props;
      this.props.setHelpOpen(!currentUser);
      this.setState({ in: !!currentUser });
    });
  }

  render() {
    const timeout = 1000;

    const onClose = () => {
      this.props.setHelpOpen(false);
      this.setState({ in: true });
    };

    return (
      <div>
        <ThemeProvider theme={spotifyTheme}>
          <CssBaseline>
            <Help
              open={this.props.helpOpen}
              onClose={onClose}
              timeout={timeout}
            />
            <Container>
              <BrowserRouter>
                <div>
                  <Route exact path="/">
                    <Landing
                      TransitionProps={{ in: this.state.in, timeout }}
                      onHelpClick={() => this.props.setHelpOpen(true)}
                    />
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

function mapStateToProps({ currentUser, helpOpen }) {
  return { currentUser, helpOpen };
}

export default connect(mapStateToProps, actions)(App);
