"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AccessExpiredPage() {
  const router = useRouter()

  const handleBackToLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-700 bg-slate-800/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-2xl text-white">Acesso Expirado</CardTitle>
          <CardDescription className="text-slate-400">
            Seu plano expirou. Entre em contato com o administrador para renovar seu acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 text-center">
              Para continuar usando o GhostLayer, você precisa renovar seu plano.
            </p>
          </div>
          <Button onClick={handleBackToLogin} className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00ff9d]/90">
            Voltar para Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
