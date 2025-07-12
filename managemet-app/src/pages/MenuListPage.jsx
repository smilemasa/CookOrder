import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Fade,
  Paper
} from '@mui/material';
import { Search as SearchIcon, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { useMenu } from '../context/MenuContext';
import MenuList from '../components/MenuList';

function MenuListPage() {
  const { menus, loading, error, searchMenus, fetchMenus } = useMenu();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      await searchMenus(term);
    } else {
      await fetchMenus();
    }
  };

  if (loading && menus.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            メニューを読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* ヘッダー */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <RestaurantIcon sx={{ fontSize: 'inherit', mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              料理メニュー
            </Typography>
          </Box>
        </Fade>

        {/* エラーメッセージ */}
        {error && (
          <Fade in>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* 検索バー */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="料理名で検索..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }
              }}
            />
          </Box>
        </Fade>

        {/* ローディング */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* メニューリスト */}
        <Fade in timeout={1200}>
          <Box>
            <MenuList menuItems={menus} />
          </Box>
        </Fade>

        {/* 結果なしメッセージ */}
        {!loading && menus.length === 0 && (
          <Fade in>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                mt: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
              }}
            >
              <RestaurantIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                メニューが見つかりませんでした
              </Typography>
              <Typography variant="body1" color="text.secondary">
                検索条件を変更してもう一度お試しください
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>
    </Container>
  );
}

export default MenuListPage;
