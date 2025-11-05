import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyDomainInVercel } from "@/lib/vercel-domains"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()

    // Get domain
    const { data: domain } = await supabase.from("domains").select("*").eq("id", id).eq("user_id", user.id).single()

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const vercelResult = await verifyDomainInVercel(domain.domain)

    if (vercelResult.success && vercelResult.verified) {
      await supabase
        .from("domains")
        .update({
          is_verified: true,
          dns_verified_at: new Date().toISOString(),
        })
        .eq("id", id)

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Domínio verificado com sucesso!",
      })
    }

    return NextResponse.json({
      success: true,
      verified: false,
      message: "DNS ainda não propagado. Aguarde alguns minutos e tente novamente.",
    })
  } catch (error) {
    console.error("[GhostLayer] Verify domain error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
