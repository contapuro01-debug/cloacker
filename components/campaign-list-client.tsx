"use client"

import { useCampaigns } from "@/lib/hooks/use-campaigns"
import { CampaignList } from "@/components/campaign-list"
import { Loader2 } from "lucide-react"

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
  created_at: string
  updated_at: string
}

export function CampaignListClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const { campaigns, isLoading } = useCampaigns()

  // Usar dados iniciais enquanto carrega
  const displayCampaigns = campaigns.length > 0 ? campaigns : initialCampaigns

  if (isLoading && initialCampaigns.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return <CampaignList campaigns={displayCampaigns} />
}
