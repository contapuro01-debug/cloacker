import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignForm } from "@/components/campaign-form"
import { URLGenerator } from "@/components/url-generator"
import { CampaignUrlDisplay } from "@/components/campaign-url-display"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Editar Campanha</h1>
        <p className="text-slate-400 mt-1">Configure sua campanha de cloaking</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <CampaignForm campaign={campaign} />

        <CampaignUrlDisplay
          slug={campaign.slug}
          customDomain={campaign.custom_domain}
          campaignName={campaign.name}
          trafficSources={campaign.traffic_sources}
        />

        <URLGenerator campaigns={[campaign]} />
      </div>
    </div>
  )
}
