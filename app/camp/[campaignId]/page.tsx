"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface CampaignData {
  id: string
  platform: string
  campaignName: string
  destinationUrl: string
  hits: number
  conversions: number
}

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params?.campaignId as string
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [isBotDetected, setIsBotDetected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaignAndDetect = async () => {
      try {
        // Fetch campaign data
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", campaignId }),
        })

        const data = await res.json()
        if (!data.success || !data.campaign) {
          console.log("[v0] Campaign not found:", campaignId)
          setLoading(false)
          return
        }

        const campaign = data.campaign
        setCampaign(campaign)

        const isBot = detectBot(campaign.platform)
        setIsBotDetected(isBot)

        if (!isBot) {
          console.log("[v0] Real user, redirecting to:", campaign.destinationUrl)

          // Faz tracking não-bloqueante
          fetch("/api/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "convert", campaignId }),
            keepalive: true,
          }).catch(() => {})

          // Redireciona imediatamente
          window.location.href = campaign.destinationUrl
        } else {
          console.log("[v0] Bot detected for platform:", campaign.platform)
          setLoading(false)
        }
      } catch (e) {
        console.log("[v0] Error fetching campaign:", e)
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaignAndDetect()
    }
  }, [campaignId])

  const detectBot = (platform: string): boolean => {
    const userAgent = navigator.userAgent.toLowerCase()

    // Padrões específicos de cada plataforma (MUITO mais precisos)
    const botPatterns: Record<string, string[]> = {
      tiktok: ["tiktok", "bytedance", "tt_webview", "tt_ads", "douyin"],
      meta: ["facebookexternalhit", "fbbot", "metabot"],
      google: ["googlebot", "adsbot-google", "medpartners"],
    }

    const patterns = botPatterns[platform] || []
    const isKnownBot = patterns.some((p) => userAgent.includes(p))

    // Apenas retorna true se for bot CONHECIDO, não marca usuários reais
    return isKnownBot
  }

  // Show presell for bots
  if (isBotDetected && campaign) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-white text-3xl font-bold mb-8">Ir para o site oficial</h1>
          <button
            onClick={() => {
              window.location.href = campaign.destinationUrl
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
          >
            Comprar agora no site oficial
          </button>
        </div>

        <footer className="fixed bottom-0 w-full bg-black text-gray-500 text-xs py-4 px-6 border-t border-gray-800 text-center">
          <p className="mb-2">
            Este conteúdo é apenas informativo. Para mais detalhes sobre o produto, acesse o site oficial. Este site é
            administrado por uma empresa legalmente registrada no Brasil.
          </p>
          <div className="space-y-1">
            <p>
              Email:{" "}
              <a href="mailto:atendimento.online@gmail.com" className="text-green-500 hover:underline">
                atendimento.online@gmail.com
              </a>
            </p>
            <p>
              <a href="/politica-de-privacidade" className="text-green-500 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </footer>
      </main>
    )
  }

  if (loading || !campaign) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Verificando...</p>
        </div>
      </main>
    )
  }

  // Fallback
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecionando...</div>
    </main>
  )
}
