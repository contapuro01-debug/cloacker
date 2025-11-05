// Gerador automático de UTMs para diferentes plataformas

export interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}

export interface PlatformUTMTemplate {
  name: string
  utms: UTMParams
  macros: string
  description: string
}

export const PLATFORM_UTM_TEMPLATES: Record<string, PlatformUTMTemplate> = {
  tiktok: {
    name: "TikTok Ads",
    utms: {
      utm_source: "tiktok",
      utm_medium: "cpc",
      utm_campaign: "{{campaign.name}}",
      utm_content: "{{adgroup.name}}",
      utm_term: "{{creative.id}}",
    },
    macros: "Macros TikTok: {{campaign.name}}, {{adgroup.name}}, {{creative.id}}",
    description: "Template otimizado para TikTok Ads com rastreamento de campanha, grupo de anúncios e criativo",
  },
  facebook: {
    name: "Meta Ads (Facebook/Instagram)",
    utms: {
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "{{campaign.name}}",
      utm_content: "{{adset.name}}",
      utm_term: "{{ad.name}}",
    },
    macros: "Macros Meta: {{campaign.name}}, {{adset.name}}, {{ad.name}}",
    description: "Template otimizado para Meta Ads com rastreamento completo de campanha, conjunto e anúncio",
  },
  instagram: {
    name: "Instagram Ads",
    utms: {
      utm_source: "instagram",
      utm_medium: "cpc",
      utm_campaign: "{{campaign.name}}",
      utm_content: "{{adset.name}}",
      utm_term: "{{ad.name}}",
    },
    macros: "Macros Instagram: {{campaign.name}}, {{adset.name}}, {{ad.name}}",
    description: "Template específico para Instagram Ads",
  },
  google: {
    name: "Google Ads",
    utms: {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "{campaignid}",
      utm_content: "{adgroupid}",
      utm_term: "{keyword}",
    },
    macros: "Macros Google: {campaignid}, {adgroupid}, {keyword}",
    description: "Template otimizado para Google Ads com ValueTrack parameters",
  },
  youtube: {
    name: "YouTube Ads",
    utms: {
      utm_source: "youtube",
      utm_medium: "video",
      utm_campaign: "{campaignid}",
      utm_content: "{creative}",
      utm_term: "{placement}",
    },
    macros: "Macros YouTube: {campaignid}, {creative}, {placement}",
    description: "Template para YouTube Ads com rastreamento de vídeo",
  },
  twitter: {
    name: "Twitter/X Ads",
    utms: {
      utm_source: "twitter",
      utm_medium: "cpc",
      utm_campaign: "{{campaign_name}}",
      utm_content: "{{line_item_name}}",
      utm_term: "{{creative_id}}",
    },
    macros: "Macros Twitter: {{campaign_name}}, {{line_item_name}}, {{creative_id}}",
    description: "Template para Twitter/X Ads",
  },
}

export function generateCampaignURL(baseUrl: string, slug: string, platform: string, campaignName: string): string {
  const url = new URL(`${baseUrl}/c/${slug}`)

  const template = PLATFORM_UTM_TEMPLATES[platform]
  if (!template) {
    return url.toString()
  }

  // Substituir nome da campanha nas macros
  const utms = {
    utm_source: template.utms.utm_source,
    utm_medium: template.utms.utm_medium,
    utm_campaign: template.utms.utm_campaign
      .replace("{{campaign.name}}", campaignName)
      .replace("{{campaign_name}}", campaignName),
    utm_content: template.utms.utm_content,
    utm_term: template.utms.utm_term,
  }

  // Adicionar UTMs à URL
  Object.entries(utms).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

export function generateCampaignUrl(baseUrl: string, slug: string, trafficSource: string): string {
  const url = new URL(`${baseUrl}/c/${slug}`)

  // Normalizar traffic source para lowercase
  const platform = trafficSource?.toLowerCase() || "tiktok"
  const template = PLATFORM_UTM_TEMPLATES[platform]

  if (!template) {
    // Se não houver template, retornar URL sem UTMs
    return url.toString()
  }

  // Adicionar UTMs à URL (sem substituir macros, pois serão preenchidas pela plataforma)
  Object.entries(template.utms).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

export function getDefaultPlatform(trafficSources: string[]): string {
  if (trafficSources.includes("ALL") || trafficSources.length === 0) {
    return "tiktok" // Default para TikTok
  }

  // Retornar a primeira fonte de tráfego como plataforma padrão
  const firstSource = trafficSources[0].toLowerCase()
  return PLATFORM_UTM_TEMPLATES[firstSource] ? firstSource : "tiktok"
}
