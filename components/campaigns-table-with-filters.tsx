"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { CampaignList } from "@/components/campaign-list"

interface Campaign {
  id: string
  name: string
  slug: string
  safe_page_url: string
  offer_page_url: string
  custom_domain: string | null
  countries: string[]
  languages: string[]
  devices: string[]
  traffic_sources: string[]
  is_active: boolean
  total_clicks: number
  bot_clicks: number
  real_clicks: number
  tags: string[] | null
  group: string | null
  offer: string | null
  created_at: string
  updated_at: string
}

export function CampaignsTableWithFilters({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGroup, setFilterGroup] = useState<string>("all")
  const [filterOffer, setFilterOffer] = useState<string>("all")
  const [filterTag, setFilterTag] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Extract unique values for filters
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>()
    initialCampaigns.forEach((c) => c.group && groups.add(c.group))
    return Array.from(groups)
  }, [initialCampaigns])

  const uniqueOffers = useMemo(() => {
    const offers = new Set<string>()
    initialCampaigns.forEach((c) => c.offer && offers.add(c.offer))
    return Array.from(offers)
  }, [initialCampaigns])

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>()
    initialCampaigns.forEach((c) => c.tags?.forEach((tag) => tags.add(tag)))
    return Array.from(tags)
  }, [initialCampaigns])

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return initialCampaigns.filter((campaign) => {
      const matchesSearch =
        searchTerm === "" ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.slug.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGroup = filterGroup === "all" || campaign.group === filterGroup
      const matchesOffer = filterOffer === "all" || campaign.offer === filterOffer
      const matchesTag = filterTag === "all" || campaign.tags?.includes(filterTag)
      const matchesStatus =
        filterStatus === "all" || (filterStatus === "active" ? campaign.is_active : !campaign.is_active)

      return matchesSearch && matchesGroup && matchesOffer && matchesTag && matchesStatus
    })
  }, [initialCampaigns, searchTerm, filterGroup, filterOffer, filterTag, filterStatus])

  const clearFilters = () => {
    setSearchTerm("")
    setFilterGroup("all")
    setFilterOffer("all")
    setFilterTag("all")
    setFilterStatus("all")
  }

  const activeFiltersCount = [filterGroup, filterOffer, filterTag, filterStatus].filter((f) => f !== "all").length

  return (
    <div className="space-y-4">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os Grupos</SelectItem>
                  {uniqueGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterOffer} onValueChange={setFilterOffer}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Oferta" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todas as Ofertas</SelectItem>
                  {uniqueOffers.map((offer) => (
                    <SelectItem key={offer} value={offer}>
                      {offer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todas as Tags</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">{activeFiltersCount} filtro(s) ativo(s)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white">
                  Limpar Filtros
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-slate-400">
              Mostrando {filteredCampaigns.length} de {initialCampaigns.length} campanhas
            </div>
          </div>
        </CardContent>
      </Card>

      <CampaignList campaigns={filteredCampaigns} />
    </div>
  )
}
