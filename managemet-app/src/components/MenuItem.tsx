import {
    Box,
    Chip,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dish } from '../api/services';

interface MenuItemProps {
  item: Dish;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const navigate = useNavigate()

  // 新しいDishモデルに対応
  const displayName = item.nameJa || 'Unknown Dish'
  const displayPrice = item.price || 0

  const handleCardClick = () => {
    navigate(`/dish/${item.id}`)
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
