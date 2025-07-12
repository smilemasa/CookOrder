import React from 'react';
import { Grid } from '@mui/material';
import MenuItem from './MenuItem';

function MenuList({ menuItems }) {
  return (
    <Grid container spacing={3}>
      {menuItems.map(item => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <MenuItem item={item} />
        </Grid>
      ))}
    </Grid>
  );
}

export default MenuList;
