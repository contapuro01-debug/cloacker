import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DomainForm } from "@/components/domain-form"

export default async function NewDomainPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Adicionar Domínio Personalizado</h1>
        <p className="text-slate-400 mt-1">Conecte seu próprio domínio para links de rastreamento</p>
      </div>

      <DomainForm />
    </div>
  )
}
