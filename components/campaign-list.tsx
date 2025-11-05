"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, ExternalLink, Copy, Trash2, Edit, BarChart3, LinkIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateCampaignUrl } from "@/lib/utm-generator"
import { mutate } from "swr"

interface Campaign {
  id: string
  name: string
  slug: string
  safe_page_url: string
  offer_page_url: string
  custom_domain: string | null
  traffic_source: string
  is_active: boolean
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
  created_at: string
}

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return

    setDeletingId(id)
    try {
      const response = await fetch("/api/campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir campanha")
      }

      // Invalidar cache do SWR para atualizar a lista imediatamente
      await mutate("/api/campaigns")
    } catch (error) {
      console.error("Erro ao deletar:", error)
      alert("Erro ao excluir campanha. Tente novamente.")
    } finally {
      setDeletingId(null)
    }
  }

  const getFullUrl = (campaign: Campaign) => {
    const baseUrl = campaign.custom_domain ? `https://${campaign.custom_domain}` : "https://ghostlayer.vercel.app"
    return generateCampaignUrl(baseUrl, campaign.slug, campaign.traffic_source as any)
  }

  const copyUrl = (campaign: Campaign) => {
    const url = getFullUrl(campaign)
    navigator.clipboard.writeText(url)
    setCopiedId(campaign.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma campanha ainda</p>
          <Link href="/dashboard/campaigns/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Criar sua primeira campanha
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => {
        const botRate = campaign.total_clicks > 0 ? Math.round((campaign.bot_clicks / campaign.total_clicks) * 100) : 0
        const fullUrl = getFullUrl(campaign)

        return (
          <Card key={campaign.id} className="border-border bg-card hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-foreground">{campaign.name}</CardTitle>
                    <Badge
                      variant={campaign.is_active ? "default" : "secondary"}
                      className={campaign.is_active ? "bg-primary/20 text-primary border-primary/30" : ""}
                    >
                      {campaign.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {campaign.traffic_source || "Geral"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      URL da Campanha:
                    </p>
                    <code className="text-xs text-primary bg-primary/5 px-2 py-1 rounded border border-primary/20 block break-all">
                      {fullUrl}
                    </code>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                      <Link href={`/dashboard/campaigns/${campaign.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                      <Link href={`/dashboard/analytics/${campaign.id}`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyUrl(campaign)} className="text-foreground cursor-pointer">
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedId === campaign.id ? "Copiado!" : "Copiar URL"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                      <a href={`/c/${campaign.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(campaign.id)}
                      disabled={deletingId === campaign.id}
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingId === campaign.id ? "Excluindo..." : "Excluir"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Total de Cliques</p>
                  <p className="text-2xl font-bold text-foreground">{campaign.total_clicks || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Usuários Reais</p>
                  <p className="text-2xl font-bold text-primary">{campaign.real_clicks || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Bots Bloqueados</p>
                  <p className="text-2xl font-bold text-destructive">{campaign.bot_clicks || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Taxa de Bots</p>
                  <p className="text-2xl font-bold text-accent">{botRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
