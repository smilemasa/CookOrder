export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import ProductCard from "@/components/ProductCard"
import { Box } from "@mui/material"
import { Tables } from "./_lib/supabase/types"

type Dish = Tables<"dishes">

async function getDishes() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dishes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  if (!res.ok) throw new Error("Fetch error")

  const dishes: Dish[] = await res.json()
  return dishes
}

export default async function Home() {
  const dishes = await getDishes()
  if (!dishes) {
    return {
      notFound: true,
    }
  }
  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
        gap: 1,
      }}
    >
      {!!dishes &&
        dishes.map((dish) => (
          <ProductCard
            key={dish.id}
            name={dish.name}
            price={dish.price}
            imageUrl="https://www.h-maruko.co.jp/images/material/00384.jpg"
          />
        ))}
    </Box>
  )
}
