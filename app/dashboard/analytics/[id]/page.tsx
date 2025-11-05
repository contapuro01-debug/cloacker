import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignAnalytics } from "@/components/campaign-analytics"

export default async function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", id).single()

  if (!campaign) {
    notFound()
  }

  // Get clicks for this campaign
  const { data: clicks } = await supabase
    .from("clicks")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(1000)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
        <p className="text-slate-400 mt-1">Campaign analytics and performance</p>
      </div>

      <CampaignAnalytics campaign={campaign} clicks={clicks || []} />
    </div>
  )
}
