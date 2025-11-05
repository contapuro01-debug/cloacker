import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { addDomainToVercel, removeDomainFromVercel } from "@/lib/vercel-domains"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { domain } = await request.json()

    console.log("[GhostLayer] Usuário tentando adicionar domínio:", user.email, domain)

    const vercelResult = await addDomainToVercel(domain.toLowerCase())

    if (!vercelResult.success) {
      console.error("[GhostLayer] Erro do Vercel:", vercelResult.error)
      return NextResponse.json(
        {
          error: `Erro ao adicionar domínio no Vercel: ${vercelResult.error}`,
          details: vercelResult.error,
          hint: "Verifique se o VERCEL_API_TOKEN tem permissões corretas e se o VERCEL_PROJECT_ID está correto. Se o projeto pertence a uma team, configure também o VERCEL_TEAM_ID.",
        },
        { status: 400 },
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Insert domain
    const { data, error } = await supabase
      .from("domains")
      .insert({
        user_id: user.id,
        domain: domain.toLowerCase(),
        verification_token: verificationToken,
        cname_target: "ghostlayer.vercel.app",
        is_verified: vercelResult.data?.verified || false,
      })
      .select()
      .single()

    if (error) {
      await removeDomainFromVercel(domain.toLowerCase())
      console.error("[GhostLayer] Create domain error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      domain: data,
      message: "Domínio adicionado! Configure o CNAME no seu DNS e aguarde a verificação.",
    })
  } catch (error) {
    console.error("[GhostLayer] Domain API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: domains, error } = await supabase
      .from("domains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[GhostLayer] Get domains error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("[GhostLayer] Get domains API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, domain } = await request.json()

    if (domain) {
      await removeDomainFromVercel(domain)
    }

    const { error } = await supabase.from("domains").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[GhostLayer] Delete domain error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[GhostLayer] Delete domain API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
