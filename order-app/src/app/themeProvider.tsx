"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import React from "react"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#616161",
      light: "#ECEFF1",
      dark: "#373737",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#FFFFFF",
    },
    divider: "#9E9E9E",
  },
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "black",
        },
      },
    },
  },
})

export default function ThemeProviderCR({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
}
