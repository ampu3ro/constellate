import React from 'react';
import { useSelector } from 'react-redux';
import { useArtistSelected } from '../hooks';

import {
  IconButton,
  Avatar,
  Typography,
  Tooltip,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  row: {
    alignItems: 'center',
  },
  selected: {
    marginRight: theme.spacing(2),
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  similarLabel: {
    marginRight: theme.spacing(1),
  },
  similar: {
    margin: theme.spacing(1),
    width: theme.spacing(5),
    height: theme.spacing(5),
    //https://next.material-ui.com/customization/transitions/
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.standard,
    }),
    '&:hover': {
      transform: 'scale(1.75)',
    },
  },
}));

const Similar = () => {
  const classes = useStyles();
  const userActive = useSelector(({ userActive }) => userActive);
  const selectedArtist = useSelector(({ selectedArtist }) => selectedArtist);
  const similarArtists = useSelector(({ similarArtists }) => similarArtists);
  const { artistSelected } = useArtistSelected();

  if (!userActive || selectedArtist === null) {
    return <div></div>;
  }

  const { name, images } = selectedArtist;

  return (
    <Grid className={classes.root} container direction="column">
      <Grid className={classes.row} container direction="row" key="row1">
        <Avatar
          className={classes.selected}
          alt={name}
          src={images.length ? images[0].url : ''}
        />
        <Typography variant="h3">{name}</Typography>
      </Grid>
      <Grid className={classes.row} container direction="row" key="row2">
        <Typography className={classes.similarLabel}>
          similar artists{' '}
        </Typography>
        {similarArtists.slice(0, 10).map(({ id, name, images }) => (
          <Tooltip title={name} key={id}>
            <IconButton
              className={classes.similar}
              onClick={() => artistSelected(id)}
              disableRipple
              disableFocusRipple
            >
              <Avatar alt={name} src={images.length ? images[0].url : ''} />
            </IconButton>
          </Tooltip>
        ))}
      </Grid>
    </Grid>
  );
};

export default Similar;