import { List } from '@mui/material';
import React from 'react';
import { Dish } from '../api/services';
import MenuItem from './MenuItem';

interface MenuListProps {
  menuItems: Dish[];
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
  return (
    <List sx={{ width: '100%' }}>
      {menuItems.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </List>
  )
}

export default MenuList
