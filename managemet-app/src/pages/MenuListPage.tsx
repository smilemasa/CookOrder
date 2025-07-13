import {
  Add as AddIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllDishes, useSearchDishes } from '../api'
import MenuList from '../components/MenuList'
import SearchBar from '../components/SearchBar'

const MenuListPage: React.FC = () => {
  const navigate = useNavigate()
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)

  // 全メニュー取得
  const {
    data: allMenus = [],
    isLoading: isLoadingAll,
    error: allMenusError,
  } = useGetAllDishes()

  // 検索クエリ（debounceされた検索キーワードでのみ実行）
  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchDishes(
    { name: debouncedSearchTerm },
    {
      enabled: isSearchActive && debouncedSearchTerm.trim().length > 0,
    },
  )

  // 検索ハンドラー（debounceされて呼ばれる）
  const handleSearch = useCallback((term: string) => {
    setDebouncedSearchTerm(term)
    setIsSearchActive(term.trim().length > 0)
  }, [])

  // 表示するメニューデータを決定（メモ化）
  const { menus, loading, error } = useMemo(() => {
    const currentMenus = isSearchActive && debouncedSearchTerm.trim() ? searchResults : allMenus
    const currentLoading = isSearchActive ? isSearchLoading : isLoadingAll
    const currentError = isSearchActive ? searchError : allMenusError

    return {
      menus: currentMenus,
      loading: currentLoading,
      error: currentError
    }
  }, [isSearchActive, debouncedSearchTerm, searchResults, allMenus, isSearchLoading, isLoadingAll, searchError, allMenusError])

  // エラー時のフォールバックデータ
  const displayMenus = error ? [] : menus

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
            <SearchBar
              onSearch={handleSearch}
              placeholder="料理名で検索..."
              debounceMs={500}
              isLoading={isSearchActive && isSearchLoading}
            />
          </Box>
        </Fade>

        {/* ローディング */}
        {loading && displayMenus.length === 0 && (
          <Fade in>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                  {isSearchActive ? '検索中...' : '読み込み中...'}
                </Typography>
              </Stack>
            </Box>
          </Fade>
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
                {isSearchActive && debouncedSearchTerm ?
                  `「${debouncedSearchTerm}」に該当するメニューが見つかりませんでした` :
                  'メニューが見つかりませんでした'
                }
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isSearchActive ? '検索条件を変更してもう一度お試しください' : '新しいメニューを追加してください'}
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>
    </Container>
  )
}

export default MenuListPage
