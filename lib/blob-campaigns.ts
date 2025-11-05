import { put } from "@vercel/blob"

interface CampaignData {
  id: string
  platform: string
  campaignName: string
  destinationUrl: string
  intermediateUrl: string
  createdAt: string
  hits: number
  conversions: number
  conversionsData?: any[]
}

// In-memory store for campaigns (persists during runtime)
const campaignStore: Map<string, CampaignData> = new Map()

// Initialize from Blob on startup
export async function initializeCampaigns(): Promise<void> {
  try {
    const response = await fetch("https://blob.vercel-storage.com/campaigns-index.json", {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        campaignStore.clear()
        data.forEach((campaign) => {
          campaignStore.set(campaign.id, campaign)
        })
      }
    }
  } catch {
    // Blob file doesn't exist yet, start fresh
  }
}

export async function saveCampaignToBlob(campaign: CampaignData): Promise<void> {
  campaignStore.set(campaign.id, campaign)

  const allCampaigns = Array.from(campaignStore.values())
  await put("campaigns-index.json", JSON.stringify(allCampaigns, null, 2), {
    access: "private",
    contentType: "application/json",
  })
}

export async function getCampaignFromBlob(campaignId: string): Promise<CampaignData | null> {
  return campaignStore.get(campaignId) || null
}

export async function getAllCampaignsFromBlob(): Promise<CampaignData[]> {
  return Array.from(campaignStore.values())
}

export async function deleteCampaignFromBlob(campaignId: string): Promise<void> {
  campaignStore.delete(campaignId)
  const allCampaigns = Array.from(campaignStore.values())
  await put("campaigns-index.json", JSON.stringify(allCampaigns, null, 2), {
    access: "private",
    contentType: "application/json",
  })
}

export async function updateCampaignHits(campaignId: string): Promise<void> {
  const campaign = campaignStore.get(campaignId)
  if (campaign) {
    campaign.hits++
    await saveCampaignToBlob(campaign)
  }
}

export async function updateCampaignConversions(campaignId: string, conversionData?: any): Promise<void> {
  const campaign = campaignStore.get(campaignId)
  if (campaign) {
    campaign.conversions++
    if (conversionData) {
      if (!campaign.conversionsData) campaign.conversionsData = []
      campaign.conversionsData.push(conversionData)
    }
    await saveCampaignToBlob(campaign)
  }
}
