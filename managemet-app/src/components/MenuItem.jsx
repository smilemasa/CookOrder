import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActionArea
} from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

function MenuItem({ item }) {
  const [imageError, setImageError] = useState(false);
  
  // Dishモデルに対応（後方互換性を保つ）
  const displayName = item.nameJa || item.name || 'Unknown Dish';
  const displayImage = item.img || item.image;
  const displayPrice = item.price || 0;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    console.log(`${displayName}が選択されました`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        }
      }}
      elevation={2}
    >
      <CardActionArea onClick={handleCardClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {!imageError && displayImage ? (
          <CardMedia
            component="img"
            height="220"
            image={displayImage}
            alt={displayName}
            onError={handleImageError}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              color: 'grey.500'
            }}
          >
            <RestaurantIcon sx={{ fontSize: 80 }} />
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            {displayName}
          </Typography>
          
          {item.nameEn && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              {item.nameEn}
            </Typography>
          )}
          
          <Box sx={{ mt: 'auto' }}>
            <Chip 
              label={`¥${displayPrice?.toLocaleString()}`}
              color="primary"
              variant="filled"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                height: 36,
                borderRadius: 2
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default MenuItem;
