"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, ExternalLink, Sparkles } from "lucide-react"
import { generateCampaignURL, getDefaultPlatform, PLATFORM_UTM_TEMPLATES } from "@/lib/utm-generator"

interface CampaignUrlDisplayProps {
  slug: string
  customDomain?: string | null
  campaignName: string
  trafficSources: string[]
}

export function CampaignUrlDisplay({ slug, customDomain, campaignName, trafficSources }: CampaignUrlDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [copiedWithUTM, setCopiedWithUTM] = useState(false)

  const baseUrl = customDomain ? `https://${customDomain}` : "https://ghostlayer.vercel.app"
  const simpleUrl = `${baseUrl}/c/${slug}`

  // Gerar URL com UTMs automáticas
  const platform = getDefaultPlatform(trafficSources)
  const urlWithUTMs = generateCampaignURL(baseUrl, slug, platform, campaignName)
  const platformInfo = PLATFORM_UTM_TEMPLATES[platform]

  const copyToClipboard = async (url: string, isUTM = false) => {
    await navigator.clipboard.writeText(url)
    if (isUTM) {
      setCopiedWithUTM(true)
      setTimeout(() => setCopiedWithUTM(false), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">URLs da Campanha</h3>
          <p className="text-sm text-slate-400">
            Use estas URLs em seus anúncios. O sistema detectará automaticamente bots e redirecionará o tráfego.
          </p>
        </div>

        {/* URL Simples */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">URL Base (sem UTMs)</label>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between gap-4">
              <code className="text-blue-400 font-mono text-sm break-all">{simpleUrl}</code>
              <Button
                onClick={() => copyToClipboard(simpleUrl)}
                size="sm"
                variant="outline"
                className="shrink-0 bg-transparent"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* URL com UTMs */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            URL com UTMs Profissionais ({platformInfo.name})
          </label>
          <div className="bg-slate-900 rounded-lg p-4 border border-green-700">
            <div className="flex items-center justify-between gap-4">
              <code className="text-green-400 font-mono text-sm break-all">{urlWithUTMs}</code>
              <Button
                onClick={() => copyToClipboard(urlWithUTMs, true)}
                size="sm"
                variant="outline"
                className="shrink-0 bg-transparent border-green-700"
              >
                {copiedWithUTM ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400">💡 {platformInfo.description}</p>
          <p className="text-xs text-slate-400">📊 {platformInfo.macros}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.open(simpleUrl, "_blank")} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Testar URL
          </Button>
          <Button onClick={() => window.open("/debug-campaigns", "_blank")} variant="outline" size="sm">
            Ver Debug
          </Button>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-300 font-medium mb-2">⚠️ Importante:</p>
          <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
            <li>
              A URL sempre inclui <code className="bg-blue-900/30 px-1 rounded">/c/</code> antes do slug
            </li>
            <li>Use a URL com UTMs para rastreamento avançado e alimentação inteligente do pixel</li>
            <li>O sistema preserva todos os parâmetros UTM no redirecionamento</li>
            <li>As macros serão substituídas automaticamente pela plataforma de anúncios</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
