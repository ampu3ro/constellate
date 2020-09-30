import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';

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
        <MenuItem value={'short'}>4 weeks</MenuItem>
        <MenuItem value={'medium'}>6 months</MenuItem>
        <MenuItem value={'long'}>Several years</MenuItem>
        <MenuItem value={'all'}>Show all</MenuItem>
      </Field>
    </form>
  );
};

export default reduxForm({ form: 'artistsForm' })(ArtistsForm);
