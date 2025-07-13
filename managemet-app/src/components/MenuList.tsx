import { List } from '@mui/material';
import React from 'react';
import MenuItem from './MenuItem';

interface MenuItemType {
  id: string | number;
  [key: string]: any;
}

interface MenuListProps {
  menuItems: MenuItemType[];
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
