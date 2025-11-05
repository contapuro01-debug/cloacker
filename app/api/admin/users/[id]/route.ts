import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    const { planType, durationDays } = body

    // Calcular nova data de expiração
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    // Atualizar plano do usuário
    const { error } = await supabase
      .from("users")
      .update({
        plan_type: planType,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceRoleClient()

    // Deletar usuário
    const { error } = await supabase.auth.admin.deleteUser(params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
