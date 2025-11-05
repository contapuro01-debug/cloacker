// Conversions API integrations for Meta, TikTok, and Google

interface PixelEvent {
  eventName: string
  eventTime: number
  userData: {
    clientIpAddress?: string
    clientUserAgent?: string
    fbp?: string // Meta browser ID
    fbc?: string // Meta click ID
    externalId?: string // Our click ID
  }
  customData?: Record<string, any>
}

// Meta Conversions API
export async function sendMetaEvent(pixelId: string, accessToken: string, event: PixelEvent) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            event_name: event.eventName,
            event_time: event.eventTime,
            action_source: "website",
            user_data: event.userData,
            custom_data: event.customData,
          },
        ],
        access_token: accessToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to send Meta event")
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Meta Conversions API error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// TikTok Events API
export async function sendTikTokEvent(pixelId: string, accessToken: string, event: PixelEvent) {
  try {
    const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        pixel_code: pixelId,
        event: event.eventName,
        event_time: event.eventTime,
        context: {
          user_agent: event.userData.clientUserAgent,
          ip: event.userData.clientIpAddress,
        },
        properties: event.customData,
      }),
    })

    const data = await response.json()

    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || "Failed to send TikTok event")
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] TikTok Events API error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Google Ads Conversion Tracking
export async function sendGoogleConversion(conversionId: string, conversionLabel: string, event: PixelEvent) {
  try {
    // Google uses gtag.js on client-side, but we can use Enhanced Conversions API
    // For now, we'll prepare the data structure
    const response = await fetch(`https://www.googleadservices.com/pagead/conversion/${conversionId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversion_label: conversionLabel,
        conversion_time: event.eventTime,
        user_agent: event.userData.clientUserAgent,
        user_ip: event.userData.clientIpAddress,
      }),
    })

    return { success: response.ok }
  } catch (error) {
    console.error("[v0] Google Ads Conversion error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
