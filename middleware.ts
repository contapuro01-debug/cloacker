import { updateSession } from "@/lib/supabase/middleware"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const pathname = request.nextUrl.pathname

  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/access-expired"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/c/"))

  if (isPublicRoute) {
    return response
  }

  if (pathname.startsWith("/dashboard")) {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_expires_at, is_admin")
      .eq("user_id", user.id)
      .single()

    // Admin sempre tem acesso
    if (subscription?.is_admin) {
      return response
    }

    // Verificar se o plano está ativo
    const expiresAt = subscription?.plan_expires_at ? new Date(subscription.plan_expires_at) : null
    const hasAccess = expiresAt ? expiresAt > new Date() : false

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/access-expired", request.url))
    }
  }

  if (pathname.startsWith("/admin")) {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()

    if (!subscription?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
