import {
  Add as AddIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllDishes, useSearchDishes } from '../api'
import MenuList from '../components/MenuList'

const MenuListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 全メニュー取得
  const {
    data: allMenus = [],
    isLoading: isLoadingAll,
    error: allMenusError,
  } = useGetAllDishes()

  // 検索クエリ
  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchDishes(
    { name: searchTerm },
    {
      enabled: isSearching && searchTerm.trim().length > 0,
    },
  )

  // 表示するメニューデータを決定
  const menus = isSearching && searchTerm.trim() ? searchResults : allMenus
  const loading = isSearching ? isSearchLoading : isLoadingAll
  const error = isSearching ? searchError : allMenusError

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value
    setSearchTerm(term)
    setIsSearching(term.trim().length > 0)
  }

  // エラー時のフォールバックデータ
  const displayMenus = error ? [] : menus

  if (loading && displayMenus.length === 0) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            メニューを読み込み中...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* ヘッダー */}
        <Fade in timeout={800}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <RestaurantIcon
                  sx={{
                    fontSize: '3rem',
                    color: 'primary.main',
                  }}
                />
                料理メニュー
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add')}
              size="large"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: 3,
                minWidth: '160px',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              料理を追加
            </Button>
          </Stack>
        </Fade>

        {/* エラーメッセージ */}
        {error && (
          <Fade in>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {String(error)}
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
                    },
                  },
                },
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
            <MenuList menuItems={displayMenus} />
          </Box>
        </Fade>

        {/* 結果なしメッセージ */}
        {!loading && displayMenus.length === 0 && (
          <Fade in>
            <Paper
              elevation={2}
              sx={{
                p: 6,
                textAlign: 'center',
                mt: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
  )
}

export default MenuListPage
