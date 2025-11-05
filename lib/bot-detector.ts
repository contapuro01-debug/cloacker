// Advanced bot detection engine
export interface BotDetectionResult {
  isBot: boolean
  confidence: number // 0-100
  reason: string
  checks: BotDetectionChecks
  fingerprint: DeviceFingerprint
}

export interface BotDetectionChecks {
  userAgent: CheckResult
  referrer: CheckResult
  headless: CheckResult
  webdriver: CheckResult
  canvas: CheckResult
  webgl: CheckResult
  plugins: CheckResult
  localStorage: CheckResult
  indexedDB: CheckResult
  fonts: CheckResult
  timing: CheckResult
  mouse: CheckResult
  touch: CheckResult
  battery: CheckResult
  connection: CheckResult
}

export interface CheckResult {
  isBot: boolean
  reason: string
  weight: number
  details?: any
}

export interface DeviceFingerprint {
  hash: string
  userAgent: string
  language: string
  languages: string[]
  timezone: string
  timezoneOffset: number
  screenResolution: string
  availableScreenResolution: string
  colorDepth: number
  pixelRatio: number
  platform: string
  cores: number
  memory: number
  webglVendor: string
  webglRenderer: string
  canvasFingerprint: string
  audioFingerprint: string
  installedFonts: string[]
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
  cookies: boolean
  doNotTrack: string | null
  plugins: string[]
  mimeTypes: string[]
}

export class BotDetector {
  private static instance: BotDetector
  private mouseMovements = 0
  private touchEvents = 0
  private startTime: number = Date.now()

  private constructor() {
    if (typeof window !== "undefined") {
      this.initializeTracking()
    }
  }

  static getInstance(): BotDetector {
    if (!BotDetector.instance) {
      BotDetector.instance = new BotDetector()
    }
    return BotDetector.instance
  }

  static quickDetect(): boolean {
    const ua = navigator.userAgent.toLowerCase()

    const criticalBotPatterns = [
      // Bots gerais - apenas os mais óbvios
      "bot",
      "crawler",
      "spider",
      "scraper",
      "curl",
      "wget",
      "python",
      "java/",
      "apache-httpclient",
      "okhttp",

      // TikTok bots - CRÍTICO
      "bytespider",
      "tiktokbot",
      "ttbot",
      "bytedancebot",
      "tt-ads-bot",
      "tt_spider",

      // Meta/Facebook bots - CRÍTICO
      "facebookexternalhit",
      "facebookcatalog",
      "facebookbot",
      "fb_iab/fb4a",
      "fbav/",
      "meta-externalagent",

      // Google bots - CRÍTICO
      "googlebot",
      "adsbot-google",
      "mediapartners-google",
      "google-adwords-instant",
      "google-site-verification",

      // Outros bots de ads
      "bingbot",
      "slurp",
      "duckduckbot",
      "baiduspider",
      "yandexbot",

      // Ferramentas de automação - CRÍTICO
      "headlesschrome",
      "phantomjs",
      "selenium",
      "puppeteer",
      "playwright",
      "cypress",
      "nightmare",
      "casperjs",
      "zombie",
      "slimerjs",

      // Scrapers e HTTP clients
      "scrapy",
      "beautifulsoup",
      "mechanize",
      "httpclient",
      "python-requests",
      "node-fetch",
      "axios/",
      "got/",

      // Ferramentas de teste/monitoramento
      "prerender",
      "lighthouse",
      "pagespeed",
      "gtmetrix",
      "pingdom",
      "uptimerobot",

      // Verificadores de segurança
      "nmap",
      "nikto",
      "nessus",
      "openvas",
      "qualys",
      "burp",
      "zap",
      "acunetix",
    ]

    // Detecção rápida baseada em UA - mais rigorosa
    const hasBotPattern = criticalBotPatterns.some((pattern) => ua.includes(pattern))

    // Verificações de automação - CRÍTICAS
    const hasWebDriver = (navigator as any).webdriver === true
    const isHeadless = /HeadlessChrome/i.test(navigator.userAgent) || /Headless/i.test(navigator.userAgent)
    const hasAutomationFlags =
      (window as any).__nightmare ||
      (window as any)._phantom ||
      (window as any).callPhantom ||
      (window as any).__selenium_unwrapped ||
      (window as any).document.__webdriver_evaluate !== undefined ||
      (window as any).document.$cdc_asdjflasutopfhvcZLmcfl_ !== undefined ||
      (window as any).document.__webdriver_script_fn !== undefined ||
      (window as any).document.__selenium_evaluate !== undefined ||
      (window as any).document.__fxdriver_evaluate !== undefined ||
      (window as any).document.__driver_unwrapped !== undefined ||
      (window as any).document.__webdriver_unwrapped !== undefined ||
      (window as any).document.__fxdriver_unwrapped !== undefined

    // Apenas flagrar se MÚLTIPLAS características suspeitas estiverem presentes
    const hasMinimalBrowserFeatures =
      typeof navigator.plugins !== "undefined" &&
      typeof navigator.languages !== "undefined" &&
      typeof navigator.platform !== "undefined" &&
      typeof screen.width !== "undefined" &&
      typeof screen.height !== "undefined"

    // Características MUITO suspeitas (múltiplas devem estar presentes)
    const criticalSuspiciousFeatures = [
      navigator.plugins?.length === 0,
      navigator.languages?.length === 0,
      !navigator.language,
      screen.width === 0 || screen.height === 0,
      screen.colorDepth === 0,
      navigator.userAgent.length < 50,
      navigator.userAgent === "Mozilla/5.0",
    ].filter(Boolean).length

    // Só flagrar como bot se tiver 3+ características críticas suspeitas
    const hasMultipleSuspiciousFeatures = criticalSuspiciousFeatures >= 3

    // Só classificar como bot se tiver evidência CLARA
    return (
      hasBotPattern ||
      hasWebDriver ||
      isHeadless ||
      hasAutomationFlags ||
      (!hasMinimalBrowserFeatures && hasMultipleSuspiciousFeatures)
    )
  }

