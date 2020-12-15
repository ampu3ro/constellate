import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import {
  Fade,
  Grid,
  Switch,
  FormControl,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Typography,
} from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import { withStyles } from '@material-ui/styles';

import UsersForm from './UsersForm';
import ArtistsForm from './ArtistsForm';

const styles = (theme) => ({
  tooltip: {
    backgroudColor: theme.palette.secondary,
  },
});

class Forms extends Component {
  state = { showToggles: false };

  render() {
    const {
      classes,
      TransitionProps,
      showGenres,
      setGenres,
      showOverlap,
      setOverlap,
      multiUser,
      color,
    } = this.props;

    const { showToggles } = this.state;

    return (
      <div>
        <Fade {...TransitionProps}>
          <FormControl component="fieldset">
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={showToggles}
                  onChange={(e) =>
                    this.setState({ showToggles: e.target.checked })
                  }
                />
              }
              label="Show data toggles"
            />
          </FormControl>
        </Fade>
        {showToggles && (
          <Grid container spacing={2} style={{ marginTop: 20 }}>
            <Grid item xs={12} sm={12} md={8}>
              <UsersForm color={color} />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <ArtistsForm />
            </Grid>
            <Grid item xs={6} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showGenres}
                    onChange={(e) => setGenres(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    Show top genres
                    <Tooltip
                      className={classes.tooltip}
                      placement="right"
                      title={
                        <Typography>
                          Top 5 genres for the highlighted artists or overall if
                          none are selected. Percentages are relative each
                          user's total.
                        </Typography>
                      }
                    >
                      <HelpIcon
                        style={{
                          marginLeft: 10,
                          fontSize: 18,
                        }}
                      />
                    </Tooltip>
                  </Typography>
                }
              />
            </Grid>
            {multiUser && (
              <Grid item xs={6} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={multiUser && showOverlap}
                      onChange={(e) => setOverlap(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show overlapping only"
                />
              </Grid>
            )}
          </Grid>
        )}
      </div>
    );
  }
}

function mapStateToProps({ showToggles, showGenres, showOverlap }) {
  return { showToggles, showGenres, showOverlap };
}

export default connect(mapStateToProps, actions)(withStyles(styles)(Forms));
