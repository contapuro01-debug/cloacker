import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all clicks from user's campaigns
    const { data: clicks, error } = await supabase
      .from("clicks")
      .select(`
        *,
        campaigns!inner(user_id)
      `)
      .eq("campaigns.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("[v0] Error fetching clicks:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ clicks: clicks || [] })
  } catch (error) {
    console.error("[v0] Error in all-clicks API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
