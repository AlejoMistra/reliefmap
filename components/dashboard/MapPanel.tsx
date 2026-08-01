"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Map as MapIcon } from "lucide-react"

// Leaflet / react-leaflet must be loaded client-side only (no SSR)
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[oklch(0.18_0.01_240)]">
      <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase">
        Cargando mapa…
      </p>
    </div>
  ),
})

const LEGEND = [
  { label: "N1 Rojo",     colorClass: "bg-red-500" },
  { label: "N2 Naranja",  colorClass: "bg-orange-500" },
  { label: "N3 Amarillo", colorClass: "bg-amber-400" },
  { label: "N4 Verde",    colorClass: "bg-emerald-500" },
  { label: "N5 Azul",     colorClass: "bg-sky-500" },
]

export function MapPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Mapa de Emergencias en Vivo
          </span>
        </div>
        <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          En Vivo
        </span>
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <LeafletMap />
        </Suspense>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-2 flex-wrap shrink-0">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Triaje:
        </span>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${l.colorClass}`} />
            <span className="text-[11px] text-muted-foreground font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
