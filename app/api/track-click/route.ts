import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Recebendo requisição de tracking")

    const body = await request.json()
    const { campaignId, isBot, confidence, reason, checks, fingerprint, geoLocation, browserInfo, utmParams } = body

    console.log("[v0] Dados recebidos:", { campaignId, isBot, confidence })

    const supabase = createServiceRoleClient()

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error("[v0] Erro ao buscar campanha:", campaignError)
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    console.log("[v0] Campanha encontrada:", campaign.name)

    // Get IP from request
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    // Insert click record
    const { data: click, error: clickError } = await supabase
      .from("clicks")
      .insert({
        campaign_id: campaignId,
        is_bot: isBot,
        confidence_score: confidence,
        detection_reason: reason,
        fingerprint_hash: fingerprint.hash,
        user_agent: fingerprint.userAgent,
        ip_address: ip,
        country: geoLocation?.country || "Unknown",
        city: geoLocation?.city || "Unknown",
        device_type: browserInfo?.deviceType || "Unknown",
        browser: browserInfo?.browser || "Unknown",
        os: browserInfo?.os || "Unknown",
        utm_source: utmParams?.utm_source,
        utm_medium: utmParams?.utm_medium,
        utm_campaign: utmParams?.utm_campaign,
        utm_content: utmParams?.utm_content,
        utm_term: utmParams?.utm_term,
        referrer: utmParams?.referrer,
        fbclid: utmParams?.fbclid,
        gclid: utmParams?.gclid,
        ttclid: utmParams?.ttclid,
      })
      .select()
      .single()

    if (clickError) {
      console.error("[v0] Erro ao inserir click:", clickError)
      return NextResponse.json({ error: "Failed to track click", details: clickError.message }, { status: 500 })
    }

    console.log("[v0] Click registrado com ID:", click.id)

    // Insert detailed bot detection data
    if (click) {
      const { error: detectionError } = await supabase.from("bot_detections").insert({
        click_id: click.id,
        user_agent_check: checks.userAgent,
        referrer_check: checks.referrer,
        headless_check: checks.headless,
        webdriver_check: checks.webdriver,
        canvas_check: checks.canvas,
        webgl_check: checks.webgl,
        plugins_check: checks.plugins,
        storage_check: {
          localStorage: checks.localStorage,
          indexedDB: checks.indexedDB,
        },
        fonts_check: checks.fonts,
        screen_resolution: fingerprint.screenResolution,
        color_depth: fingerprint.colorDepth,
        timezone: fingerprint.timezone,
        language: fingerprint.language,
        platform: fingerprint.platform,
        cores: fingerprint.cores,
        memory: fingerprint.memory,
        webgl_vendor: fingerprint.webglVendor,
        webgl_renderer: fingerprint.webglRenderer,
        canvas_fingerprint: fingerprint.canvasFingerprint.substring(0, 100),
        installed_fonts: fingerprint.installedFonts,
      })

      if (detectionError) {
        console.error("[v0] Erro ao inserir bot_detection:", detectionError)
      }
    }

    // Update campaign stats
    console.log("[v0] Atualizando estatísticas da campanha...")
    const { error: statsError } = await supabase.rpc("increment_campaign_stats", {
      p_campaign_id: campaignId,
      p_is_bot: isBot,
    })

    if (statsError) {
      console.error("[v0] Erro ao atualizar stats:", statsError)
    } else {
      console.log("[v0] Estatísticas atualizadas com sucesso")
    }

    return NextResponse.json({
      success: true,
      clickId: click.id,
      shouldRedirect: !isBot,
      redirectUrl: isBot ? campaign.safe_page_url : campaign.offer_page_url,
    })
  } catch (error) {
    console.error("[v0] Erro geral no tracking:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
