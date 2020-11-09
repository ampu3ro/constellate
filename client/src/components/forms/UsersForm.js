import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import { TextField, Chip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import Brightness1Icon from '@material-ui/icons/Brightness1';

class UsersForm extends Component {
  state = { selected: [] };

  componentDidMount() {
    this.setState({ selected: [this.props.currentUser] });
  }

  render() {
    const { currentUser, publicUsers } = this.props;
    if (!publicUsers) return <div></div>;

    const options = [
      currentUser,
      ...publicUsers.filter((user) => user.spotifyId !== currentUser.spotifyId),
    ];

    return (
      <div>
        <Autocomplete
          multiple
          renderInput={(params) => (
            <TextField
              {...params}
              label="Layer data from other public users"
              placeholder="User name"
              variant="outlined"
            />
          )}
          options={options}
          value={this.state.selected}
          getOptionSelected={(option, value) =>
            option.spotifyId === value.spotifyId
          }
          getOptionLabel={(option) => option.name}
          onChange={(event, value) => {
            this.props.fetchArtists(value.map((v) => v.spotifyId));
            this.setState({ selected: value });
          }}
          renderTags={(value, getTagProps) => {
            return value.map((option, index) => (
              <Chip
                label={option.name}
                icon={
                  <Brightness1Icon
                    style={{ color: this.props.color(option.spotifyId) }}
                  />
                }
                {...getTagProps({ index })}
                disabled={option.spotifyId === currentUser.spotifyId}
              />
            ));
          }}
          fullWidth
        />
      </div>
    );
  }
}

function mapStateToProps({ currentUser, publicUsers }) {
  return { currentUser, publicUsers };
}

export default connect(mapStateToProps, actions)(UsersForm);
