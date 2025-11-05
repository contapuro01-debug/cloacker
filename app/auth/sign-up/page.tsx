"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Traffic Cloaker</h1>
          <p className="text-slate-400">Sistema profissional de filtragem de tráfego</p>
        </div>
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Cadastrar</CardTitle>
            <CardDescription className="text-slate-400">Crie sua conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-slate-200">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João Silva"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-200">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                    minLength={6}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900/50 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <Label htmlFor="terms" className="text-sm text-slate-300 font-normal cursor-pointer">
                    Eu aceito os{" "}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      termos e condições
                    </Link>
                  </Label>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !acceptedTerms}
                >
                  {isLoading ? "Criando conta..." : "Cadastrar"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-400">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
