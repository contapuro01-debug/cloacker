"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Target, BarChart3, Globe, LogOut, Menu, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GhostLayerLogo } from "@/components/ghostlayer-logo"

interface User {
  id: string
  email?: string
}

interface Profile {
  full_name?: string
  email: string
  is_admin?: boolean
}

export function DashboardNav({ user, profile }: { user: User; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campanhas", icon: Target },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/pixels", label: "Pixels & Tracking", icon: Zap }, // Added Pixels & Tracking tab
    { href: "/dashboard/domains", label: "Domínios", icon: Globe },
  ]

  if (profile?.is_admin) {
    navItems.push({
      href: "/admin",
      label: "Admin",
      icon: LayoutDashboard,
    })
  }

  return (
    <nav className="border-b border-primary/20 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <GhostLayerLogo className="h-8 w-8" />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`gap-2 ${
                        isActive
                          ? "text-primary bg-primary/10 hover:bg-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-foreground font-medium">{profile?.full_name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.href} asChild className="text-foreground">
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
