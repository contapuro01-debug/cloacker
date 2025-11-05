import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select(
        "meta_pixel_id, meta_access_token, tiktok_pixel_id, tiktok_access_token, google_ads_id, google_conversion_label",
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("[v0] Error fetching pixel config:", error)
    return NextResponse.json({ error: "Failed to fetch pixel configuration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Update pixel configuration
    const { error } = await supabase
      .from("campaigns")
      .update({
        meta_pixel_id: body.meta_pixel_id || null,
        meta_access_token: body.meta_access_token || null,
        tiktok_pixel_id: body.tiktok_pixel_id || null,
        tiktok_access_token: body.tiktok_access_token || null,
        google_ads_id: body.google_ads_id || null,
        google_conversion_label: body.google_conversion_label || null,
      })
      .eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating pixel config:", error)
    return NextResponse.json({ error: "Failed to update pixel configuration" }, { status: 500 })
  }
}
