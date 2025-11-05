"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DebugLog {
  timestamp: string
  userAgent: string
  referrer: string
  isBot: boolean
  reason: string
  screenResolution: string
  language: string
  timezone: string
  platform: string
}

interface ChartData {
  time: string
  bots: number
  users: number
}

export default function DebugPage() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedFilter, setSelectedFilter] = useState<"all" | "bots" | "users">("all")

  const DEBUG_PASSWORD = process.env.NEXT_PUBLIC_DEBUG_PASSWORD || "admin123"

  useEffect(() => {
    const auth = localStorage.getItem("debugAuth")
    if (auth === DEBUG_PASSWORD) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === DEBUG_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("debugAuth", password)
      setPassword("")
    } else {
      alert("Senha incorreta!")
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/debug-logs")
        const data = await response.json()
        setLogs(data)

        // CHANGE: Gera dados para gráfico por hora com melhor granularidade
        const hourlyData: Record<string, { bots: number; users: number }> = {}
        data.forEach((log: DebugLog) => {
          const time = new Date(log.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
          if (!hourlyData[time]) {
            hourlyData[time] = { bots: 0, users: 0 }
          }
          if (log.isBot) {
            hourlyData[time].bots++
          } else {
            hourlyData[time].users++
          }
        })

        const chart = Object.entries(hourlyData).map(([time, data]) => ({
          time,
          bots: data.bots,
          users: data.users,
        }))
        setChartData(chart)
      } catch (error) {
        console.error("Erro ao buscar logs:", error)
      }
    }

    fetchLogs()

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 2000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard Debug</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-green-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Acessar
            </button>
          </form>
        </div>
      </main>
    )
  }

  // CHANGE: Filtragem de logs com estatísticas por razão de detecção
  const filteredLogs =
    selectedFilter === "all"
      ? logs
      : selectedFilter === "bots"
        ? logs.filter((l) => l.isBot)
        : logs.filter((l) => !l.isBot)

  const botCount = logs.filter((log) => log.isBot).length
  const userCount = logs.filter((log) => !log.isBot).length

  // CHANGE: Agrupar bots por razão
  const botReasons: Record<string, number> = {}
  logs.forEach((log) => {
    if (log.isBot) {
      botReasons[log.reason] = (botReasons[log.reason] || 0) + 1
    }
  })

  // CHANGE: Agrupar usuários por plataforma
  const userPlatforms: Record<string, number> = {}
  logs.forEach((log) => {
    if (!log.isBot) {
      const platform = log.platform || "Desconhecido"
      userPlatforms[platform] = (userPlatforms[platform] || 0) + 1
    }
  })

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">Dashboard Cloaker TikTok</h1>
            <p className="text-gray-400">Monitore em tempo real a detecção de bots e usuários</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("debugAuth")
              setIsAuthenticated(false)
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
            <p className="text-gray-400 text-sm mb-2">Total de Acessos</p>
            <p className="text-4xl font-bold text-white">{logs.length}</p>
            <p className="text-xs text-gray-500 mt-2">Últimas 2 horas</p>
          </div>

          <div className="bg-green-900/30 p-6 rounded-lg border border-green-800 hover:border-green-700 transition-colors">
            <p className="text-green-400 text-sm mb-2">Bots TikTok Detectados</p>
            <p className="text-4xl font-bold text-green-400">{botCount}</p>
            <p className="text-xs text-green-500 mt-2">
              {((botCount / (logs.length || 1)) * 100).toFixed(1)}% do total
            </p>
          </div>

          <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800 hover:border-blue-700 transition-colors">
            <p className="text-blue-400 text-sm mb-2">Usuários Reais</p>
            <p className="text-4xl font-bold text-blue-400">{userCount}</p>
            <p className="text-xs text-blue-500 mt-2">
              {((userCount / (logs.length || 1)) * 100).toFixed(1)}% do total
            </p>
          </div>

          <div className="bg-purple-900/30 p-6 rounded-lg border border-purple-800 hover:border-purple-700 transition-colors">
            <p className="text-purple-400 text-sm mb-2">Taxa de Conversão Real</p>
            <p className="text-4xl font-bold text-purple-400">{userCount}</p>
            <p className="text-xs text-purple-500 mt-2">Usuários reais para redirecionar</p>
          </div>
        </div>

        {/* Razões de Detecção */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-4 text-green-400">Razões de Bot Detectados</h3>
            {Object.entries(botReasons).length === 0 ? (
              <p className="text-gray-500">Nenhum bot detectado ainda</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(botReasons).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">{reason}</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Plataformas dos Usuários Reais</h3>
            {Object.entries(userPlatforms).length === 0 ? (
              <p className="text-gray-500">Nenhum usuário real ainda</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(userPlatforms).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">{platform}</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Acessos por Hora</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Usuários Reais" />
                <Line type="monotone" dataKey="bots" stroke="#10b981" strokeWidth={2} name="Bots" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Distribuição Total</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ name: "Total", bots: botCount, users: userCount }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }} />
                <Legend />
                <Bar dataKey="users" fill="#3b82f6" name="Usuários Reais" />
                <Bar dataKey="bots" fill="#10b981" name="Bots TikTok" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controles e Filtros */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {autoRefresh ? "✓ Auto-refresh ON" : "Auto-refresh OFF"}
          </button>

          <div className="flex gap-2">
            {(["all", "bots", "users"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded font-bold transition-colors ${
                  selectedFilter === filter ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {filter === "all" ? "Todos" : filter === "bots" ? "Bots" : "Usuários"}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setLogs([])
              setChartData([])
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors font-bold"
          >
            Limpar Logs
          </button>
        </div>

        {/* Tabela de Logs */}
        <div className="bg-gray-900 rounded-lg overflow-x-auto border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Razão</th>
                <th className="px-4 py-3 text-left">Resolução</th>
                <th className="px-4 py-3 text-left">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhum log encontrado. Acesse a página presell para gerar eventos.
                  </td>
                </tr>
              ) : (
                filteredLogs
                  .slice()
                  .reverse()
                  .slice(0, 50)
                  .map((log, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-gray-300">{new Date(log.timestamp).toLocaleTimeString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            log.isBot ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                          }`}
                        >
                          {log.isBot ? "BOT" : "USUÁRIO"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{log.reason}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.screenResolution}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate" title={log.userAgent}>
                        {log.userAgent.substring(0, 50)}...
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-gray-400 text-xs space-y-1">
          <p>Senha: {DEBUG_PASSWORD}</p>
          <p>Configure NEXT_PUBLIC_DEBUG_PASSWORD para alterar</p>
        </div>
      </div>
    </main>
  )
}
