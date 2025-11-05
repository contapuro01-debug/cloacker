"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Copy, Sparkles, X } from "lucide-react"

interface PlatformUTMTemplate {
  name: string
  description: string
  macros: string
}

const PLATFORM_INFO: Record<string, PlatformUTMTemplate> = {
  tiktok: {
    name: "TikTok Ads",
    description: "Template otimizado para TikTok Ads com rastreamento de campanha, grupo de anúncios e criativo",
    macros: "Macros TikTok: {{campaign.name}}, {{adgroup.name}}, {{creative.id}}",
  },
  facebook: {
    name: "Meta Ads (Facebook/Instagram)",
    description: "Template otimizado para Meta Ads com rastreamento completo de campanha, conjunto e anúncio",
    macros: "Macros Meta: {{campaign.name}}, {{adset.name}}, {{ad.name}}",
  },
  google: {
    name: "Google Ads",
    description: "Template otimizado para Google Ads com ValueTrack parameters",
    macros: "Macros Google: {campaignid}, {adgroupid}, {keyword}",
  },
  instagram: {
    name: "Instagram Ads",
    description: "Template específico para Instagram Ads",
    macros: "Macros Instagram: {{campaign.name}}, {{adset.name}}, {{ad.name}}",
  },
  youtube: {
    name: "YouTube Ads",
    description: "Template para YouTube Ads com rastreamento de vídeo",
    macros: "Macros YouTube: {campaignid}, {creative}, {placement}",
  },
  twitter: {
    name: "Twitter/X Ads",
    description: "Template para Twitter/X Ads",
    macros: "Macros Twitter: {{campaign_name}}, {{line_item_name}}, {{creative_id}}",
  },
}

interface Campaign {
  id?: string
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
  tags?: string[]
  group_name?: string
  offer_name?: string
  notes?: string
  meta_pixel_id?: string
  meta_access_token?: string
  tiktok_pixel_id?: string
  tiktok_access_token?: string
  google_ads_id?: string
  google_conversion_label?: string
}

interface Domain {
  id: string
  domain: string
  is_verified: boolean
}

const COUNTRIES = ["ALL", "US", "BR", "UK", "CA", "AU", "DE", "FR", "ES", "IT", "MX", "AR", "CL", "CO", "PE"]
const LANGUAGES = ["ALL", "en", "pt", "es", "fr", "de", "it"]
const DEVICES = ["ALL", "mobile", "desktop", "tablet"]
const TRAFFIC_SOURCES = ["ALL", "tiktok", "facebook", "google", "instagram", "twitter", "youtube"]

