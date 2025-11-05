"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"

export function DomainForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [domain, setDomain] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i
    if (!domainRegex.test(domain)) {
      setError("Por favor, insira um domínio válido (ex: track.seudominio.com)")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Enviando domínio:", domain)

      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.toLowerCase() }),
      })

      console.log("[v0] Status da resposta:", response.status)

      const data = await response.json()
      console.log("[v0] Dados da resposta:", data)

      if (!response.ok) {
        const errorMessage = data.hint
          ? `${data.error}\n\n💡 Dica: ${data.hint}`
          : data.error || data.details || "Falha ao adicionar domínio"
        throw new Error(errorMessage)
      }

      alert("✅ " + (data.message || "Domínio adicionado com sucesso!"))
      router.push("/dashboard/domains")
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao adicionar domínio:", error)
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Adicionar Domínio Personalizado</CardTitle>
            <CardDescription className="text-slate-400">
              Configure seu próprio domínio para links de cloaking profissionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="domain" className="text-slate-200">
                Nome do Domínio
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="track.seudominio.com"
                required
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Use um subdomínio como track.seudominio.com ou click.seudominio.com
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#00FF94] hover:bg-[#00E67D] text-black font-semibold"
              >
                {isLoading ? "Adicionando..." : "Adicionar Domínio"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Como Configurar o CNAME</CardTitle>
          <CardDescription className="text-slate-400">
            Configure o registro DNS para apontar seu domínio para o GhostLayer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-slate-300 text-sm">
              Acesse o painel DNS do seu provedor (Cloudflare, GoDaddy, Namecheap, etc.) e adicione um registro CNAME:
            </p>

            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-400 text-xs">Tipo</Label>
                  <p className="text-white font-mono text-sm mt-1">CNAME</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("CNAME", "type")}
                  className="h-8"
                >
                  {copiedField === "type" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00FF94]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-400 text-xs">Nome / Host</Label>
                  <p className="text-white font-mono text-sm mt-1">track</p>
                  <p className="text-slate-500 text-xs">(ou seu subdomínio escolhido)</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("track", "host")}
                  className="h-8"
                >
                  {copiedField === "host" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00FF94]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-400 text-xs">Destino / Aponta Para</Label>
                  <p className="text-[#00FF94] font-mono text-sm mt-1">cname.vercel-dns.com</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("cname.vercel-dns.com", "value")}
                  className="h-8"
                >
                  {copiedField === "value" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00FF94]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div>
                <Label className="text-slate-400 text-xs">TTL</Label>
                <p className="text-white font-mono text-sm mt-1">3600 (ou automático)</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                <strong>💡 Dica:</strong> Após salvar o CNAME no seu DNS, adicione o domínio aqui. O sistema configurará
                tudo automaticamente no Vercel.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-600 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-2">
                <strong>Exemplos por provedor:</strong>
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>
                  <strong className="text-slate-400">Cloudflare:</strong> Nome: track → Destino: cname.vercel-dns.com
                </p>
                <p>
                  <strong className="text-slate-400">GoDaddy:</strong> Host: track → Points to: cname.vercel-dns.com
                </p>
                <p>
                  <strong className="text-slate-400">Namecheap:</strong> Host: track → Value: cname.vercel-dns.com
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
