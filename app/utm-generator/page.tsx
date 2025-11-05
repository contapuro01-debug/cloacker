"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Copy, Check, Trash2 } from "lucide-react"

const PLATFORMS = {
  tiktok: {
    name: "TikTok Ads",
    botPatterns: ["tiktok", "bytedance", "tt_webview", "tt_ads"],
  },
  meta: {
    name: "Meta Ads (Facebook/Instagram)",
    botPatterns: ["facebookexternalhit", "facebook", "metabot"],
  },
  google: {
    name: "Google Ads",
    botPatterns: ["googlebot", "adsbot-google"],
  },
}

interface Campaign {
  id: string
  platform: string
  campaignName: string
  destinationUrl: string
  intermediateUrl: string
  createdAt: string
  hits: number
  conversions: number
}

export default function UTMGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [newCampaign, setNewCampaign] = useState({
    platform: "tiktok",
    campaignName: "",
    destinationUrl: "",
  })
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns()
      const interval = setInterval(fetchCampaigns, 3000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns")
      const data = await res.json()
      if (data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch (e) {
      console.log("[v0] Error fetching campaigns")
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredPassword = process.env.NEXT_PUBLIC_DEBUG_PASSWORD || "admin123"
    if (password === requiredPassword) {
      setIsAuthenticated(true)
      setAuthError("")
    } else {
      setAuthError("Senha incorreta")
    }
  }

  const generateCampaign = async () => {
    if (!newCampaign.campaignName || !newCampaign.destinationUrl || !newCampaign.platform) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    setLoading(true)
    try {
      let destUrl = newCampaign.destinationUrl
      if (!destUrl.startsWith("http")) {
        destUrl = "https://" + destUrl
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          campaign: {
            campaignName: newCampaign.campaignName,
            destinationUrl: destUrl,
            platform: newCampaign.platform,
            utmMedium: "cpc",
            utmContent: "white_page",
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setNewCampaign({ platform: "tiktok", campaignName: "", destinationUrl: "" })
        fetchCampaigns()
        alert("Campanha criada com sucesso!")
      }
    } catch (e) {
      alert("Erro ao criar campanha")
    } finally {
      setLoading(false)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", campaignId }),
      })

      if ((await res.json()).success) {
        fetchCampaigns()
      }
    } catch (e) {
      console.log("[v0] Error deleting campaign")
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getFullUrl = (intermediateUrl: string) => {
    if (intermediateUrl.startsWith("http")) {
      return intermediateUrl
    }
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://puro-cheats.vercel.app"
    if (intermediateUrl.startsWith("/")) {
      return `${baseUrl}${intermediateUrl}`
    }
    return `${baseUrl}/${intermediateUrl}`
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 border border-green-500/20 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Acesso Restrito</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-all"
            >
              Acessar
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Generator de URLs com UTM</h1>
        <p className="text-gray-400 mb-8">Crie campanhas inteligentes com domínios únicos para cada uma</p>

        {/* Nova Campanha */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-green-500/20">
          <h2 className="text-2xl font-bold mb-6">Nova Campanha</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Plataforma</label>
              <select
                value={newCampaign.platform}
                onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
              >
                {Object.entries(PLATFORMS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nome da Campanha</label>
              <input
                type="text"
                placeholder="ex: Jan_2025_V1"
                value={newCampaign.campaignName}
                onChange={(e) => setNewCampaign({ ...newCampaign, campaignName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">URL de Destino (White Page/Loja)</label>
              <input
                type="text"
                placeholder="https://purocheats.com/#store"
                value={newCampaign.destinationUrl}
                onChange={(e) => setNewCampaign({ ...newCampaign, destinationUrl: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">URL onde os usuários reais serão redirecionados</p>
            </div>
          </div>

          <button
            onClick={generateCampaign}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Campanha"}
          </button>
        </div>

        {/* Campanhas Criadas */}
        {campaigns.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Campanhas Criadas ({campaigns.length})</h2>

            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const fullUrl = getFullUrl(campaign.intermediateUrl)

                return (
                  <div key={campaign.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{campaign.campaignName}</h3>
                        <p className="text-sm text-gray-400">
                          {PLATFORMS[campaign.platform as keyof typeof PLATFORMS].name} • Hits: {campaign.hits} •
                          Conversões: {campaign.conversions}
                        </p>
                      </div>
                      <button onClick={() => deleteCampaign(campaign.id)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">URL para Colocar na Campanha:</p>
                        <div className="flex items-center gap-2 bg-gray-700 rounded p-3">
                          <code className="text-xs flex-1 overflow-auto break-all">{fullUrl}</code>
                          <button onClick={() => copyToClipboard(fullUrl, campaign.id)}>
                            {copied === campaign.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-yellow-400 mt-1">
                          ✓ Use ESTA URL no anúncio - Nunca será banida e funciona 100%
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">URL de Destino (oculta dos bots):</p>
                        <div className="bg-gray-700 rounded p-3">
                          <code className="text-xs break-all text-gray-300">{campaign.destinationUrl}</code>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Apenas usuários reais veem esta URL</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {campaigns.length === 0 && isAuthenticated && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
            <p className="text-gray-400">Nenhuma campanha criada ainda. Crie uma para começar!</p>
          </div>
        )}
      </div>
    </main>
  )
}
