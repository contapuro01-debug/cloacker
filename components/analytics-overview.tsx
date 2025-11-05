"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Campaign {
  id: string
  name: string
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
  created_at: string
}

export function AnalyticsOverview({ campaigns }: { campaigns: Campaign[] }) {
  // Calculate overall stats
  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      totalClicks: acc.totalClicks + campaign.total_clicks,
      botClicks: acc.botClicks + campaign.bot_clicks,
      realClicks: acc.realClicks + campaign.real_clicks,
      conversions: acc.conversions + campaign.conversions,
    }),
    { totalClicks: 0, botClicks: 0, realClicks: 0, conversions: 0 },
  )

  // Prepare data for charts
  const campaignData = campaigns.slice(0, 10).map((campaign) => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + "..." : campaign.name,
    real: campaign.real_clicks,
    bots: campaign.bot_clicks,
  }))

  const pieData = [
    { name: "Real Users", value: totalStats.realClicks, color: "#10b981" },
    { name: "Bots", value: totalStats.botClicks, color: "#ef4444" },
  ]

  const conversionRate =
    totalStats.realClicks > 0 ? ((totalStats.conversions / totalStats.realClicks) * 100).toFixed(2) : "0.00"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">All clicks tracked</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Real Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{totalStats.realClicks.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">
              {totalStats.totalClicks > 0
                ? `${Math.round((totalStats.realClicks / totalStats.totalClicks) * 100)}% of traffic`
                : "0% of traffic"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bots Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{totalStats.botClicks.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">
              {totalStats.totalClicks > 0
                ? `${Math.round((totalStats.botClicks / totalStats.totalClicks) * 100)}% filtered`
                : "0% filtered"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{conversionRate}%</div>
            <p className="text-xs text-slate-400 mt-1">{totalStats.conversions} conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Traffic Distribution</CardTitle>
            <CardDescription className="text-slate-400">Real users vs bots</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Campaign Performance</CardTitle>
            <CardDescription className="text-slate-400">Top campaigns by traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="real" fill="#10b981" name="Real Users" />
                <Bar dataKey="bots" fill="#ef4444" name="Bots" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Campaign Details</CardTitle>
          <CardDescription className="text-slate-400">Click for detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const botRate =
                campaign.total_clicks > 0 ? Math.round((campaign.bot_clicks / campaign.total_clicks) * 100) : 0

              return (
                <Link
                  key={campaign.id}
                  href={`/dashboard/analytics/${campaign.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors border border-slate-700"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{campaign.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-slate-400">
                        Total: <span className="text-white font-medium">{campaign.total_clicks}</span>
                      </span>
                      <span className="text-slate-400">
                        Real: <span className="text-green-400 font-medium">{campaign.real_clicks}</span>
                      </span>
                      <span className="text-slate-400">
                        Bots: <span className="text-red-400 font-medium">{campaign.bot_clicks}</span>
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {botRate}% bot rate
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
