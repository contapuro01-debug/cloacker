"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Copy, MoreVertical, ExternalLink } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Campaign {
  id: string
  name: string
  slug: string
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
  tags?: string[]
  group_name?: string
  offer_name?: string
  is_active: boolean
  created_at: string
}

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`
    navigator.clipboard.writeText(url)
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Campanhas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Campanha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Grupo/Oferta</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Cliques</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Reais</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Bots</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Conv.</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const convRate =
                  campaign.real_clicks > 0 ? ((campaign.conversions / campaign.real_clicks) * 100).toFixed(1) : "0.0"

                return (
                  <tr key={campaign.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{campaign.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <code className="bg-slate-900/50 px-2 py-0.5 rounded">/c/{campaign.slug}</code>
                          {campaign.tags && campaign.tags.length > 0 && (
                            <div className="flex gap-1">
                              {campaign.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {campaign.group_name && <div className="text-slate-300">{campaign.group_name}</div>}
                        {campaign.offer_name && <div className="text-xs text-slate-400">{campaign.offer_name}</div>}
                        {!campaign.group_name && !campaign.offer_name && <span className="text-slate-500">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-medium">{campaign.total_clicks}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-green-400 font-medium">{campaign.real_clicks}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-red-400 font-medium">{campaign.bot_clicks}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-purple-400 font-medium">{convRate}%</div>
                      <div className="text-xs text-slate-400">{campaign.conversions}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={campaign.is_active ? "default" : "secondary"}
                        className={campaign.is_active ? "bg-green-600" : "bg-slate-600"}
                      >
                        {campaign.is_active ? "Ativa" : "Pausada"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyLink(campaign.slug)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link href={`/dashboard/campaigns/${campaign.id}`}>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-200">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-200">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Abrir Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
