import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminUsersList } from "@/components/admin-users-list"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase
    .from("user_subscriptions")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()

  if (!userData?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Painel Admin</h1>
          <p className="text-slate-400">Gerencie usuários e acessos do sistema</p>
        </div>

        <AdminUsersList />
      </div>
    </div>
  )
}
