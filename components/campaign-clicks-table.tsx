"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, CheckCircle2, XCircle, Globe, Monitor, Smartphone, MapPin, Clock } from "lucide-react"

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
  browser: string
  os: string
  device_type: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  referrer: string
  fbclid: string
  gclid: string
  ttclid: string
}

export function CampaignClicksTable({ campaignId }: { campaignId: string }) {
  const [clicks, setClicks] = useState<Click[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClicks = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/clicks`)
        if (response.ok) {
          const data = await response.json()
          setClicks(data.clicks || [])
        }
      } catch (error) {
        console.error("[v0] Erro ao buscar cliques:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClicks()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchClicks, 30000)
    return () => clearInterval(interval)
  }, [campaignId])

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00FF94]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5 text-[#00FF94]" />
          Cliques Detalhados
        </CardTitle>
        <CardDescription className="text-slate-400">
          Análise completa de cada clique com fingerprint, geolocalização e motivo da detecção
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clicks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum clique registrado ainda</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Data/Hora</TableHead>
                  <TableHead className="text-slate-300">Localização</TableHead>
                  <TableHead className="text-slate-300">Dispositivo</TableHead>
                  <TableHead className="text-slate-300">Origem</TableHead>
                  <TableHead className="text-slate-300">Motivo</TableHead>
                  <TableHead className="text-slate-300">Fingerprint</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicks.map((click) => (
                  <TableRow key={click.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {click.is_bot ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Bot
                            </Badge>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[#00FF94]" />
                            <Badge className="bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/20">Real</Badge>
                          </>
                        )}
                        <span className="text-xs text-slate-400">{click.confidence_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-sm">
                          {new Date(click.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <div className="text-sm">
                          <div className="text-slate-300">{click.country || "N/A"}</div>
                          {click.city && <div className="text-xs text-slate-500">{click.city}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {click.device_type === "mobile" ? (
                          <Smartphone className="h-3 w-3 text-slate-500" />
                        ) : (
                          <Monitor className="h-3 w-3 text-slate-500" />
                        )}
                        <div className="text-sm">
                          <div className="text-slate-300">{click.browser || "N/A"}</div>
                          <div className="text-xs text-slate-500">{click.os || "N/A"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {click.utm_source && (
                          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 mb-1">
                            {click.utm_source}
                          </Badge>
                        )}
                        {click.utm_medium && <div className="text-xs text-slate-500 mt-1">{click.utm_medium}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-300 max-w-xs truncate" title={click.detection_reason}>
                        {click.detection_reason || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        {click.fingerprint_hash?.substring(0, 8) || "N/A"}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
