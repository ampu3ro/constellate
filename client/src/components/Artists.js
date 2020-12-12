import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Forms from './forms/Forms';
import FILTER_OPTIONS from './forms/filterOptions';

import Graphs from './Graphs';
import formatNetwork from '../utils/formatNetwork';
import * as d3 from 'd3';
import Player from './Player';
import Similar from './Similar';

const palette = ['#fff', ...d3.schemeCategory10];

class Artists extends Component {
  state = { showToggles: false, showGenres: false, showOverlap: false };

  componentDidMount() {
    this.props.fetchPublicUsers();
    this.props.fetchArtists();
  }

  render() {
    let artists = this.props.artists;
    const {
      currentUser,
      selectedUsers,
      form,
      showGenres,
      showOverlap,
    } = this.props;

    if (!artists.length || currentUser === null) return <div></div>;

    const users = selectedUsers.length ? selectedUsers : [currentUser];
    const layers = users.map((v) => ({
      id: v.spotifyId,
      name: v.name,
      totalNodes: artists.filter((x) => x.spotifyIds.includes(v.spotifyId))
        .length,
    }));

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

    const color = d3
      .scaleOrdinal()
      .domain(layers.map((v) => v.id))
      .range(palette);

    return (
      <div>
        <Forms multiUser={multiUser} color={color} />
        <Graphs
          key={filterValue}
          data={network}
          layers={layers}
          showGenres={showGenres}
          showOverlap={showOverlap}
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
  showGenres,
  showOverlap,
}) {
  return {
    currentUser,
    publicUsers,
    artists,
    form,
    selectedUsers,
    showGenres,
    showOverlap,
  };
}

export default connect(mapStateToProps, actions)(Artists);
