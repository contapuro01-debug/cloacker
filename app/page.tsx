"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Zap, BarChart3, Lock } from "lucide-react"
import { GhostLayerLogo } from "@/components/ghostlayer-logo"
import { useEffect, useState } from "react"
import { UTMTracker } from "@/lib/utm-tracker"

export default function HomePage() {
  const [showPresell, setShowPresell] = useState(false)
  const [destinationUrl, setDestinationUrl] = useState("")
  const [campaignId, setCampaignId] = useState("")

  useEffect(() => {
    const detectBot = async (): Promise<{ isBot: boolean; reason: string; confidence: number }> => {
      const params = new URLSearchParams(window.location.search)
      const cid = params.get("cid")

      if (cid) {
        try {
          const response = await fetch("/api/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get", campaignId: cid }),
          })
          const { campaign } = await response.json()
          if (campaign) {
            setCampaignId(cid)
            setDestinationUrl(campaign.destinationUrl)
          }
        } catch (e) {
          console.log("[v0] Error fetching campaign")
        }
      }

      const trackingParams = UTMTracker.extractParams()
      UTMTracker.saveParams(trackingParams)

      const checks = {
        userAgent: checkUserAgent(),
        referrer: checkReferrer(),
        headless: checkHeadlessBrowser(),
        webdriver: checkWebDriver(),
        canvas: checkCanvasFingerprint(),
        webgl: checkWebGLSupport(),
        plugins: checkPlugins(),
        localStorage: checkLocalStorage(),
        indexedDB: checkIndexedDB(),
        fonts: checkFonts(),
      }

      let botScore = 0
      let detectionReason = ""

      Object.entries(checks).forEach(([check, result]) => {
        if (result.isBot) {
          botScore += result.weight
          if (!detectionReason) detectionReason = result.reason
        }
      })

      const confidence = Math.min(botScore / 100, 1)
      const isBot = confidence > 0.4

      return { isBot, reason: detectionReason || "Comportamento suspeito", confidence: Math.round(confidence * 100) }
    }

    function checkUserAgent() {
      const ua = navigator.userAgent.toLowerCase()
      const botPatterns = [
        "tiktok",
        "bytedance",
        "tt_webview",
        "tt_ads",
        "douyin",
        "facebookexternalhit",
        "fbbot",
        "googlebot",
        "adsbot",
        "bingbot",
        "curl",
        "wget",
        "scrapy",
        "headlesschrome",
        "phantomjs",
        "selenium",
        "puppeteer",
        "playwright",
      ]
      const isBotUA = botPatterns.some((pattern) => ua.includes(pattern))
      return { isBot: isBotUA, reason: "Bot UA detectado", weight: isBotUA ? 25 : 0 }
    }

    function checkReferrer() {
      const ref = document.referrer.toLowerCase()
      const botReferrers = [
        "ads.tiktok",
        "tiktok.com",
        "m.tiktok.com",
        "facebook.com/ads",
        "google.com/ads",
        "bytedance",
      ]
      const isBotRef = botReferrers.some((pattern) => ref.includes(pattern))
      return { isBot: isBotRef, reason: "Referrer de bot", weight: isBotRef ? 20 : 0 }
    }

    function checkHeadlessBrowser() {
      const isHeadless = /HeadlessChrome/.test(navigator.userAgent) || navigator.webdriver === true
      return { isBot: isHeadless, reason: "Headless browser", weight: isHeadless ? 30 : 0 }
    }

    function checkWebDriver() {
      const isWebDriver = navigator.webdriver === true || (window as any).document.__webdriver_evaluate !== undefined
      return { isBot: isWebDriver, reason: "WebDriver detectado", weight: isWebDriver ? 35 : 0 }
    }

    function checkCanvasFingerprint() {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = 280
        canvas.height = 60
        const ctx = canvas.getContext("2d")
        if (!ctx) return { isBot: false, reason: "", weight: 0 }
        ctx.fillStyle = "rgb(255,0,255)"
        ctx.beginPath()
        ctx.arc(69, 29, 29, 0, Math.PI * 2, true)
        ctx.fill()
        ctx.fillStyle = "rgb(255,255,0)"
        ctx.font = "11pt Arial"
        ctx.fillText("BotTest123", 2, 15)
        const dataURL = canvas.toDataURL()
        const isStandardCanvas = dataURL.includes("data:image/png")
        return { isBot: !isStandardCanvas, reason: "Canvas bloqueada", weight: !isStandardCanvas ? 20 : 0 }
      } catch (e) {
        return { isBot: true, reason: "Canvas error", weight: 15 }
      }
    }

    function checkWebGLSupport() {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("webgl2")
        return { isBot: !gl, reason: "WebGL indisponível", weight: !gl ? 20 : 0 }
      } catch (e) {
        return { isBot: true, reason: "WebGL error", weight: 15 }
      }
    }

    function checkPlugins() {
      const pluginCount = navigator.plugins?.length || 0
      return { isBot: pluginCount === 0, reason: "Sem plugins", weight: pluginCount === 0 ? 10 : 0 }
    }

    function checkLocalStorage() {
      try {
        const testKey = "__bot_test_" + Date.now()
        localStorage.setItem(testKey, "1")
        const value = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        return { isBot: value !== "1", reason: "LocalStorage bloqueado", weight: value !== "1" ? 15 : 0 }
      } catch (e) {
        return { isBot: true, reason: "LocalStorage erro", weight: 15 }
      }
    }

    function checkIndexedDB() {
      const hasIndexedDB =
        !!(window as any).indexedDB || (window as any).webkitIndexedDB || (window as any).mozIndexedDB
      return { isBot: !hasIndexedDB, reason: "IndexedDB indisponível", weight: !hasIndexedDB ? 10 : 0 }
    }

    function checkFonts() {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return { isBot: false, reason: "", weight: 0 }
        ctx.font = "12px Arial"
        const metrics = ctx.measureText("test")
        return { isBot: metrics.width === 0, reason: "Fontes indisponíveis", weight: metrics.width === 0 ? 15 : 0 }
      } catch (e) {
        return { isBot: false, reason: "", weight: 0 }
      }
    }

    detectBot().then(async ({ isBot, reason, confidence }) => {
      if (isBot) {
        setShowPresell(true)
        return
      }

      // Usuário real - redireciona para URL real
      const finalUrl = destinationUrl || "https://purocheats.com/#store"
      const params = new URLSearchParams(window.location.search)

      // Passa UTMs para URL final
      const redirectUrl = new URL(finalUrl)
      params.forEach((value, key) => {
        if (!key.startsWith("cid")) redirectUrl.searchParams.set(key, value)
      })

      // Registra conversão
      if (campaignId) {
        fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "convert", campaignId }),
          keepalive: true,
        }).catch(() => {})
      }

      // Dispara eventos de pixel
      if ((window as any).ttq) (window as any).ttq.track("InitiateCheckout", { value: 1, currency: "BRL" })
      if ((window as any).fbq) (window as any).fbq("track", "InitiateCheckout")
      if ((window as any).gtag) (window as any).gtag("event", "begin_checkout", { value: 1, currency: "BRL" })

      setTimeout(() => {
        window.location.href = redirectUrl.toString()
      }, 100)
    })
  }, [destinationUrl, campaignId])

  if (showPresell) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-8">Ir para o site oficial</h1>
          <button
            onClick={() => {
              if ((window as any).ttq) (window as any).ttq.track("InitiateCheckout")
              if ((window as any).fbq) (window as any).fbq("track", "InitiateCheckout")
              window.location.href = destinationUrl || "https://purocheats.com/#store"
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-8"
          >
            Comprar agora no site oficial
          </button>
          <a href="/politica-de-privacidade" className="text-gray-400 hover:text-gray-300 text-sm underline">
            Política de Privacidade
          </a>
          <div className="mt-8 text-gray-500 text-xs">
            <p>Contato: atendimento.online@gmail.com</p>
            <p className="mt-2">
              Este conteúdo é apenas informativo. Para mais detalhes sobre o produto, acesse o site oficial. Este site é
              administrado por uma empresa legalmente registrada no Brasil.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Header */}
      <header className="border-b border-primary/20 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GhostLayerLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-white">GhostLayer</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary text-black hover:bg-primary/90">Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Proteja suas campanhas com
            <span className="text-primary"> cloaking inteligente</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Sistema avançado de cloaking que protege suas ofertas de bots e moderadores, garantindo que apenas usuários
            reais vejam seu conteúdo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90 text-lg px-8">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-primary/50 hover:bg-primary/10 text-lg px-8 bg-transparent"
              >
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-slate-900/50 border border-primary/20 rounded-lg p-6 space-y-4">
            <Shield className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold text-white">Cloaking Avançado</h3>
            <p className="text-slate-400">Detecta e bloqueia bots de plataformas de anúncios com precisão de 99%</p>
          </div>
          <div className="bg-slate-900/50 border border-primary/20 rounded-lg p-6 space-y-4">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold text-white">Redirecionamento Instantâneo</h3>
            <p className="text-slate-400">Usuários reais são redirecionados em menos de 100ms, sem perder interesse</p>
          </div>
          <div className="bg-slate-900/50 border border-primary/20 rounded-lg p-6 space-y-4">
            <BarChart3 className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold text-white">Analytics Completo</h3>
            <p className="text-slate-400">Acompanhe cliques, conversões e performance em tempo real</p>
          </div>
          <div className="bg-slate-900/50 border border-primary/20 rounded-lg p-6 space-y-4">
            <Lock className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold text-white">100% Imperceptível</h3>
            <p className="text-slate-400">Sistema invisível para plataformas de anúncios, protegendo suas contas</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-12 space-y-6">
          <h2 className="text-4xl font-bold text-white">Pronto para proteger suas campanhas?</h2>
          <p className="text-xl text-slate-300">
            Junte-se a centenas de afiliados que já protegem suas ofertas com GhostLayer
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary text-black hover:bg-primary/90 text-lg px-12">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-black/50 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2025 GhostLayer. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
