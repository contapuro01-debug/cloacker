"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Campaign {
  id: string
  name: string
  slug: string
  custom_domain: string | null
}

const PLATFORM_TEMPLATES = {
  tiktok: {
    name: "TikTok Ads",
    utms: {
      utm_source: "tiktok",
      utm_medium: "cpc",
      utm_campaign: "{{campaign_name}}",
      utm_content: "{{ad_group}}",
      utm_term: "{{creative_id}}",
    },
    macros: "Use: {{campaign_name}}, {{ad_group}}, {{creative_id}}",
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
    macros: "Use: {{campaign.name}}, {{adset.name}}, {{ad.name}}",
  },
  google: {
    name: "Google Ads",
    utms: {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "{campaign}",
      utm_content: "{adgroup}",
      utm_term: "{keyword}",
    },
    macros: "Use: {campaign}, {adgroup}, {keyword}",
  },
  custom: {
    name: "Personalizado",
    utms: {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
    },
    macros: "",
  },
}

export function URLGenerator({ campaigns }: { campaigns: Campaign[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_TEMPLATES>("custom")
  const [utmSource, setUtmSource] = useState("")
  const [utmMedium, setUtmMedium] = useState("")
  const [utmCampaign, setUtmCampaign] = useState("")
  const [utmContent, setUtmContent] = useState("")
  const [utmTerm, setUtmTerm] = useState("")
  const [copied, setCopied] = useState(false)

  const applyPlatformTemplate = (platform: keyof typeof PLATFORM_TEMPLATES) => {
    setSelectedPlatform(platform)
    const template = PLATFORM_TEMPLATES[platform]
    setUtmSource(template.utms.utm_source)
    setUtmMedium(template.utms.utm_medium)
    setUtmCampaign(template.utms.utm_campaign)
    setUtmContent(template.utms.utm_content)
    setUtmTerm(template.utms.utm_term)
  }

  const generateURL = () => {
    if (!selectedCampaign) return ""

    const baseUrl = selectedCampaign.custom_domain
      ? `https://${selectedCampaign.custom_domain}`
      : "https://ghostlayer.vercel.app"
    const url = new URL(`${baseUrl}/c/${selectedCampaign.slug}`)

    if (utmSource) url.searchParams.set("utm_source", utmSource)
    if (utmMedium) url.searchParams.set("utm_medium", utmMedium)
    if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign)
    if (utmContent) url.searchParams.set("utm_content", utmContent)
    if (utmTerm) url.searchParams.set("utm_term", utmTerm)

    return url.toString()
  }

  const generatedURL = generateURL()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">Gerador de URL de Rastreamento</CardTitle>
        <CardDescription className="text-slate-400">
          Gere URLs com parâmetros UTM para rastreamento avançado e alimentação de pixels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-slate-200">Campanha</Label>
          <Select
            value={selectedCampaign?.id}
            onValueChange={(value) => {
              const campaign = campaigns.find((c) => c.id === value)
              setSelectedCampaign(campaign || null)
            }}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Selecione uma campanha" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id} className="text-slate-200">
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            Template de Plataforma
          </Label>
          <Select
            value={selectedPlatform}
            onValueChange={(value) => applyPlatformTemplate(value as keyof typeof PLATFORM_TEMPLATES)}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Object.entries(PLATFORM_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key} className="text-slate-200">
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {PLATFORM_TEMPLATES[selectedPlatform].macros && (
            <p className="text-xs text-slate-400">💡 {PLATFORM_TEMPLATES[selectedPlatform].macros}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="utm_source" className="text-slate-200">
              UTM Source
            </Label>
            <Input
              id="utm_source"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="tiktok"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="utm_medium" className="text-slate-200">
              UTM Medium
            </Label>
            <Input
              id="utm_medium"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="cpc"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="utm_campaign" className="text-slate-200">
              UTM Campaign
            </Label>
            <Input
              id="utm_campaign"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="summer_sale"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="utm_content" className="text-slate-200">
              UTM Content
            </Label>
            <Input
              id="utm_content"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="banner_ad"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="utm_term" className="text-slate-200">
              UTM Term
            </Label>
            <Input
              id="utm_term"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
              placeholder="running+shoes"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
        </div>

        {generatedURL && (
          <div className="space-y-2">
            <Label className="text-slate-200">URL Gerada</Label>
            <div className="flex gap-2">
              <Input
                value={generatedURL}
                readOnly
                className="bg-slate-900/50 border-slate-600 text-white font-mono text-sm"
              />
              <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              ✅ URL completa com <code className="text-green-400">/c/</code> incluído
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
