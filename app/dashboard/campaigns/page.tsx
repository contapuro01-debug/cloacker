import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CampaignsTableWithFilters } from "@/components/campaigns-table-with-filters"

export default async function CampaignsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: initialCampaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas campanhas de cloaking</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      <CampaignsTableWithFilters initialCampaigns={initialCampaigns || []} />
    </div>
  )
}
