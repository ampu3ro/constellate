import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';

import { TextField, Chip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import Brightness1Icon from '@material-ui/icons/Brightness1';

class UsersForm extends Component {
  componentDidMount() {
    this.props.setUsers([this.props.currentUser]);
  }

  render() {
    const {
      currentUser,
      publicUsers,
      selectedUsers,
      fetchArtists,
      setUsers,
    } = this.props;
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
          value={selectedUsers}
          getOptionSelected={(option, value) =>
            option.spotifyId === value.spotifyId
          }
          getOptionLabel={(option) => option.name}
          onChange={async (event, value) => {
            await fetchArtists(value.map((v) => v.spotifyId));
            setUsers(value);
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
                // disabled={option.spotifyId === currentUser.spotifyId}
              />
            ));
          }}
          fullWidth
        />
      </div>
    );
  }
}

function mapStateToProps({ currentUser, publicUsers, selectedUsers }) {
  return { currentUser, publicUsers, selectedUsers };
}

export default connect(mapStateToProps, actions)(UsersForm);