  private initializeTracking() {
    // Track mouse movements
    document.addEventListener(
      "mousemove",
      () => {
        this.mouseMovements++
      },
      { passive: true },
    )

    // Track touch events
    document.addEventListener(
      "touchstart",
      () => {
        this.touchEvents++
      },
      { passive: true },
    )
  }

  async detect(): Promise<BotDetectionResult> {
    const checks: BotDetectionChecks = {
      userAgent: this.checkUserAgent(),
      referrer: this.checkReferrer(),
      headless: this.checkHeadless(),
      webdriver: this.checkWebDriver(),
      canvas: await this.checkCanvas(),
      webgl: this.checkWebGL(),
      plugins: this.checkPlugins(),
      localStorage: this.checkLocalStorage(),
      indexedDB: this.checkIndexedDB(),
      fonts: await this.checkFonts(),
      timing: this.checkTiming(),
      mouse: this.checkMouse(),
      touch: this.checkTouch(),
      battery: await this.checkBattery(),
      connection: this.checkConnection(),
    }

    const fingerprint = await this.generateFingerprint()

    // Calculate bot score
    let botScore = 0
    let primaryReason = ""

    Object.entries(checks).forEach(([checkName, result]) => {
      if (result.isBot) {
        botScore += result.weight
        if (!primaryReason && result.weight > 15) {
          primaryReason = result.reason
        }
      }
    })

    const confidence = Math.min(Math.round((botScore / 300) * 100), 100)
    const isBot = confidence > 40

    return {
      isBot,
      confidence,
      reason: primaryReason || (isBot ? "Multiple suspicious signals" : "Appears legitimate"),
      checks,
      fingerprint,
    }
  }

