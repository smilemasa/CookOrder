import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { MenuProvider } from './context/MenuContext';
import MenuListPage from './pages/MenuListPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MenuProvider>
        <MenuListPage />
      </MenuProvider>
    </ThemeProvider>
  )
}

export default App
