import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardFilters } from "@/components/dashboard-filters"
import { CampaignsTable } from "@/components/campaigns-table"
import { PerformanceChart } from "@/components/performance-chart"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get campaigns with all data
  const { data: campaigns } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })

  // Get clicks data for charts
  const { data: clicksData } = await supabase
    .from("clicks")
    .select("created_at, is_bot, country, device_type, browser")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Análise completa de performance e cloaking</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <DashboardStats campaigns={campaigns || []} />

      {/* Performance Chart */}
      <PerformanceChart clicksData={clicksData || []} />

      {/* Filters */}
      <DashboardFilters />

      {/* Campaigns Table */}
      <CampaignsTable campaigns={campaigns || []} />
    </div>
  )
}
