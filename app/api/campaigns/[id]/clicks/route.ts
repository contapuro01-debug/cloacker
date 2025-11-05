import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se a campanha pertence ao usuário
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    // Buscar todos os cliques da campanha com informações detalhadas
    const { data: clicks, error } = await supabase
      .from("clicks")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar cliques:", error)
      return NextResponse.json({ error: "Erro ao buscar cliques" }, { status: 500 })
    }

    return NextResponse.json({ clicks })
  } catch (error) {
    console.error("[v0] Erro na API de cliques:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
