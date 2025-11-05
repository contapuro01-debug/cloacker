"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useMemo } from "react"

interface Click {
  created_at: string
  is_bot: boolean
}

export function PerformanceChart({ clicksData }: { clicksData: Click[] }) {
  const chartData = useMemo(() => {
    const grouped = clicksData.reduce((acc: any, click) => {
      const date = new Date(click.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      if (!acc[date]) {
        acc[date] = { date, real: 0, bots: 0, total: 0 }
      }
      acc[date].total++
      if (click.is_bot) {
        acc[date].bots++
      } else {
        acc[date].real++
      }
      return acc
    }, {})

    return Object.values(grouped)
  }, [clicksData])

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Performance dos Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="real"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorReal)"
              name="Usuários Reais"
            />
            <Area
              type="monotone"
              dataKey="bots"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorBots)"
              name="Bots Bloqueados"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
