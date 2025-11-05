"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, CheckCircle2, XCircle, Search } from "lucide-react"

interface Click {
  id: string
  created_at: string
  is_bot: boolean
  confidence_score: number
  detection_reason: string
  fingerprint_hash: string
  user_agent: string
  ip_address: string
  country: string
  city: string
  device_type: string
  browser: string
  os: string
  referrer: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  fbclid: string
  ttclid: string
  gclid: string
}

export function DetailedClicksTable({ campaignId }: { campaignId?: string }) {
  const [clicks, setClicks] = useState<Click[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "real" | "bot">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchClicks()
    const interval = setInterval(fetchClicks, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [campaignId])

  const fetchClicks = async () => {
    try {
      const url = campaignId ? `/api/campaigns/${campaignId}/clicks` : `/api/analytics/all-clicks`
      const response = await fetch(url)
      const data = await response.json()
      setClicks(data.clicks || [])
    } catch (error) {
      console.error("[v0] Error fetching clicks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const detectProxy = (ip: string, userAgent: string) => {
    // Basic proxy detection based on common patterns
    const proxyIndicators = ["proxy", "vpn", "tor", "anonymizer"]
    const ua = userAgent?.toLowerCase() || ""
    return proxyIndicators.some((indicator) => ua.includes(indicator))
  }

  const getOriginSource = (click: Click) => {
    if (click.fbclid) return { platform: "Facebook", id: click.fbclid }
    if (click.ttclid) return { platform: "TikTok", id: click.ttclid }
    if (click.gclid) return { platform: "Google", id: click.gclid }
    if (click.utm_source) return { platform: click.utm_source, id: click.utm_campaign }
    if (click.referrer) return { platform: "Direct", id: click.referrer }
    return { platform: "Direct", id: "N/A" }
  }

  const filteredClicks = clicks.filter((click) => {
    const matchesFilter = filter === "all" || (filter === "real" && !click.is_bot) || (filter === "bot" && click.is_bot)

    const matchesSearch =
      searchTerm === "" ||
      click.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.browser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.os?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.ip_address?.includes(searchTerm)

    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return <div className="text-white">Carregando dados detalhados...</div>
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Análise Detalhada de Cliques</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por país, cidade, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white w-64"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="real">Usuários Reais</SelectItem>
                <SelectItem value="bot">Bots</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Data/Hora</TableHead>
                <TableHead className="text-slate-300">Origem</TableHead>
                <TableHead className="text-slate-300">Localização</TableHead>
                <TableHead className="text-slate-300">Dispositivo</TableHead>
                <TableHead className="text-slate-300">Navegador/OS</TableHead>
                <TableHead className="text-slate-300">IP/Proxy</TableHead>
                <TableHead className="text-slate-300">Fingerprint</TableHead>
                <TableHead className="text-slate-300">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClicks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                    Nenhum clique encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClicks.map((click) => {
                  const origin = getOriginSource(click)
                  const hasProxy = detectProxy(click.ip_address, click.user_agent)

                  return (
                    <TableRow key={click.id} className="border-slate-700">
                      <TableCell>
                        {click.is_bot ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Bot ({click.confidence_score}%)
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 w-fit bg-green-900/30 text-green-400 border-green-700"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Real
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{formatDate(click.created_at)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-xs">
                            {origin.platform}
                          </Badge>
                          {click.utm_source && (
                            <span className="text-xs text-slate-400">
                              {click.utm_medium} / {click.utm_campaign}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{click.country || "N/A"}</span>
                            <span className="text-xs text-slate-400">{click.city || "N/A"}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(click.device_type)}
                          <span className="text-sm capitalize">{click.device_type || "Desktop"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{click.browser || "N/A"}</span>
                          <span className="text-xs text-slate-400">{click.os || "N/A"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono">{click.ip_address || "N/A"}</span>
                          {hasProxy && (
                            <Badge variant="outline" className="w-fit text-xs text-orange-400 border-orange-700">
                              <Shield className="h-3 w-3 mr-1" />
                              Proxy
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <span className="text-xs font-mono text-slate-400">
                          {click.fingerprint_hash?.substring(0, 8)}...
                        </span>
                      </TableCell>

                      <TableCell className="text-slate-300">
                        <span className="text-xs text-slate-400 max-w-xs truncate block">
                          {click.detection_reason || "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Mostrando {filteredClicks.length} de {clicks.length} cliques
        </div>
      </CardContent>
    </Card>
  )
}
