"use client"

import React, { useState } from "react"
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { SideMenu } from "./SideMenu"

export default function AppLayout({
  headerHeight: height,
}: {
  headerHeight: number
}) {
  const [openSideMenu, setOpenSideMenu] = useState(false)

  return (
    <>
      <AppBar position="fixed" enableColorOnDark>
        <Toolbar sx={{ bgcolor: "primary.main", height: height }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpenSideMenu(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
          <Typography variant="h6" component="div">
            For You
          </Typography>
        </Toolbar>
      </AppBar>
      <SideMenu open={openSideMenu} onClose={() => setOpenSideMenu(false)} />
    </>
  )
}
