"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DebugCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error)
    } finally {
      setLoading(false)
    }
  }

  const testPublicEndpoint = async (slug: string) => {
    try {
      console.log("Testando endpoint público para slug:", slug)
      const response = await fetch(`/api/campaigns/public?slug=${slug}`)
      const data = await response.json()

      setTestResults((prev: any) => ({
        ...prev,
        [slug]: {
          status: response.status,
          success: response.ok,
          data: data,
        },
      }))

      console.log("Resultado do teste:", { status: response.status, data })
    } catch (error) {
      console.error("Erro ao testar endpoint:", error)
      setTestResults((prev: any) => ({
        ...prev,
        [slug]: {
          status: "error",
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      }))
    }
  }

  const testCloakingPage = (slug: string) => {
    window.open(`/c/${slug}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Debug de Campanhas</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Total de Campanhas: {campaigns.length}</h2>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 bg-slate-800 border-slate-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.is_active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {campaign.is_active ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Slug:</p>
                    <p className="text-white font-mono">{campaign.slug}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">ID:</p>
                    <p className="text-white font-mono text-xs">{campaign.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Safe Page:</p>
                    <p className="text-blue-400 truncate">{campaign.safe_page_url}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Offer Page:</p>
                    <p className="text-green-400 truncate">{campaign.offer_page_url}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => testPublicEndpoint(campaign.slug)} variant="outline" size="sm">
                    Testar API Pública
                  </Button>
                  <Button onClick={() => testCloakingPage(campaign.slug)} variant="outline" size="sm">
                    Abrir Página de Cloaking
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://ghostlayer.vercel.app/c/${campaign.slug}`)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copiar URL
                  </Button>
                </div>

                {testResults[campaign.slug] && (
                  <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                    <p className="text-sm font-semibold text-white mb-2">Resultado do Teste:</p>
                    <pre className="text-xs text-slate-300 overflow-auto">
                      {JSON.stringify(testResults[campaign.slug], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {campaigns.length === 0 && (
            <Card className="p-8 bg-slate-800 border-slate-700 text-center">
              <p className="text-slate-400">Nenhuma campanha encontrada.</p>
              <p className="text-sm text-slate-500 mt-2">Crie uma campanha primeiro em /dashboard/campaigns/new</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
