import { createServiceRoleClient } from "@/lib/supabase/server"
import { sendMetaEvent, sendTikTokEvent, sendGoogleConversion } from "@/lib/conversions-api"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clickId, campaignId, eventName, userData, customData } = body

    console.log("[v0] Tracking pixel event:", { clickId, campaignId, eventName })

    const supabase = createServiceRoleClient()

    // Get campaign pixel configuration
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select(
        "meta_pixel_id, meta_access_token, tiktok_pixel_id, tiktok_access_token, google_ads_id, google_conversion_label",
      )
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error("[v0] Campaign not found:", campaignError)
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const eventTime = Math.floor(Date.now() / 1000)
    const results = []

    // Send to Meta if configured
    if (campaign.meta_pixel_id && campaign.meta_access_token) {
      console.log("[v0] Sending event to Meta Pixel:", campaign.meta_pixel_id)

      const metaResult = await sendMetaEvent(campaign.meta_pixel_id, campaign.meta_access_token, {
        eventName,
        eventTime,
        userData,
        customData,
      })

      // Log event to database
      await supabase.from("pixel_events").insert({
        click_id: clickId,
        campaign_id: campaignId,
        event_name: eventName,
        platform: "meta",
        status: metaResult.success ? "sent" : "failed",
        error_message: metaResult.error,
        event_data: { userData, customData },
      })

      results.push({ platform: "meta", ...metaResult })
    }

    // Send to TikTok if configured
    if (campaign.tiktok_pixel_id && campaign.tiktok_access_token) {
      console.log("[v0] Sending event to TikTok Pixel:", campaign.tiktok_pixel_id)

      const tiktokResult = await sendTikTokEvent(campaign.tiktok_pixel_id, campaign.tiktok_access_token, {
        eventName,
        eventTime,
        userData,
        customData,
      })

      await supabase.from("pixel_events").insert({
        click_id: clickId,
        campaign_id: campaignId,
        event_name: eventName,
        platform: "tiktok",
        status: tiktokResult.success ? "sent" : "failed",
        error_message: tiktokResult.error,
        event_data: { userData, customData },
      })

      results.push({ platform: "tiktok", ...tiktokResult })
    }

    // Send to Google if configured
    if (campaign.google_ads_id && campaign.google_conversion_label) {
      console.log("[v0] Sending event to Google Ads:", campaign.google_ads_id)

      const googleResult = await sendGoogleConversion(campaign.google_ads_id, campaign.google_conversion_label, {
        eventName,
        eventTime,
        userData,
        customData,
      })

      await supabase.from("pixel_events").insert({
        click_id: clickId,
        campaign_id: campaignId,
        event_name: eventName,
        platform: "google",
        status: googleResult.success ? "sent" : "failed",
        error_message: googleResult.error,
        event_data: { userData, customData },
      })

      results.push({ platform: "google", ...googleResult })
    }

    console.log("[v0] Pixel events sent:", results)

    return NextResponse.json({
      success: true,
      results,
      message: `Events sent to ${results.length} platform(s)`,
    })
  } catch (error) {
    console.error("[v0] Error tracking pixel event:", error)
    return NextResponse.json({ error: "Failed to track pixel event" }, { status: 500 })
  }
}
