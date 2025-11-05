"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, TrendingUp, MousePointerClick } from "lucide-react"

interface Campaign {
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
}

export function DashboardStats({ campaigns }: { campaigns: Campaign[] }) {
  const stats = campaigns.reduce(
    (acc, campaign) => ({
      totalClicks: acc.totalClicks + (campaign.total_clicks || 0),
      botClicks: acc.botClicks + (campaign.bot_clicks || 0),
      realClicks: acc.realClicks + (campaign.real_clicks || 0),
      conversions: acc.conversions + (campaign.conversions || 0),
    }),
    { totalClicks: 0, botClicks: 0, realClicks: 0, conversions: 0 },
  )

  const botRate = stats.totalClicks > 0 ? Math.round((stats.botClicks / stats.totalClicks) * 100) : 0
  const conversionRate = stats.realClicks > 0 ? ((stats.conversions / stats.realClicks) * 100).toFixed(1) : "0.0"
  const protectionRate = 100 - botRate

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total de Cliques</CardTitle>
          <MousePointerClick className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalClicks.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Todos os acessos recebidos</p>
        </CardContent>
      </Card>

      <Card className="border-green-700/50 bg-gradient-to-br from-green-900/20 to-slate-900/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Usuários Reais</CardTitle>
          <Users className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{stats.realClicks.toLocaleString()}</div>
          <p className="text-xs text-green-300/70 mt-1">{protectionRate}% taxa de proteção</p>
        </CardContent>
      </Card>

      <Card className="border-red-700/50 bg-gradient-to-br from-red-900/20 to-slate-900/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Bots Bloqueados</CardTitle>
          <Shield className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{stats.botClicks.toLocaleString()}</div>
          <p className="text-xs text-red-300/70 mt-1">{botRate}% detectados como bots</p>
        </CardContent>
      </Card>

      <Card className="border-purple-700/50 bg-gradient-to-br from-purple-900/20 to-slate-900/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Conversões</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-400">{conversionRate}%</div>
          <p className="text-xs text-purple-300/70 mt-1">{stats.conversions} conversões totais</p>
        </CardContent>
      </Card>
    </div>
  )
}
