import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import {
  Grid,
  Switch,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import UsersForm from './UsersForm';
import ArtistsForm from './ArtistsForm';

class Forms extends Component {
  state = { showToggles: false };

  render() {
    const {
      showBar,
      setBar,
      showOverlap,
      setOverlap,
      multiUser,
      color,
    } = this.props;

    const { showToggles } = this.state;

    return (
      <div>
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
        {showToggles && (
          <Grid container spacing={2} style={{ marginTop: 20 }}>
            <Grid item sm={12} md={8}>
              <UsersForm color={color} />
            </Grid>
            <Grid item sm={12} md={4}>
              <ArtistsForm />
            </Grid>
            <Grid item sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showBar}
                    onChange={(e) => setBar(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show top genres"
              />
            </Grid>
            {multiUser && (
              <Grid item sm={6} md={4}>
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

function mapStateToProps({ showToggles, showBar, showOverlap }) {
  return { showToggles, showBar, showOverlap };
}

export default connect(mapStateToProps, actions)(Forms);
