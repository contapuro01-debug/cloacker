import { Layers } from "lucide-react"

interface GhostLayerLogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
}

export function GhostLayerLogo({ size = "md", showTagline = false }: GhostLayerLogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-xl", tagline: "text-xs" },
    md: { icon: 28, text: "text-3xl", tagline: "text-sm" },
    lg: { icon: 36, text: "text-4xl", tagline: "text-base" },
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Layers className="text-primary" size={sizes[size].icon} strokeWidth={2.5} />
          <div className="absolute inset-0 blur-xl bg-primary/30" />
        </div>
        <h1 className={`${sizes[size].text} font-bold tracking-tight`}>
          <span className="text-foreground">Ghost</span>
          <span className="text-primary">Layer</span>
        </h1>
      </div>
      {showTagline && (
        <p className={`${sizes[size].tagline} text-muted-foreground font-medium tracking-wide`}>
          Proteção Invisível para Suas Campanhas
        </p>
      )}
    </div>
  )
}
