import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DomainList } from "@/components/domain-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DomainsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: domains } = await supabase.from("domains").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Domínios Personalizados</h1>
          <p className="text-slate-400 mt-1">Gerencie seus domínios de rastreamento</p>
        </div>
        <Link href="/dashboard/domains/new">
          <Button className="bg-[#00FF94] hover:bg-[#00E67D] text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Domínio
          </Button>
        </Link>
      </div>

      <DomainList domains={domains || []} />
    </div>
  )
}
