import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';

import {
  Grid,
  Switch,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import UsersForm from './forms/UsersForm';
import ArtistsForm from './forms/ArtistsForm';

import Graphs from './Graphs';
import formatNetwork from '../utils/formatNetwork';
import * as d3 from 'd3';
// import data from '../utils/demoNetwork';

const palette = ['#fff', ...d3.schemeCategory10];

class Artists extends Component {
  state = { showToggles: false, showBar: false };

  componentDidMount() {
    this.props.fetchPublicUsers();
    this.props.fetchArtists();
  }

  render() {
    let artists = this.props.artists;
    if (!artists.length) return <div></div>;

    const { currentUser, form } = this.props;
    const others = form?.usersForm?.values?.users || [];
    const filter = form?.artistsForm?.values?.filter || '';
    const tag = `${filter}ArtistIds`;

    let artistIds = currentUser[tag];
    if (artistIds) {
      if (others) {
        artistIds = [...artistIds, ...others.map((v) => v[tag]).flat()];
        artistIds = [...new Set(artistIds)];
      }
      artists = artists.filter(({ artistId }) => artistIds.includes(artistId));
    }
    const network = formatNetwork(artists);

    const layerIds = [
      ...new Set([
        currentUser.spotifyId,
        ...this.props.publicUsers.map((v) => v.spotifyId),
      ]),
    ];
    const color = d3.scaleOrdinal().domain(layerIds).range(palette);

    return (
      <div>
        <FormControl component="fieldset">
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={this.state.showToggles}
                onChange={(event) =>
                  this.setState({ showToggles: event.target.checked })
                }
              />
            }
            label="Show data toggles"
          />
        </FormControl>
        {this.state.showToggles && (
          <Grid container spacing={2} style={{ marginTop: 20 }}>
            <Grid item xs>
              <UsersForm color={color} />
            </Grid>
            <Grid item xs>
              <ArtistsForm />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.showBar}
                    onChange={(e) =>
                      this.setState({ showBar: e.target.checked })
                    }
                    color="primary"
                  />
                }
                label="Show top genres"
              />
            </Grid>
          </Grid>
        )}
        <Graphs data={network} showBar={this.state.showBar} color={color} />
      </div>
    );
  }
}

function mapStateToProps({ currentUser, publicUsers, artists, form }) {
  return { currentUser, publicUsers, artists, form };
}

export default connect(mapStateToProps, actions)(Artists);
