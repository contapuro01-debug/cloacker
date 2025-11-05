import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { DetailedClicksTable } from "@/components/detailed-clicks-table"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: campaigns } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Detailed traffic analysis and insights</p>
      </div>

      <AnalyticsOverview campaigns={campaigns || []} />

      <DetailedClicksTable />
    </div>
  )
}
