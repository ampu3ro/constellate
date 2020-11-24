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
import Player from './Player';
import Similar from './Similar';

const palette = ['#fff', ...d3.schemeCategory10];

class Artists extends Component {
  state = { showToggles: false, showBar: false };

  componentDidMount() {
    this.props.fetchPublicUsers();
    this.props.fetchArtists();
  }

  render() {
    let artists = this.props.artists;
    const { currentUser, selectedUsers, form } = this.props;

    if (!artists.length || currentUser === null) return <div></div>;

    const filterValue = form?.artistsForm?.values?.filter || '';

    if (selectedUsers.length) {
      const tag = `${filterValue}ArtistIds`;
      const selectedIds = selectedUsers.map((user) => user[tag] || []).flat();
      if (selectedIds.length) {
        artists = artists.filter(({ artistId }) =>
          selectedIds.includes(artistId)
        );
      }
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
            <Grid item xs={12} lg={6}>
              <UsersForm color={color} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ArtistsForm />
            </Grid>
            <Grid item xs={12} lg={2}>
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
        <Graphs
          data={network}
          key={filterValue}
          showBar={this.state.showBar}
          color={color}
        />
        <Similar color={color} />
        <Player />
      </div>
    );
  }
}

function mapStateToProps({
  currentUser,
  publicUsers,
  artists,
  form,
  selectedUsers,
}) {
  return { currentUser, publicUsers, artists, form, selectedUsers };
}

export default connect(mapStateToProps, actions)(Artists);
