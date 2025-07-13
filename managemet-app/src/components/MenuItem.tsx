import {
    Box,
    Chip,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import React from 'react';

interface MenuItemType {
  id: string | number;
  nameJa?: string;
  nameEn?: string;
  name?: string;
  price?: number;
}

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  // Dishモデルに対応（後方互換性を保つ）
  const displayName = item.nameJa || item.name || 'Unknown Dish'
  const displayPrice = item.price || 0

  const handleCardClick = () => {
    console.log(`${displayName}が選択されました`)
  }

  return (
    <ListItem
      component={Paper}
      elevation={1}
      sx={{
        mb: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 3,
          transform: 'translateX(4px)',
        },
      }}
      onClick={handleCardClick}
    >
      <ListItemText
        primary={
          <Typography
            variant="h6"
            component="span"
            sx={{ fontWeight: 'bold' }}
          >
            {displayName}
          </Typography>
        }
        secondary={
          item.nameEn && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic', mt: 0.5 }}
            >
              {item.nameEn}
            </Typography>
          )
        }
      />
      <Box sx={{ ml: 2 }}>
        <Chip
          label={`¥${displayPrice?.toLocaleString()}`}
          color="primary"
          variant="filled"
          sx={{
            fontWeight: 'bold',
            fontSize: '1rem',
            height: 32,
            borderRadius: 2,
          }}
        />
      </Box>
    </ListItem>
  )
}

export default MenuItem
