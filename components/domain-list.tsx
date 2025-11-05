"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Copy, Trash2, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Domain {
  id: string
  domain: string
  is_verified: boolean
  verification_token: string
  cname_target: string | null
  dns_verified_at: string | null
  created_at: string
}

export function DomainList({ domains }: { domains: Domain[] }) {
  const router = useRouter()
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      const response = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.verified) {
          alert("✅ " + data.message)
        } else {
          alert("⏳ " + data.message)
        }
        router.refresh()
      }
    } catch (error) {
      console.error("[GhostLayer] Verify error:", error)
      alert("Erro ao verificar domínio. Tente novamente.")
    } finally {
      setVerifyingId(null)
    }
  }

  const handleDelete = async (id: string, domain: string) => {
    if (!confirm("Tem certeza que deseja excluir este domínio?")) return

    setDeletingId(id)
    try {
      const response = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, domain }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("[GhostLayer] Delete error:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (domains.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-400 mb-4">Nenhum domínio personalizado ainda</p>
          <p className="text-sm text-slate-500 text-center max-w-md mb-4">
            Adicione um domínio personalizado para usar seus próprios links de rastreamento em vez do domínio padrão.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {domains.map((domain) => (
        <Card key={domain.id} className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white">{domain.domain}</CardTitle>
                  {domain.is_verified ? (
                    <Badge className="bg-[#00FF94] text-black font-semibold">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 border-yellow-700">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-slate-400 mt-1">
                  Adicionado em {new Date(domain.created_at).toLocaleDateString("pt-BR")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!domain.is_verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(domain.id)}
                    disabled={verifyingId === domain.id}
                    className="border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${verifyingId === domain.id ? "animate-spin" : ""}`} />
                    Verificar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(domain.id, domain.domain)}
                  disabled={deletingId === domain.id}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-300 mb-3">Configuração DNS - Registro CNAME</p>

              <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-xs text-yellow-200 font-semibold mb-1">⚠️ IMPORTANTE:</p>
                <p className="text-xs text-yellow-300">
                  Configure o CNAME exatamente como mostrado abaixo. O destino deve ser{" "}
                  <strong>cname.vercel-dns.com</strong> (não ghostlayer.vercel.app).
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-700">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tipo</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-white font-mono">CNAME</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("CNAME", `${domain.id}-type`)}
                      className="h-6 px-2 text-slate-400 hover:text-white"
                    >
                      {copiedField === `${domain.id}-type` ? (
                        <CheckCircle2 className="h-3 w-3 text-[#00FF94]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Nome/Host</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <code className="text-sm text-white font-mono break-all">{domain.domain}</code>
                      <p className="text-xs text-slate-500 mt-1">
                        {domain.domain.split(".").length === 2
                          ? '💡 Para domínio raiz, use "@" ou deixe vazio (depende do provedor)'
                          : '💡 Use apenas o subdomínio (ex: "track" para track.seudominio.com)'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(domain.domain, `${domain.id}-name`)}
                      className="h-6 px-2 text-slate-400 hover:text-white flex-shrink-0"
                    >
                      {copiedField === `${domain.id}-name` ? (
                        <CheckCircle2 className="h-3 w-3 text-[#00FF94]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Valor/Destino</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-[#00FF94] font-mono break-all">cname.vercel-dns.com</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("cname.vercel-dns.com", `${domain.id}-value`)}
                      className="h-6 px-2 text-slate-400 hover:text-white flex-shrink-0"
                    >
                      {copiedField === `${domain.id}-value` ? (
                        <CheckCircle2 className="h-3 w-3 text-[#00FF94]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-xs text-blue-200 font-medium mb-2">📋 Passo a passo:</p>
                <ol className="text-xs text-blue-300 space-y-1.5 list-decimal list-inside">
                  <li>Acesse o painel DNS do seu provedor (Cloudflare, GoDaddy, etc.)</li>
                  <li>
                    Crie um novo registro do tipo <strong>CNAME</strong>
                  </li>
                  <li>
                    <strong>Nome/Host:</strong>{" "}
                    {domain.domain.split(".").length === 2
                      ? 'Use "@" ou deixe vazio para domínio raiz'
                      : `Use apenas "${domain.domain.split(".")[0]}" (sem o resto do domínio)`}
                  </li>
                  <li>
                    <strong>Valor/Destino:</strong> cname.vercel-dns.com
                  </li>
                  <li>Salve e aguarde propagação DNS (5min - 48h, geralmente 10-30min)</li>
                  <li>Clique em "Verificar" para confirmar</li>
                </ol>
              </div>
            </div>

            {domain.is_verified && domain.dns_verified_at && (
              <div className="flex items-center gap-2 text-sm text-[#00FF94]">
                <CheckCircle2 className="h-4 w-4" />
                Verificado em {new Date(domain.dns_verified_at).toLocaleString("pt-BR")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
