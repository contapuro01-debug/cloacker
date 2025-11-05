import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Creating campaign with data:", body)

    const {
      id,
      name,
      slug,
      safe_page_url,
      offer_page_url,
      custom_domain,
      countries,
      languages,
      devices,
      traffic_sources,
      is_active,
    } = body

    // Create or update campaign
    if (id) {
      // Update existing campaign
      const { data, error } = await supabase
        .from("campaigns")
        .update({
          name,
          slug,
          safe_page_url,
          offer_page_url,
          custom_domain,
          countries: countries || [],
          languages: languages || [],
          devices: devices || [],
          traffic_sources: traffic_sources || [],
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("[v0] Update campaign error:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log("[v0] Campaign updated successfully:", data)
      return NextResponse.json({ success: true, campaign: data })
    } else {
      // Create new campaign
      const campaignData = {
        user_id: user.id,
        name,
        slug,
        safe_page_url,
        offer_page_url,
        custom_domain,
        countries: countries || [],
        languages: languages || [],
        devices: devices || [],
        traffic_sources: traffic_sources || [],
        is_active,
      }

      console.log("[v0] Inserting campaign:", campaignData)

      const { data, error } = await supabase.from("campaigns").insert(campaignData).select().single()

      if (error) {
        console.error("[v0] Create campaign error:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log("[v0] Campaign created successfully:", data)
      return NextResponse.json({ success: true, campaign: data })
    }
  } catch (error) {
    console.error("[v0] Campaign API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Get campaigns error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("[v0] Get campaigns API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      name,
      slug,
      safe_page_url,
      offer_page_url,
      custom_domain,
      countries,
      languages,
      devices,
      traffic_sources,
      is_active,
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update({
        name,
        slug,
        safe_page_url,
        offer_page_url,
        custom_domain,
        countries: countries || [],
        languages: languages || [],
        devices: devices || [],
        traffic_sources: traffic_sources || [],
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Update campaign error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error) {
    console.error("[v0] Update campaign API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()

    const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete campaign error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete campaign API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