  private checkUserAgent(): CheckResult {
    const ua = navigator.userAgent.toLowerCase()

    const botPatterns = [
      "bot",
      "crawler",
      "spider",
      "scraper",
      "tiktok",
      "bytedance",
      "tt_webview",
      "tt_ads",
      "douyin",
      "facebookexternalhit",
      "fbbot",
      "fban",
      "fbav",
      "googlebot",
      "adsbot",
      "bingbot",
      "slurp",
      "curl",
      "wget",
      "scrapy",
      "python-requests",
      "headlesschrome",
      "phantomjs",
      "selenium",
      "puppeteer",
      "playwright",
      "webdriver",
      "automation",
      "bytespider",
      "facebookcatalog",
      "instagram",
      "whatsapp",
      "mediapartners-google",
      "google-adwords",
      "google-structured-data",
      "java",
      "apache-httpclient",
      "okhttp",
      "cypress",
      "prerender",
      "lighthouse",
      "pagespeed",
      "gtmetrix",
      "pingdom",
      "uptimerobot",
      "tiktokbot",
      "ttbot",
      "bytedancebot",
      "tt-ads-bot",
      "tiktok-ads",
      "tt_spider",
      "fb_iab",
      "fbios",
      "fbandroid",
      "fb4a",
      "fbsv",
      "meta-externalagent",
      "facebookplatform",
      "fb-messenger",
      "instagrambot",
      "whatsappbot",
      "adsbot-google",
      "google-ads-bot",
      "google-adwords-instant",
      "google-site-verification",
      "linkedinbot",
      "twitterbot",
      "pinterestbot",
      "snapchat",
      "casperjs",
      "zombie",
      "slimerjs",
      "newrelic",
      "datadog",
      "dynatrace",
      "axios",
      "node-fetch",
      "got",
      "superagent",
      "restsharp",
      "nmap",
      "nikto",
      "nessus",
      "openvas",
      "qualys",
      "burp",
      "zap",
      "acunetix",
      "monitor",
      "check",
      "test",
      "scan",
      "probe",
      "validator",
      "analyzer",
    ]

    const suspiciousPattern = botPatterns.find((pattern) => ua.includes(pattern))

    return {
      isBot: !!suspiciousPattern,
      reason: suspiciousPattern ? `Bot user agent detected: ${suspiciousPattern}` : "",
      weight: suspiciousPattern ? 35 : 0,
      details: { userAgent: navigator.userAgent },
    }
  }

  private checkReferrer(): CheckResult {
    const ref = document.referrer.toLowerCase()

    const botReferrers = [
      "ads.tiktok",
      "tiktok.com/ads",
      "business.tiktok",
      "facebook.com/ads",
      "facebook.com/tr",
      "business.facebook",
      "google.com/ads",
      "googleadservices",
      "doubleclick.net",
      "adservice",
      "googleads",
      "googlesyndication",
      "adwords",
    ]

    const isBotRef = botReferrers.some((pattern) => ref.includes(pattern))

    return {
      isBot: isBotRef,
      reason: isBotRef ? "Ad platform referrer detected" : "",
      weight: isBotRef ? 20 : 0,
      details: { referrer: document.referrer },
    }
  }

  private checkHeadless(): CheckResult {
    const isHeadless =
      /HeadlessChrome/.test(navigator.userAgent) ||
      /Headless/i.test(navigator.userAgent) ||
      (navigator as any).webdriver === true ||
      !(window as any).chrome ||
      (window as any).__nightmare ||
      (window as any)._phantom ||
      (window as any).callPhantom

    return {
      isBot: isHeadless,
      reason: isHeadless ? "Headless browser detected" : "",
      weight: isHeadless ? 35 : 0,
    }
  }

  private checkWebDriver(): CheckResult {
    const hasWebDriver =
      (navigator as any).webdriver === true ||
      (window as any).document.__webdriver_evaluate !== undefined ||
      (window as any).document.$cdc_asdjflasutopfhvcZLmcfl_ !== undefined ||
      (window as any).document.__selenium_unwrapped !== undefined ||
      (window as any).document.__webdriver_script_fn !== undefined ||
      (window as any).document.__selenium_evaluate !== undefined ||
      (window as any).document.__fxdriver_evaluate !== undefined ||
      (window as any).document.__driver_unwrapped !== undefined ||
      (window as any).document.__webdriver_unwrapped !== undefined ||
      (window as any).document.__fxdriver_unwrapped !== undefined

    return {
      isBot: hasWebDriver,
      reason: hasWebDriver ? "WebDriver detected" : "",
      weight: hasWebDriver ? 40 : 0,
    }
  }

  private async checkCanvas(): Promise<CheckResult> {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 280
      canvas.height = 60
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return { isBot: true, reason: "Canvas context unavailable", weight: 20 }
      }

      // Draw complex pattern
      ctx.fillStyle = "rgb(255,0,255)"
      ctx.beginPath()
      ctx.arc(50, 30, 20, 0, Math.PI * 2, true)
      ctx.fill()

      ctx.fillStyle = "rgb(0,255,255)"
      ctx.fillRect(100, 10, 50, 40)

      ctx.fillStyle = "rgb(255,255,0)"
      ctx.font = "14pt Arial"
      ctx.fillText("BotCheck🤖", 10, 50)

