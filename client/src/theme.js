import { createMuiTheme } from '@material-ui/core/styles';

const spotifyTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1DB954',
    },
    secondary: {
      main: '#191414',
    },
  },
  typography: {
    fontFamily: 'Montserrat',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
  },
});

export default spotifyTheme;
