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
import FILTER_OPTIONS from './forms/filterOptions';

import Graphs from './Graphs';
import formatNetwork from '../utils/formatNetwork';
import * as d3 from 'd3';
import Player from './Player';
import Similar from './Similar';

const palette = ['#fff', ...d3.schemeCategory10];

class Artists extends Component {
  state = { showToggles: false, showBar: false, showOverlap: false };

  componentDidMount() {
    this.props.fetchPublicUsers();
    this.props.fetchArtists();
  }

  render() {
    let artists = this.props.artists;
    const { currentUser, selectedUsers, form } = this.props;
    const { showToggles, showBar, showOverlap } = this.state;

    if (!artists.length || currentUser === null) return <div></div>;

    const multiUser = selectedUsers.length > 1;
    const filterValue = form?.artistsForm?.values?.filter || 'all';

    if (selectedUsers.length) {
      const filterValues =
        filterValue === 'all' ? Object.keys(FILTER_OPTIONS) : [filterValue];
      const tags = filterValues.map((value) => `${value}ArtistIds`);

      let selectedIds = selectedUsers
        .map((user) => {
          const ids = tags.map((tag) => user[tag] || []).flat();
          return [...new Set(ids)];
        })
        .flat();

      if (multiUser && showOverlap) {
        selectedIds = selectedIds.filter(
          (a, i, aa) => aa.indexOf(a) === i && aa.lastIndexOf(a) !== i
        );
      }

      artists = artists.filter(({ artistId }) =>
        selectedIds.includes(artistId)
      );
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
                checked={showToggles}
                onChange={(event) =>
                  this.setState({ showToggles: event.target.checked })
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
                    onChange={(e) =>
                      this.setState({ showBar: e.target.checked })
                    }
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
                      onChange={(e) =>
                        this.setState({ showOverlap: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label="Show overlapping only"
                />
              </Grid>
            )}
          </Grid>
        )}
        <Graphs
          data={network}
          key={filterValue}
          showBar={showBar}
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