      const dataURL = canvas.toDataURL()

      // Check if canvas is blocked or returns default values
      const isBlocked = !dataURL.includes("data:image/png") || dataURL.length < 100

      return {
        isBot: isBlocked,
        reason: isBlocked ? "Canvas fingerprinting blocked" : "",
        weight: isBlocked ? 25 : 0,
        details: { canvasLength: dataURL.length },
      }
    } catch (e) {
      return { isBot: true, reason: "Canvas error", weight: 20 }
    }
  }

  private checkWebGL(): CheckResult {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2")

      if (!gl) {
        return { isBot: true, reason: "WebGL unavailable", weight: 25 }
      }

      const vendor = gl.getParameter(gl.VENDOR)
      const renderer = gl.getParameter(gl.RENDERER)

      // Check for common bot WebGL signatures
      const isSuspicious =
        !vendor ||
        !renderer ||
        vendor === "Brian Paul" || // Mesa software renderer
        renderer.includes("SwiftShader") ||
        renderer.includes("llvmpipe")

      return {
        isBot: isSuspicious,
        reason: isSuspicious ? "Suspicious WebGL renderer" : "",
        weight: isSuspicious ? 20 : 0,
        details: { vendor, renderer },
      }
    } catch (e) {
      return { isBot: true, reason: "WebGL error", weight: 15 }
    }
  }

  private checkPlugins(): CheckResult {
    const pluginCount = navigator.plugins?.length || 0
    const hasNoPlugins = pluginCount === 0

    return {
      isBot: hasNoPlugins,
      reason: hasNoPlugins ? "No browser plugins detected" : "",
      weight: hasNoPlugins ? 15 : 0,
      details: { pluginCount },
    }
  }

  private checkLocalStorage(): CheckResult {
    try {
      const testKey = "__bot_test_" + Date.now()
      localStorage.setItem(testKey, "1")
      const value = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      const isBlocked = value !== "1"

      return {
        isBot: isBlocked,
        reason: isBlocked ? "LocalStorage blocked" : "",
        weight: isBlocked ? 15 : 0,
      }
    } catch (e) {
      return { isBot: true, reason: "LocalStorage error", weight: 15 }
    }
  }

  private checkIndexedDB(): CheckResult {
    const hasIndexedDB = !!(
      (window as any).indexedDB ||
      (window as any).webkitIndexedDB ||
      (window as any).mozIndexedDB
    )

    return {
      isBot: !hasIndexedDB,
      reason: !hasIndexedDB ? "IndexedDB unavailable" : "",
      weight: !hasIndexedDB ? 10 : 0,
    }
  }

  private async checkFonts(): Promise<CheckResult> {
    try {
      const baseFonts = ["monospace", "sans-serif", "serif"]
      const testFonts = [
        "Arial",
        "Verdana",
        "Times New Roman",
        "Courier New",
        "Georgia",
        "Palatino",
        "Garamond",
        "Comic Sans MS",
        "Trebuchet MS",
        "Impact",
        "Lucida Console",
      ]

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return { isBot: false, reason: "", weight: 0 }

      const installedFonts: string[] = []
      const testString = "mmmmmmmmmmlli"

      for (const font of testFonts) {
        let detected = false
        for (const baseFont of baseFonts) {
          ctx.font = `72px ${baseFont}`
          const baseWidth = ctx.measureText(testString).width

          ctx.font = `72px '${font}', ${baseFont}`
          const testWidth = ctx.measureText(testString).width

          if (Math.abs(testWidth - baseWidth) > 1) {
            detected = true
            break
          }
        }
        if (detected) installedFonts.push(font)
      }

      const tooFewFonts = installedFonts.length < 3

      return {
        isBot: tooFewFonts,
        reason: tooFewFonts ? "Insufficient fonts detected" : "",
        weight: tooFewFonts ? 15 : 0,
        details: { installedFonts },
      }
    } catch (e) {
      return { isBot: false, reason: "", weight: 0 }
    }
  }

  private checkTiming(): CheckResult {
    const timeOnPage = Date.now() - this.startTime
    const tooFast = timeOnPage < 50 // Less than 50ms

    return {
      isBot: tooFast,
      reason: tooFast ? "Page loaded too quickly" : "",
      weight: tooFast ? 25 : 0,
      details: { timeOnPage },
    }
  }

  private checkMouse(): CheckResult {
    const noMouseMovement = this.mouseMovements === 0
    const timeOnPage = Date.now() - this.startTime

    // Only flag if been on page for more than 2 seconds
    const suspicious = noMouseMovement && timeOnPage > 2000

    return {
      isBot: suspicious,
      reason: suspicious ? "No mouse movement detected" : "",
      weight: suspicious ? 10 : 0,
      details: { mouseMovements: this.mouseMovements, timeOnPage },
    }
  }

  private checkTouch(): CheckResult {
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
    const noTouchSupport = !("ontouchstart" in window)

    // Mobile device without touch support is suspicious
    const suspicious = isMobile && noTouchSupport

    return {
      isBot: suspicious,
      reason: suspicious ? "Mobile device without touch support" : "",
      weight: suspicious ? 20 : 0,
      details: { isMobile, hasTouchSupport: !noTouchSupport },
    }
  }

  private async checkBattery(): Promise<CheckResult> {
    try {
      if ("getBattery" in navigator) {
        const battery = await (navigator as any).getBattery()

        // Bots often have suspicious battery values
        const suspicious =
          battery.level === 1 && battery.charging === false && battery.chargingTime === Number.POSITIVE_INFINITY

        return {
          isBot: suspicious,
          reason: suspicious ? "Suspicious battery status" : "",
          weight: suspicious ? 10 : 0,
          details: {
            level: battery.level,
            charging: battery.charging,
          },
        }
      }
    } catch (e) {
      // Battery API not available or blocked
    }

    return { isBot: false, reason: "", weight: 0 }
  }

  private checkConnection(): CheckResult {
    if ("connection" in navigator || "mozConnection" in navigator || "webkitConnection" in navigator) {
      const conn =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      // Check for suspicious connection values
      const suspicious = conn.downlink === 10 && conn.rtt === 0

      return {
        isBot: suspicious,
        reason: suspicious ? "Suspicious network connection" : "",
        weight: suspicious ? 10 : 0,
        details: {
          downlink: conn.downlink,
          rtt: conn.rtt,
          effectiveType: conn.effectiveType,
        },
      }
    }

    return { isBot: false, reason: "", weight: 0 }
  }

  private async generateFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    let canvasFingerprint = ""

    if (ctx) {
      ctx.fillStyle = "rgb(255,0,255)"
      ctx.fillRect(0, 0, 100, 100)
      ctx.fillStyle = "rgb(0,255,255)"
      ctx.font = "18pt Arial"
      ctx.fillText("Fingerprint", 2, 50)
      canvasFingerprint = canvas.toDataURL()
    }

    // Audio fingerprint
    let audioFingerprint = ""
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const gainNode = audioContext.createGain()
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

      gainNode.gain.value = 0
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(0)
      const data = new Float32Array(analyser.frequencyBinCount)
      analyser.getFloatFrequencyData(data)
      audioFingerprint = data.slice(0, 30).join(",")

      oscillator.stop()
      audioContext.close()
    } catch (e) {
      audioFingerprint = "unavailable"
    }

    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2")
    const webglVendor = gl ? gl.getParameter(gl.VENDOR) || "N/A" : "N/A"
    const webglRenderer = gl ? gl.getParameter(gl.RENDERER) || "N/A" : "N/A"

    const plugins = Array.from(navigator.plugins || []).map((p) => p.name)
    const mimeTypes = Array.from(navigator.mimeTypes || []).map((m) => m.type)

    const fingerprint: DeviceFingerprint = {
      hash: await this.generateHash(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: Array.from(navigator.languages || []),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      screenResolution: `${screen.width}x${screen.height}`,
      availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      cores: (navigator as any).hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 0,
      webglVendor,
      webglRenderer,
      canvasFingerprint,
      audioFingerprint,
      installedFonts: [],
      localStorage: this.checkLocalStorage().isBot === false,
      sessionStorage: !!window.sessionStorage,
      indexedDB: this.checkIndexedDB().isBot === false,
      cookies: document.cookie !== undefined,
      doNotTrack: navigator.doNotTrack,
      plugins,
      mimeTypes,
    }

    return fingerprint
  }

  private async generateHash(): Promise<string> {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      (navigator as any).hardwareConcurrency || 0,
    ].join("|")

    // Simple hash function
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(16)
  }
}
