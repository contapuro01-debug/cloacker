import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_subscriptions").select("is_admin").eq("user_id", user.id).single(),
  ])

  const profileWithAdmin = {
    ...profile,
    is_admin: subscription?.is_admin || false,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profileWithAdmin} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
