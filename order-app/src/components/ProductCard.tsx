"use client"

import { Card, CardMedia, CardContent, Typography } from "@mui/material"

type ProductCardProps = {
  imageUrl: string
  name: string
  price: number
}

export default function ProductCard({
  imageUrl,
  name,
  price,
}: ProductCardProps) {
  return (
    <Card sx={{ maxWidth: 300, borderRadius: 4 }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ bgcolor: "white" }}>
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="body1" color="text.light">
          ¥{price.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  )
}
