"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Campaign {
  id: string
  platform: string
  campaignName: string
  hits: number
  conversions: number
}

interface DashboardData {
  campaigns: Campaign[]
  totalHits: number
  totalConversions: number
  conversionRate: number
  pixelEvents: {
    tiktok: number
    meta: number
    google: number
  }
}

export default function TrackingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/campaigns")
        const campaigns = (await res.json()).campaigns || []

        const totalHits = campaigns.reduce((sum: number, c: Campaign) => sum + c.hits, 0)
        const totalConversions = campaigns.reduce((sum: number, c: Campaign) => sum + c.conversions, 0)

        const pixelEvents = {
          tiktok: campaigns
            .filter((c: Campaign) => c.platform === "tiktok")
            .reduce((sum: number, c: Campaign) => sum + c.conversions, 0),
          meta: campaigns
            .filter((c: Campaign) => c.platform === "meta")
            .reduce((sum: number, c: Campaign) => sum + c.conversions, 0),
          google: campaigns
            .filter((c: Campaign) => c.platform === "google")
            .reduce((sum: number, c: Campaign) => sum + c.conversions, 0),
        }

        setData({
          campaigns,
          totalHits,
          totalConversions,
          conversionRate: totalHits > 0 ? (totalConversions / totalHits) * 100 : 0,
          pixelEvents,
        })
      } catch (e) {
        console.log("[v0] Error fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Carregando dashboard...</p>
      </div>
    )
  }

  const chartData = data.campaigns.map((c) => ({
    name: c.campaignName,
    hits: c.hits,
    conversions: c.conversions,
  }))

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard de Tracking</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm font-semibold">TOTAL DE ACESSOS</div>
            <div className="text-3xl font-bold text-white mt-2">{data.totalHits}</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm font-semibold">CONVERSÕES</div>
            <div className="text-3xl font-bold text-green-400 mt-2">{data.totalConversions}</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm font-semibold">TAXA CONVERSÃO</div>
            <div className="text-3xl font-bold text-blue-400 mt-2">{data.conversionRate.toFixed(2)}%</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm font-semibold">CAMPANHAS ATIVAS</div>
            <div className="text-3xl font-bold text-purple-400 mt-2">{data.campaigns.length}</div>
          </div>
        </div>

        {/* Gráficos */}
        {data.campaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Acessos vs Conversões por Campanha</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }} />
                  <Legend />
                  <Bar dataKey="hits" fill="#3b82f6" name="Acessos" />
                  <Bar dataKey="conversions" fill="#10b981" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Pixel Events por Plataforma</h2>
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">TikTok Pixel</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{data.pixelEvents.tiktok} eventos</p>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Meta Pixel</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{data.pixelEvents.meta} eventos</p>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Google Ads</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{data.pixelEvents.google} eventos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Campanhas */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Campanhas Detalhadas</h2>
          {data.campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">Campanha</th>
                    <th className="text-left py-3 px-4 text-gray-300">Plataforma</th>
                    <th className="text-left py-3 px-4 text-gray-300">Acessos</th>
                    <th className="text-left py-3 px-4 text-gray-300">Conversões</th>
                    <th className="text-left py-3 px-4 text-gray-300">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4">{campaign.campaignName}</td>
                      <td className="py-3 px-4 capitalize">{campaign.platform}</td>
                      <td className="py-3 px-4 text-blue-400">{campaign.hits}</td>
                      <td className="py-3 px-4 text-green-400">{campaign.conversions}</td>
                      <td className="py-3 px-4 text-purple-400">
                        {campaign.hits > 0 ? ((campaign.conversions / campaign.hits) * 100).toFixed(2) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma campanha criada ainda</p>
          )}
        </div>
      </div>
    </div>
  )
}
