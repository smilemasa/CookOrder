import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import React from "react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import DishDetailPage from "./pages/DishDetailPage"
import MenuListPage from "./pages/MenuListPage"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
})

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MenuListPage />} />
          <Route path="/dish/:id" element={<DishDetailPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
