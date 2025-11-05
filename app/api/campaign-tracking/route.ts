import { NextResponse } from "next/server"

const campaignStore: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaigns, timestamp } = body

    if (campaigns && Array.isArray(campaigns)) {
      campaignStore.push({
        campaigns,
        timestamp,
        receivedAt: new Date().toISOString(),
      })

      // Mantém apenas os últimos 1000 registros
      if (campaignStore.length > 1000) {
        campaignStore.shift()
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
  // Retorna dados das campanhas para o dashboard
  return NextResponse.json({
    campaigns: campaignStore,
    total: campaignStore.length,
  })
}
