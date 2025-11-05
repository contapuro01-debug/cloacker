"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Zap } from "lucide-react"

interface PixelConfig {
  meta_pixel_id?: string
  meta_access_token?: string
  tiktok_pixel_id?: string
  tiktok_access_token?: string
  google_ads_id?: string
  google_conversion_label?: string
}

interface PixelConfigFormProps {
  campaignId: string
  initialConfig?: PixelConfig
  onSave?: () => void
}

export function PixelConfigForm({ campaignId, initialConfig, onSave }: PixelConfigFormProps) {
  const [config, setConfig] = useState<PixelConfig>(initialConfig || {})
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showTokens, setShowTokens] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/pixels`)
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      } catch (error) {
        console.error("[v0] Erro ao carregar configurações:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchConfig()
  }, [campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pixels`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar configurações de pixel")
      }

      setMessage({ type: "success", text: "Configurações de pixel salvas com sucesso!" })
      onSave?.()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar configurações",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Tracking Avançado - Meta Pixel
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure o Meta Pixel e Conversions API para Facebook/Instagram Ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="meta_pixel_id" className="text-slate-200">
              Meta Pixel ID
            </Label>
            <Input
              id="meta_pixel_id"
              value={config.meta_pixel_id || ""}
              onChange={(e) => setConfig({ ...config, meta_pixel_id: e.target.value })}
              placeholder="123456789012345"
              className="bg-slate-900/50 border-slate-600 text-white font-mono"
            />
            <p className="text-xs text-slate-400">
              Encontre em: Meta Events Manager → Data Sources → Seu Pixel → Settings
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta_access_token" className="text-slate-200">
              Meta Conversions API Access Token
            </Label>
            <div className="relative">
              <Input
                id="meta_access_token"
                type={showTokens ? "text" : "password"}
                value={config.meta_access_token || ""}
                onChange={(e) => setConfig({ ...config, meta_access_token: e.target.value })}
                placeholder="EAAxxxxxxxxxx..."
                className="bg-slate-900/50 border-slate-600 text-white font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Gere em: Meta Events Manager → Settings → Conversions API → Generate Access Token
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Tracking Avançado - TikTok Pixel
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure o TikTok Pixel e Events API para TikTok Ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tiktok_pixel_id" className="text-slate-200">
              TikTok Pixel ID
            </Label>
            <Input
              id="tiktok_pixel_id"
              value={config.tiktok_pixel_id || ""}
              onChange={(e) => setConfig({ ...config, tiktok_pixel_id: e.target.value })}
              placeholder="C1234567890ABCDEF"
              className="bg-slate-900/50 border-slate-600 text-white font-mono"
            />
            <p className="text-xs text-slate-400">Encontre em: TikTok Ads Manager → Assets → Events</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tiktok_access_token" className="text-slate-200">
              TikTok Events API Access Token
            </Label>
            <div className="relative">
              <Input
                id="tiktok_access_token"
                type={showTokens ? "text" : "password"}
                value={config.tiktok_access_token || ""}
                onChange={(e) => setConfig({ ...config, tiktok_access_token: e.target.value })}
                placeholder="xxxxxxxxxxxxxxxx"
                className="bg-slate-900/50 border-slate-600 text-white font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Gere em: TikTok Ads Manager → Assets → Events → Web Events → Settings
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Tracking Avançado - Google Ads
          </CardTitle>
          <CardDescription className="text-slate-400">Configure o Google Ads Conversion Tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="google_ads_id" className="text-slate-200">
              Google Ads Conversion ID
            </Label>
            <Input
              id="google_ads_id"
              value={config.google_ads_id || ""}
              onChange={(e) => setConfig({ ...config, google_ads_id: e.target.value })}
              placeholder="AW-123456789"
              className="bg-slate-900/50 border-slate-600 text-white font-mono"
            />
            <p className="text-xs text-slate-400">Encontre em: Google Ads → Tools → Conversions</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="google_conversion_label" className="text-slate-200">
              Conversion Label
            </Label>
            <Input
              id="google_conversion_label"
              value={config.google_conversion_label || ""}
              onChange={(e) => setConfig({ ...config, google_conversion_label: e.target.value })}
              placeholder="AbCdEfGhIjKlMnOp"
              className="bg-slate-900/50 border-slate-600 text-white font-mono"
            />
            <p className="text-xs text-slate-400">Label específico da ação de conversão</p>
          </div>
        </CardContent>
      </Card>

      {message && (
        <Alert
          className={message.type === "success" ? "border-green-700 bg-green-900/20" : "border-red-700 bg-red-900/20"}
        >
          <AlertDescription className={message.type === "success" ? "text-green-400" : "text-red-400"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
        {isLoading ? "Salvando..." : "Salvar Configurações de Pixel"}
      </Button>
    </form>
  )
}
