// Utilitário para capturar e gerenciar UTMs e parameters
export interface TrackingParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  msclkid?: string
  ttclid?: string
  custom?: Record<string, string>
}

export interface DeviceFingerprint {
  fingerprint: string
  timestamp: number
  userAgent: string
  language: string
  timezone: string
  screenResolution: string
  colorDepth: number
  platform: string
  cores: number
  memory: number
  webglVendor: string
  webglRenderer: string
  canvasFingerprint: string
  fontList: string[]
  localStorage: boolean
  indexedDB: boolean
  cookies: boolean
}

export const UTMTracker = {
  // Extrai todos os parameters da URL
  extractParams(): TrackingParams {
    if (typeof window === "undefined") return {}

    const params = new URLSearchParams(window.location.search)
    const result: TrackingParams = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_content: params.get("utm_content") || undefined,
      utm_term: params.get("utm_term") || undefined,
      fbclid: params.get("fbclid") || undefined,
      gclid: params.get("gclid") || undefined,
      msclkid: params.get("msclkid") || undefined,
      ttclid: params.get("ttclid") || undefined,
      custom: {},
    }

    // Captura outros parameters customizados
    params.forEach((value, key) => {
      if (!key.startsWith("utm_") && !["fbclid", "gclid", "msclkid", "ttclid"].includes(key)) {
        result.custom![key] = value
      }
    })

    return result
  },

  // Armazena parameters em localStorage
  saveParams(params: TrackingParams): void {
    try {
      localStorage.setItem("tracking_params", JSON.stringify(params))
      localStorage.setItem("tracking_timestamp", Date.now().toString())
    } catch (e) {
      console.log("[v0] Failed to save tracking params")
    }
  },

  // Recupera parameters salvos
  getParams(): TrackingParams | null {
    try {
      const stored = localStorage.getItem("tracking_params")
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  },

  // Gera deviceFingerprint único
  async generateFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement("canvas")
    canvas.width = 280
    canvas.height = 60
    const ctx = canvas.getContext("2d")
    let canvasFingerprint = ""

    if (ctx) {
      ctx.fillStyle = "rgb(255,0,255)"
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = "rgb(255,255,0)"
      ctx.fillText("BrowserFingerprint", 2, 15)
      canvasFingerprint = canvas.toDataURL()
    }

    const gl = canvas.getContext("webgl")
    let webglVendor = "N/A"
    let webglRenderer = "N/A"

    if (gl) {
      webglVendor = gl.getParameter(gl.VENDOR) || "N/A"
      webglRenderer = gl.getParameter(gl.RENDERER) || "N/A"
    }

    const fontList = this.getInstalledFonts()

    const fingerprint: DeviceFingerprint = {
      fingerprint: this.generateFingerprintHash(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      platform: navigator.platform,
      cores: (navigator as any).hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 0,
      webglVendor,
      webglRenderer,
      canvasFingerprint,
      fontList,
      localStorage: this.checkLocalStorage(),
      indexedDB: this.checkIndexedDB(),
      cookies: this.checkCookies(),
    }

    return fingerprint
  },

  // Hash simples para fingerprint
  generateFingerprintHash(): string {
    const data =
      navigator.userAgent +
      navigator.language +
      screen.colorDepth +
      navigator.platform +
      ((navigator as any).hardwareConcurrency || 0)

    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(16)
  },

  // Detecta fontes instaladas
  getInstalledFonts(): string[] {
    const baseFonts = ["monospace", "sans-serif", "serif"]
    const testFonts = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Comic Sans MS",
      "Trebuchet MS",
      "Impact",
    ]

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return []

    const installed: string[] = []

    testFonts.forEach((font) => {
      const found = baseFonts.some((baseFont) => {
        ctx.font = `12px '${font}', ${baseFont}`
        const metrics1 = ctx.measureText("abcdefghijklmnopqrstuvwxyz")
        ctx.font = `12px ${baseFont}`
        const metrics2 = ctx.measureText("abcdefghijklmnopqrstuvwxyz")

        return Math.abs(metrics1.width - metrics2.width) > 2
      })

      if (found) installed.push(font)
    })

    return installed
  },

  checkLocalStorage(): boolean {
    try {
      const test = "__test_" + Date.now()
      localStorage.setItem(test, "1")
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  },

  checkIndexedDB(): boolean {
    return !!(window.indexedDB || (window as any).webkitIndexedDB || (window as any).mozIndexedDB)
  },

  checkCookies(): boolean {
    try {
      document.cookie = "test=1"
      const hasCookie = document.cookie.includes("test=1")
      document.cookie = "test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC"
      return hasCookie
    } catch (e) {
      return false
    }
  },

  // Gera URL com UTM preservado
  generateRedirectURL(baseURL: string, params: TrackingParams): string {
    const url = new URL(baseURL)

    if (params.utm_source) url.searchParams.set("utm_source", params.utm_source)
    if (params.utm_medium) url.searchParams.set("utm_medium", params.utm_medium)
    if (params.utm_campaign) url.searchParams.set("utm_campaign", params.utm_campaign)
    if (params.utm_content) url.searchParams.set("utm_content", params.utm_content)
    if (params.utm_term) url.searchParams.set("utm_term", params.utm_term)
    if (params.fbclid) url.searchParams.set("fbclid", params.fbclid)
    if (params.gclid) url.searchParams.set("gclid", params.gclid)
    if (params.msclkid) url.searchParams.set("msclkid", params.msclkid)
    if (params.ttclid) url.searchParams.set("ttclid", params.ttclid)

    if (params.custom) {
      Object.entries(params.custom).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    return url.toString()
  },
}
