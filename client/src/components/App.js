import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Dial from './Dial';
import Landing from './Landing';
import Artists from './Artists';

import { Box, Container, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import spotifyTheme from '../theme';

const fabsStyle = {
  position: 'absolute',
  top: 30,
  right: 30,
  bottom: 'auto',
  left: 'auto',
};

export default function App() {
  return (
    <ThemeProvider theme={spotifyTheme}>
      <CssBaseline>
        <Container>
          <BrowserRouter>
            <div>
              <Box
                display="flex"
                flexDirection="row-reverse"
                style={fabsStyle}
              ></Box>
              <Dial />
              <Route exact path="/" component={Landing} />
              <Artists />
            </div>
          </BrowserRouter>
        </Container>
      </CssBaseline>
    </ThemeProvider>
  );
}
