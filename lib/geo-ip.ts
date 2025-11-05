// Geo IP detection utility
export interface GeoLocation {
  country: string
  countryCode: string
  city: string
  region: string
  timezone: string
  ip: string
}

export async function detectGeoLocation(): Promise<GeoLocation | null> {
  try {
    // Use multiple free geo IP services as fallback
    const services = ["https://ipapi.co/json/", "https://ip-api.com/json/"]

    for (const service of services) {
      try {
        const response = await fetch(service)
        if (response.ok) {
          const data = await response.json()

          return {
            country: data.country_name || data.country || "Unknown",
            countryCode: data.country_code || data.countryCode || "XX",
            city: data.city || "Unknown",
            region: data.region || data.regionName || "Unknown",
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            ip: data.ip || data.query || "Unknown",
          }
        }
      } catch (e) {
        continue
      }
    }

    // Fallback to browser timezone
    return {
      country: "Unknown",
      countryCode: "XX",
      city: "Unknown",
      region: "Unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ip: "Unknown",
    }
  } catch (e) {
    return null
  }
}

export function getBrowserInfo() {
  const ua = navigator.userAgent

  let browser = "Unknown"
  let os = "Unknown"
  let deviceType = "desktop"

  // Detect browser
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"
  else if (ua.includes("Edge")) browser = "Edge"
  else if (ua.includes("Opera")) browser = "Opera"

  // Detect OS
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  // Detect device type
  if (/Mobile|Android|iPhone/i.test(ua)) deviceType = "mobile"
  else if (/iPad|Tablet/i.test(ua)) deviceType = "tablet"

  return { browser, os, deviceType }
}
