import { createClient } from "@/lib/supabase/server"

export async function checkUserAccess() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { hasAccess: false, isAdmin: false, user: null }
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_type, plan_expires_at, is_admin")
    .eq("user_id", user.id)
    .single()

  // Admin sempre tem acesso
  if (subscription?.is_admin) {
    return { hasAccess: true, isAdmin: true, user }
  }

  // Verificar se o plano está ativo
  const now = new Date()
  const expiresAt = subscription?.plan_expires_at ? new Date(subscription.plan_expires_at) : null
  const hasAccess = expiresAt ? expiresAt > now : false

  return { hasAccess, isAdmin: false, user, expiresAt }
}
