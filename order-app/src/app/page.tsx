import ProductCard from "@/components/ProductCard"
import { productsData } from "@/components/FoodGenerator/foodGenerator"
import { Box } from "@mui/material"

export default function Home() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
        gap: 1,
      }}
    >
      {productsData.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          imageUrl={product.imageUrl}
        />
      ))}
    </Box>
  )
}
