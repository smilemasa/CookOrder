import {
    Box,
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
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'grey.200',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          borderColor: 'primary.light',
          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
        },
      }}
      onClick={handleCardClick}
    >
      <ListItemText
        sx={{ flex: 1 }}
        primary={
          <Typography
            variant="h6"
            component="span"
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            {displayName}
          </Typography>
        }
        secondary={
          item.nameEn && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontStyle: 'italic', 
                mt: 0.5,
                fontSize: '0.9rem',
              }}
            >
              {item.nameEn}
            </Typography>
          )
        }
      />
      <Box sx={{ 
        ml: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end',
        minWidth: 'fit-content',
        px: 2,
        py: 1,
        borderRadius: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            fontSize: '1.3rem',
            lineHeight: 1,
          }}
        >
          ¥{displayPrice?.toLocaleString()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.7rem',
            mt: 0.25,
          }}
        >
          税込
        </Typography>
      </Box>
    </ListItem>
  )
}

export default MenuItem
