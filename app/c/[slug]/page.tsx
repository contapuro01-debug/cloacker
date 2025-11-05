"use client"

import { useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"

export default function CloakingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  useEffect(() => {
    const handleInstantCloaking = async () => {
      try {
        const campaignResponse = await fetch(`/api/campaigns/public?slug=${slug}`)

        if (!campaignResponse.ok) {
          window.location.href = "/"
          return
        }

        const { campaign } = await campaignResponse.json()

        const { BotDetector } = await import("@/lib/bot-detector")
        const isQuickBot = BotDetector.quickDetect()

        const redirectUrl = isQuickBot ? campaign.safe_page_url : campaign.offer_page_url

        // Preservar parâmetros UTM e tracking IDs
        const finalUrl = new URL(redirectUrl)
        searchParams.forEach((value, key) => {
          if (!key.startsWith("_")) {
            finalUrl.searchParams.set(key, value)
          }
        })

        window.location.replace(finalUrl.toString())

        const trackingData = async () => {
          try {
            const { detectGeoLocation, getBrowserInfo } = await import("@/lib/geo-ip")
            const [detectionResult, geoLocation] = await Promise.all([
              BotDetector.getInstance().detect(),
              detectGeoLocation(),
            ])

            const browserInfo = getBrowserInfo()

            const utmParams = {
              utm_source: searchParams.get("utm_source") || undefined,
              utm_medium: searchParams.get("utm_medium") || undefined,
              utm_campaign: searchParams.get("utm_campaign") || undefined,
              utm_content: searchParams.get("utm_content") || undefined,
              utm_term: searchParams.get("utm_term") || undefined,
              fbclid: searchParams.get("fbclid") || undefined,
              gclid: searchParams.get("gclid") || undefined,
              ttclid: searchParams.get("ttclid") || undefined,
              referrer: document.referrer || undefined,
            }

            const trackingPayload = JSON.stringify({
              campaignId: campaign.id,
              isBot: detectionResult.isBot,
              confidence: detectionResult.confidence,
              reason: detectionResult.reason,
              checks: detectionResult.checks,
              fingerprint: detectionResult.fingerprint,
              geoLocation,
              browserInfo,
              utmParams,
            })

            // Usar sendBeacon para garantir que o tracking aconteça mesmo após redirect
            if (navigator.sendBeacon) {
              const blob = new Blob([trackingPayload], { type: "application/json" })
              navigator.sendBeacon("/api/track-click", blob)
            } else {
              fetch("/api/track-click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: trackingPayload,
                keepalive: true,
              }).catch(() => {})
            }

            if (!detectionResult.isBot) {
              const pixelPayload = {
                clickId: null, // Será preenchido pelo servidor após salvar o click
                campaignId: campaign.id,
                eventName: "PageView",
                userData: {
                  clientIpAddress: undefined, // Será preenchido pelo servidor
                  clientUserAgent: navigator.userAgent,
                  fbp: searchParams.get("fbclid") || undefined,
                  fbc: searchParams.get("fbclid") ? `fb.1.${Date.now()}.${searchParams.get("fbclid")}` : undefined,
                  externalId: detectionResult.fingerprint.hash,
                },
                customData: {
                  content_name: campaign.name,
                  utm_source: utmParams.utm_source,
                  utm_campaign: utmParams.utm_campaign,
                },
              }

              // Enviar evento de pixel via API (não bloqueia)
              fetch("/api/track-pixel-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pixelPayload),
                keepalive: true,
              }).catch(() => {})
            }
          } catch (e) {
            console.error("[v0] Erro no tracking:", e)
          }
        }

        trackingData()
      } catch (error) {
        console.error("[v0] Erro no cloaking:", error)
        window.location.href = "/"
      }
    }

    handleInstantCloaking()
  }, [slug, searchParams])

  return <div className="min-h-screen bg-white" />
}
