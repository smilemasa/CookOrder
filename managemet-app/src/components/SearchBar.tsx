import { Search as SearchIcon } from '@mui/icons-material'
import {
    CircularProgress,
    InputAdornment,
    TextField,
} from '@mui/material'
import { debounce } from 'lodash'
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'

interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
  debounceMs?: number
  isLoading?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "料理名で検索...",
  debounceMs = 500,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // debounceされた検索関数を作成
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      onSearch(term)
    }, debounceMs),
    [onSearch, debounceMs]
  )

  // コンポーネントがアンマウントされた時にdebounceをキャンセル
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value
    setSearchTerm(term)
    // debounceされた関数を呼び出し
    debouncedSearch(term)
  }, [debouncedSearch])

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      // ローディング中でも検索バーは操作可能
      disabled={false}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: isLoading ? (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ) : null,
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
  )
}

export default SearchBar
