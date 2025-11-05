"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, Tag, Folder } from "lucide-react"
import { useState } from "react"

export function DashboardFilters() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          {/* Date Range */}
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>

          {/* Group Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
              <Folder className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              <SelectItem value="tiktok">TikTok Ads</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tags</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
              <SelectItem value="testing">Em teste</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-slate-600 text-slate-200 bg-slate-900/50">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
