import useSWR from "swr"

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR<{ campaigns: Campaign[] }>("/api/campaigns", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000, // Cache por 5 segundos
  })

  return {
    campaigns: data?.campaigns || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCampaign(id: string) {
  const { campaigns, isLoading, isError, mutate } = useCampaigns()

  const campaign = campaigns.find((c) => c.id === id)

  return {
    campaign,
    isLoading,
    isError,
    mutate,
  }
}
