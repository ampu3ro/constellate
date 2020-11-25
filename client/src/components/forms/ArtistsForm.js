import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import FILTER_OPTIONS from './filterOptions';

const renderSelectField = ({ input, label, children }) => (
  <FormControl fullWidth={true}>
    <InputLabel>{label}</InputLabel>
    <Select onInput={(value) => input.onInput(value)} {...input}>
      {children}
    </Select>
  </FormControl>
);

const ArtistsForm = () => {
  return (
    <form>
      <Field
        component={renderSelectField}
        name="filter"
        label="Show most played artists from the last..."
        autoWidth={true}
      >
        {Object.keys(FILTER_OPTIONS).map((value) => (
          <MenuItem value={value} key={value}>
            {FILTER_OPTIONS[value]}
          </MenuItem>
        ))}
      </Field>
    </form>
  );
};

export default reduxForm({ form: 'artistsForm' })(ArtistsForm);
