import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/app/_lib/supabase/types"

export async function GET() {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: dishes, error } = await supabase.from("dishes").select()

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch dishes", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(dishes, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    )
  }
}