export function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedDomains, setVerifiedDomains] = useState<Domain[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [newTag, setNewTag] = useState("")

  const [formData, setFormData] = useState<Campaign>({
    name: campaign?.name || "",
    slug: campaign?.slug || "",
    safe_page_url: campaign?.safe_page_url || "",
    offer_page_url: campaign?.offer_page_url || "",
    custom_domain: campaign?.custom_domain || null,
    countries: campaign?.countries || [],
    languages: campaign?.languages || [],
    devices: campaign?.devices || [],
    traffic_sources: campaign?.traffic_sources || [],
    is_active: campaign?.is_active ?? true,
    tags: campaign?.tags || [],
    group_name: campaign?.group_name || "",
    offer_name: campaign?.offer_name || "",
    notes: campaign?.notes || "",
    meta_pixel_id: campaign?.meta_pixel_id || "",
    meta_access_token: campaign?.meta_access_token || "",
    tiktok_pixel_id: campaign?.tiktok_pixel_id || "",
    tiktok_access_token: campaign?.tiktok_access_token || "",
    google_ads_id: campaign?.google_ads_id || "",
    google_conversion_label: campaign?.google_conversion_label || "",
  })

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("/api/domains")
        if (response.ok) {
          const data = await response.json()
          const verified = data.domains?.filter((d: Domain) => d.is_verified) || []
          setVerifiedDomains(verified)
        }
      } catch (err) {
        console.error("Error fetching domains:", err)
        setVerifiedDomains([])
      }
    }
    fetchDomains()
  }, [])

  const generateSlug = () => {
    const random = Math.random().toString(36).substring(2, 10)
    setFormData({ ...formData, slug: random })
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (item === "ALL") {
      return array.includes("ALL") ? [] : ["ALL"]
    }

    const filtered = array.filter((i) => i !== "ALL")

    if (filtered.includes(item)) {
      return filtered.filter((i) => i !== item)
    }
    return [...filtered, item]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const method = campaign?.id ? "PUT" : "POST"
      const response = await fetch("/api/campaigns", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: campaign?.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Falha ao salvar campanha")
      }

      const { campaign: savedCampaign } = await response.json()

      const baseUrl = savedCampaign.custom_domain
        ? `https://${savedCampaign.custom_domain}`
        : "https://ghostlayer.vercel.app"

      const simpleUrl = `${baseUrl}/c/${savedCampaign.slug}`
      setGeneratedUrl(simpleUrl)
      setShowSuccess(true)

      setTimeout(() => {
        router.push("/dashboard/campaigns")
        router.refresh()
      }, 8000)
    } catch (err) {
      console.error("Error saving campaign:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao salvar a campanha")
    } finally {
      setIsLoading(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  if (showSuccess && generatedUrl) {
    const platform = formData.traffic_sources[0]?.toLowerCase() || "tiktok"
    const platformInfo = PLATFORM_INFO[platform] || PLATFORM_INFO.tiktok

    return (
      <div className="space-y-6">
        <Alert className="border-green-700 bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertDescription className="text-green-400 ml-2">
            <div className="space-y-4">
              <p className="font-semibold text-lg">✅ Campanha criada com sucesso!</p>

              <div className="space-y-2">
                <p className="text-sm font-medium">URL da Campanha:</p>
                <div className="flex gap-2 items-center bg-slate-900/50 p-3 rounded-lg">
                  <code className="text-white font-mono text-sm flex-1 break-all">{generatedUrl}</code>
                  <Button
                    onClick={() => copyUrl(generatedUrl)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 shrink-0"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm font-medium">Plataforma Detectada: {platformInfo.name}</p>
                </div>
                <p className="text-xs text-slate-400 mb-1">💡 {platformInfo.description}</p>
                <p className="text-xs text-slate-400">📊 {platformInfo.macros}</p>
              </div>

              <p className="text-sm text-slate-300 mt-4">Redirecionando para o dashboard em 8 segundos...</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Informações Básicas</CardTitle>
          <CardDescription className="text-slate-400">Configure os detalhes da sua campanha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-200">
              Nome da Campanha
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Minha Campanha TikTok"
              required
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug" className="text-slate-200">
              Slug da URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
                }
                placeholder="minha-campanha"
                required
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Button
                type="button"
                onClick={generateSlug}
                variant="outline"
                className="border-slate-600 text-slate-200 bg-transparent"
              >
                Gerar
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              URL da campanha:{" "}
              <code className="text-blue-400">
                {formData.custom_domain ? `https://${formData.custom_domain}` : "https://ghostlayer.vercel.app"}/c/
                {formData.slug || "slug"}
              </code>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="safe_page_url" className="text-slate-200">
              URL da Página Segura
            </Label>
            <Input
              id="safe_page_url"
              type="url"
              value={formData.safe_page_url}
              onChange={(e) => setFormData({ ...formData, safe_page_url: e.target.value })}
              placeholder="https://exemplo.com/pagina-segura"
              required
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">Bots serão redirecionados para aqui</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer_page_url" className="text-slate-200">
              URL da Página de Oferta
            </Label>
            <Input
              id="offer_page_url"
              type="url"
              value={formData.offer_page_url}
              onChange={(e) => setFormData({ ...formData, offer_page_url: e.target.value })}
              placeholder="https://exemplo.com/oferta"
              required
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">Usuários reais serão redirecionados para aqui</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="custom_domain" className="text-slate-200">
              Domínio Personalizado (Opcional)
            </Label>
            {verifiedDomains.length > 0 ? (
              <Select
                value={formData.custom_domain || "system"}
                onValueChange={(value) =>
                  setFormData({ ...formData, custom_domain: value === "system" ? null : value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Usar domínio do sistema" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="system" className="text-slate-200">
                    Usar domínio do sistema
                  </SelectItem>
                  {verifiedDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.domain} className="text-slate-200">
                      {domain.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                <p className="text-sm text-slate-400">
                  Nenhum domínio verificado.{" "}
                  <a href="/dashboard/domains" className="text-blue-400 hover:underline">
                    Adicione um domínio
                  </a>{" "}
                  primeiro.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active" className="text-slate-200">
                Status da Campanha
              </Label>
              <p className="text-xs text-slate-400">Ativar ou desativar esta campanha</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Segmentação</CardTitle>
          <CardDescription className="text-slate-400">
            Configure a filtragem de tráfego (selecione "ALL" para permitir todos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label className="text-slate-200">Países</Label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <Badge
                  key={country}
                  variant={formData.countries.includes(country) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      countries: toggleArrayItem(formData.countries, country),
                    })
                  }
                >
                  {country === "ALL" ? "Todos" : country}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {formData.countries.includes("ALL") || formData.countries.length === 0
                ? "Aceitando tráfego de todos os países"
                : `Aceitando apenas: ${formData.countries.join(", ")}`}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-200">Idiomas</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant={formData.languages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      languages: toggleArrayItem(formData.languages, lang),
                    })
                  }
                >
                  {lang === "ALL" ? "Todos" : lang}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {formData.languages.includes("ALL") || formData.languages.length === 0
                ? "Aceitando todos os idiomas"
                : `Aceitando apenas: ${formData.languages.join(", ")}`}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-200">Dispositivos</Label>
            <div className="flex flex-wrap gap-2">
              {DEVICES.map((device) => (
                <Badge
                  key={device}
                  variant={formData.devices.includes(device) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      devices: toggleArrayItem(formData.devices, device),
                    })
                  }
                >
                  {device === "ALL" ? "Todos" : device}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {formData.devices.includes("ALL") || formData.devices.length === 0
                ? "Aceitando todos os dispositivos"
                : `Aceitando apenas: ${formData.devices.join(", ")}`}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Fontes de Tráfego (define UTMs automáticas)
            </Label>
            <div className="flex flex-wrap gap-2">
              {TRAFFIC_SOURCES.map((source) => (
                <Badge
                  key={source}
                  variant={formData.traffic_sources.includes(source) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      traffic_sources: toggleArrayItem(formData.traffic_sources, source),
                    })
                  }
                >
                  {source === "ALL" ? "Todos" : source}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {formData.traffic_sources.includes("ALL") || formData.traffic_sources.length === 0
                ? "Aceitando tráfego de todas as fontes"
                : `Aceitando apenas: ${formData.traffic_sources.join(", ")}`}
            </p>
            <p className="text-xs text-blue-400">
              💡 A primeira fonte selecionada será usada para gerar UTMs profissionais automaticamente
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Organização</CardTitle>
          <CardDescription className="text-slate-400">
            Organize suas campanhas com tags, grupos e ofertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="group_name" className="text-slate-200">
              Nome do Grupo
            </Label>
            <Input
              id="group_name"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              placeholder="Ex: Campanhas TikTok Q1 2024"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer_name" className="text-slate-200">
              Nome da Oferta
            </Label>
            <Input
              id="offer_name"
              value={formData.offer_name}
              onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
              placeholder="Ex: Produto X - Promoção Verão"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-200">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Adicionar tag..."
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-slate-600 text-slate-200 bg-transparent"
              >
                Adicionar
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-blue-900/50 text-blue-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-slate-200">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações sobre esta campanha..."
              className="bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Pixels & Tracking Avançado
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure pixels para alimentar os algoritmos das plataformas de anúncios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Meta Pixel (Facebook/Instagram)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="meta_pixel_id" className="text-slate-200">
                  Pixel ID
                </Label>
                <Input
                  id="meta_pixel_id"
                  value={formData.meta_pixel_id}
                  onChange={(e) => setFormData({ ...formData, meta_pixel_id: e.target.value })}
                  placeholder="123456789012345"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meta_access_token" className="text-slate-200">
                  Access Token (Conversions API)
                </Label>
                <Input
                  id="meta_access_token"
                  type="password"
                  value={formData.meta_access_token}
                  onChange={(e) => setFormData({ ...formData, meta_access_token: e.target.value })}
                  placeholder="EAAxxxxx..."
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-200">TikTok Pixel</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="tiktok_pixel_id" className="text-slate-200">
                  Pixel ID
                </Label>
                <Input
                  id="tiktok_pixel_id"
                  value={formData.tiktok_pixel_id}
                  onChange={(e) => setFormData({ ...formData, tiktok_pixel_id: e.target.value })}
                  placeholder="C9XXXXXXXXXXXXX"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tiktok_access_token" className="text-slate-200">
                  Access Token (Events API)
                </Label>
                <Input
                  id="tiktok_access_token"
                  type="password"
                  value={formData.tiktok_access_token}
                  onChange={(e) => setFormData({ ...formData, tiktok_access_token: e.target.value })}
                  placeholder="xxxxx..."
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Google Ads</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="google_ads_id" className="text-slate-200">
                  Conversion ID
                </Label>
                <Input
                  id="google_ads_id"
                  value={formData.google_ads_id}
                  onChange={(e) => setFormData({ ...formData, google_ads_id: e.target.value })}
                  placeholder="AW-123456789"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="google_conversion_label" className="text-slate-200">
                  Conversion Label
                </Label>
                <Input
                  id="google_conversion_label"
                  value={formData.google_conversion_label}
                  onChange={(e) => setFormData({ ...formData, google_conversion_label: e.target.value })}
                  placeholder="AbCdEfGhIjKlMnOp"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <Alert className="border-blue-700 bg-blue-900/20">
            <AlertDescription className="text-blue-200 text-sm">
              💡 Os pixels serão disparados automaticamente antes do redirecionamento, alimentando os algoritmos das
              plataformas com dados de conversão para otimizar suas campanhas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Salvando..." : campaign?.id ? "Atualizar Campanha" : "Criar Campanha"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-600 text-slate-200"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
