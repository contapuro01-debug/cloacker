import { type NextRequest, NextResponse } from "next/server"

let debugLogs: Array<{
  timestamp: string
  userAgent: string
  referrer: string
  isBot: boolean
  reason: string
  confidence: number
  screenResolution: string
  language: string
  timezone: string
  platform: string
  cores: string
  memory: string
  fingerprint?: string
  utm_source?: string
  utm_campaign?: string
}> = []

export async function POST(request: NextRequest) {
  const body = await request.json()

  debugLogs.push({
    timestamp: body.timestamp,
    userAgent: body.userAgent,
    referrer: body.referrer,
    isBot: body.isBot,
    reason: body.reason,
    confidence: body.confidence,
    screenResolution: body.screenResolution,
    language: body.language,
    timezone: body.timezone,
    platform: body.platform,
    cores: body.cores,
    memory: body.memory,
    fingerprint: body.fingerprint,
    utm_source: body.utm_source,
    utm_campaign: body.utm_campaign,
  })

  if (debugLogs.length > 1000) {
    debugLogs = debugLogs.slice(-1000)
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json(debugLogs)
}
