import React from 'react';
import { IconButton } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const HelpIconButton = ({ onHelpClick }) => {
  return (
    <IconButton
      size="small"
      style={{ marginLeft: 5, marginBottom: 10, zIndex: 10 }}
      onClick={onHelpClick}
    >
      <HelpOutlineIcon fontSize="small" />
    </IconButton>
  );
};

export default HelpIconButton;
