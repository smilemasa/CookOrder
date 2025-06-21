"use client"

import React, { useState } from "react"
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { SideMenu } from "./SideMenu"
import { Righteous } from "next/font/google"

const fontRighteous = Righteous({
  subsets: ["latin"],
  weight: "400",
})

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
          <Typography
            variant="h4"
            component="div"
            fontFamily={fontRighteous.style.fontFamily}
          >
            For You
          </Typography>
        </Toolbar>
      </AppBar>
      <SideMenu open={openSideMenu} onClose={() => setOpenSideMenu(false)} />
    </>
  )
}
