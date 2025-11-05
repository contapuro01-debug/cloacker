import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignForm } from "@/components/campaign-form"

export default async function NewCampaignPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Criar Campanha</h1>
        <p className="text-slate-400 mt-1">Configure uma nova campanha de cloaking</p>
      </div>

      <CampaignForm />
    </div>
  )
}
