import { NextResponse } from "next/server"

// Simulado em memória - em produção use banco de dados real
const trackingStats = {
  totalVisits: 1247,
  conversions: 43,
  botsDetected: 284,
  realUsers: 963,
  revenue: 2580.5,
  pixelEvents: {
    tiktok: 156,
    meta: 89,
    google: 54,
  },
  campaigns: {
    "TikTok - Jan 2025": {
      visits: 450,
      conversions: 23,
      revenue: 1200,
      roas: 2.4,
    },
    "Instagram - Jan 2025": {
      visits: 380,
      conversions: 14,
      revenue: 850,
      roas: 2.1,
    },
    "Google Ads - Jan 2025": {
      visits: 200,
      conversions: 4,
      revenue: 400,
      roas: 1.8,
    },
    "Facebook - Jan 2025": {
      visits: 217,
      conversions: 2,
      revenue: 130,
      roas: 0.9,
    },
  },
  chartHistory: [
    { time: "00:00", conversions: 3, revenue: 150 },
    { time: "04:00", conversions: 7, revenue: 420 },
    { time: "08:00", conversions: 12, revenue: 780 },
    { time: "12:00", conversions: 18, revenue: 1200 },
    { time: "16:00", conversions: 25, revenue: 1650 },
    { time: "20:00", conversions: 32, revenue: 2100 },
    { time: "24:00", conversions: 43, revenue: 2580 },
  ],
  deviceBreakdown: {
    iPhone: 487,
    Android: 312,
    Desktop: 284,
    iPad: 164,
  },
  geoData: {
    "São Paulo": 320,
    "Rio de Janeiro": 215,
    "Minas Gerais": 178,
    Outros: 534,
  },
}

export async function GET() {
  const topCampaigns = Object.entries(trackingStats.campaigns)
    .map(([name, data]) => ({
      name,
      conversions: data.conversions,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5)

  return NextResponse.json({
    ...trackingStats,
    topCampaigns,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.event === "conversion") {
      trackingStats.conversions += 1
      trackingStats.revenue += body.value || 60

      // Atualiza pixel events
      if (body.pixel === "tiktok") trackingStats.pixelEvents.tiktok += 1
      if (body.pixel === "meta") trackingStats.pixelEvents.meta += 1
      if (body.pixel === "google") trackingStats.pixelEvents.google += 1

      // Atualiza campanha específica
      if (body.campaign && trackingStats.campaigns[body.campaign]) {
        trackingStats.campaigns[body.campaign].conversions += 1
        trackingStats.campaigns[body.campaign].revenue += body.value || 60
      }
    }

    if (body.event === "visit") {
      trackingStats.totalVisits += 1

      if (body.userType === "bot") {
        trackingStats.botsDetected += 1
      } else {
        trackingStats.realUsers += 1
      }

      if (body.device) {
        trackingStats.deviceBreakdown[body.device] = (trackingStats.deviceBreakdown[body.device] || 0) + 1
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process tracking" }, { status: 400 })
  }
}
