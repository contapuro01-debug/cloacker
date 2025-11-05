import { type NextRequest, NextResponse } from "next/server"

let trackingLogs: Array<{
  timestamp: string
  fingerprint: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  isBot: boolean
  confidence: number
  redirectURL?: string
}> = []

export async function POST(request: NextRequest) {
  const body = await request.json()

  trackingLogs.push({
    timestamp: body.timestamp,
    fingerprint: body.fingerprint,
    utm_source: body.utm_source,
    utm_medium: body.utm_medium,
    utm_campaign: body.utm_campaign,
    isBot: body.isBot,
    confidence: body.confidence,
    redirectURL: body.redirectURL,
  })

  if (trackingLogs.length > 2000) {
    trackingLogs = trackingLogs.slice(-2000)
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  // Agrupa estatísticas por UTM
  const stats = {
    totalVisits: trackingLogs.length,
    botVisits: trackingLogs.filter((l) => l.isBot).length,
    realVisits: trackingLogs.filter((l) => !l.isBot).length,
    bySource: {} as Record<string, number>,
    byCampaign: {} as Record<string, number>,
  }

  trackingLogs.forEach((log) => {
    if (log.utm_source) {
      stats.bySource[log.utm_source] = (stats.bySource[log.utm_source] || 0) + 1
    }
    if (log.utm_campaign) {
      stats.byCampaign[log.utm_campaign] = (stats.byCampaign[log.utm_campaign] || 0) + 1
    }
  })

  return NextResponse.json({ stats, logs: trackingLogs.slice(-100) })
}
