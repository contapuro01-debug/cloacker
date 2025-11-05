import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(`
        user_id,
        plan_type,
        plan_expires_at,
        is_admin,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Buscar emails dos usuários
    const userIds = subscriptions?.map((s) => s.user_id) || []
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    const users = subscriptions?.map((sub) => {
      const authUser = authUsers?.users.find((u) => u.id === sub.user_id)
      return {
        id: sub.user_id,
        email: authUser?.email || "N/A",
        plan_type: sub.plan_type,
        plan_expires_at: sub.plan_expires_at,
        is_admin: sub.is_admin,
        created_at: sub.created_at,
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    console.log("[v0] Creating user with data:", {
      email: body.email,
      planType: body.planType,
      durationDays: body.durationDays,
    })

    const { email, password, planType, durationDays } = body

    if (!email || !password || !planType || !durationDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("[v0] User created in auth:", authData.user.id)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    console.log("[v0] Inserting subscription:", {
      user_id: authData.user.id,
      plan_type: planType,
      plan_expires_at: expiresAt.toISOString(),
    })

    const { error: insertError } = await supabase.from("user_subscriptions").insert({
      user_id: authData.user.id,
      plan_type: planType,
      plan_expires_at: expiresAt.toISOString(),
      is_admin: false,
    })

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[v0] User created successfully")

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        plan_type: planType,
        plan_expires_at: expiresAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 })
  }
}
