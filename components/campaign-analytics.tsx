"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useMemo } from "react"

interface Click {
  id: string
  is_bot: boolean
  confidence_score: number
  detection_reason: string | null
  country: string | null
  city: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  created_at: string
}

interface Campaign {
  id: string
  name: string
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
}

export function CampaignAnalytics({ campaign, clicks }: { campaign: Campaign; clicks: Click[] }) {
  const analytics = useMemo(() => {
    // Group by date
    const clicksByDate = clicks.reduce(
      (acc, click) => {
        const date = new Date(click.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = { date, real: 0, bots: 0 }
        }
        if (click.is_bot) {
          acc[date].bots++
        } else {
          acc[date].real++
        }
        return acc
      },
      {} as Record<string, { date: string; real: number; bots: number }>,
    )

    const timelineData = Object.values(clicksByDate).slice(-30)

    // Group by country
    const byCountry = clicks.reduce(
      (acc, click) => {
        const country = click.country || "Unknown"
        acc[country] = (acc[country] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const countryData = Object.entries(byCountry)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Group by device
    const byDevice = clicks.reduce(
      (acc, click) => {
        const device = click.device_type || "Unknown"
        acc[device] = (acc[device] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const deviceData = Object.entries(byDevice).map(([name, value]) => ({ name, value }))

    // Group by browser
    const byBrowser = clicks.reduce(
      (acc, click) => {
        const browser = click.browser || "Unknown"
        acc[browser] = (acc[browser] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const browserData = Object.entries(byBrowser)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Group by UTM source
    const byUtmSource = clicks.reduce(
      (acc, click) => {
        const source = click.utm_source || "Direct"
        acc[source] = (acc[source] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const utmSourceData = Object.entries(byUtmSource)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Bot detection reasons
    const botReasons = clicks
      .filter((c) => c.is_bot && c.detection_reason)
      .reduce(
        (acc, click) => {
          const reason = click.detection_reason || "Unknown"
          acc[reason] = (acc[reason] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const botReasonData = Object.entries(botReasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      timelineData,
      countryData,
      deviceData,
      browserData,
      utmSourceData,
      botReasonData,
    }
  }, [clicks])

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{campaign.total_clicks}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Real Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{campaign.real_clicks}</div>
            <p className="text-xs text-slate-400 mt-1">
              {campaign.total_clicks > 0
                ? `${Math.round((campaign.real_clicks / campaign.total_clicks) * 100)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bots Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{campaign.bot_clicks}</div>
            <p className="text-xs text-slate-400 mt-1">
              {campaign.total_clicks > 0 ? `${Math.round((campaign.bot_clicks / campaign.total_clicks) * 100)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{campaign.conversions}</div>
            <p className="text-xs text-slate-400 mt-1">
              {campaign.real_clicks > 0
                ? `${((campaign.conversions / campaign.real_clicks) * 100).toFixed(2)}% CVR`
                : "0% CVR"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Traffic Timeline</CardTitle>
          <CardDescription className="text-slate-400">Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2} name="Real Users" />
              <Line type="monotone" dataKey="bots" stroke="#ef4444" strokeWidth={2} name="Bots" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Geographic & Device Data */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Top Countries</CardTitle>
            <CardDescription className="text-slate-400">Traffic by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Device Types</CardTitle>
            <CardDescription className="text-slate-400">Traffic by device</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      </div>

      {/* UTM Sources & Bot Reasons */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Traffic Sources</CardTitle>
            <CardDescription className="text-slate-400">UTM source breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.utmSourceData.map((source, index) => {
                const percentage = clicks.length > 0 ? (source.value / clicks.length) * 100 : 0
                return (
                  <div key={source.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{source.name}</span>
                      <span className="text-sm text-slate-400">
                        {source.value} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Bot Detection Reasons</CardTitle>
            <CardDescription className="text-slate-400">Why traffic was flagged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.botReasonData.map((reason, index) => {
                const percentage = campaign.bot_clicks > 0 ? (reason.value / campaign.bot_clicks) * 100 : 0
                return (
                  <div key={reason.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{reason.name}</span>
                      <span className="text-sm text-slate-400">
                        {reason.value} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks Table */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Clicks</CardTitle>
          <CardDescription className="text-slate-400">Latest traffic activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Country</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Device</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {clicks.slice(0, 20).map((click) => (
                  <tr key={click.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-slate-300">{new Date(click.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={click.is_bot ? "destructive" : "default"}>{click.is_bot ? "Bot" : "Real"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{click.country || "Unknown"}</td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{click.device_type || "Unknown"}</td>
                    <td className="py-3 px-4 text-slate-300">{click.utm_source || "Direct"}</td>
                    <td className="py-3 px-4 text-slate-300">{click.confidence_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
