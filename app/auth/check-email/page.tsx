import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-sm">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">Verifique seu e-mail</CardTitle>
            <CardDescription className="text-slate-400">Enviamos um link de confirmação</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 text-center">
              Por favor, verifique seu e-mail e clique no link de confirmação para ativar sua conta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
