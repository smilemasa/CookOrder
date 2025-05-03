"use client"

import * as React from "react"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PaymentIcon from "@mui/icons-material/Payment"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import { Box, Collapse, Divider } from "@mui/material"
import { useState } from "react"

type MenuItemProps = {
  name: string
  option?: { name: string; path: string }[]
}
const menuItems: MenuItemProps[] = [
  {
    name: "本日のおすすめ",
    option: [
      { name: "店長一押し", path: "/" },
      { name: "季節限定", path: "/" },
      { name: "スピードメニュー", path: "/" },
      { name: "定番", path: "/" },
    ],
  },
  {
    name: "揚げ物",
    option: [
      { name: "唐揚げ", path: "/" },
      { name: "フライドポテト", path: "/" },
      { name: "天ぷら", path: "/" },
    ],
  },
  {
    name: "焼き物",
    option: [
      { name: "焼き鳥", path: "/" },
      { name: "焼き魚", path: "/" },
    ],
  },
]

function MenuItem({ item }: { item: MenuItemProps }) {
  const [open, setOpen] = useState(false)
  const handleClick = () => {
    setOpen(!open)
  }
  return (
    <List sx={{ width: "100%", maxWidth: 360 }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <RestaurantIcon />
        </ListItemIcon>
        <ListItemText primary={item.name} sx={{ color: "text.primary" }} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.option?.map((option) => (
            <ListItemButton key={option.name} sx={{ pl: 4 }}>
              <ListItemIcon>
                <RadioButtonUncheckedIcon />
              </ListItemIcon>
              <ListItemText
                primary={option.name}
                sx={{ color: "text.primary" }}
              />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </List>
  )
}

export function SideMenu({
  open: openSideMenu,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Drawer
      anchor="left"
      open={openSideMenu}
      onClose={onClose}
      slotProps={{ paper: { sx: { bgcolor: "primary.light" } } }}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List
          sx={{ width: "100%", maxWidth: 360 }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          {menuItems.map((item) => (
            <MenuItem key={item.name} item={item} />
          ))}
        </List>
      </Box>
      <Divider sx={{ backgroundColor: "divider" }} variant="middle" />
      <List>
        <ListItemButton>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="注文" sx={{ color: "text.primary" }} />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="お会計" sx={{ color: "text.primary" }} />
        </ListItemButton>
      </List>
    </Drawer>
  )
}
