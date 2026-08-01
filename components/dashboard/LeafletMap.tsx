"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import L from "leaflet"
import { AlertTriangle, MapPin, Users, X } from "lucide-react"
import type { EmergencyReport, RiskColor } from "@/lib/triage/schema"

// ── Fix default icon paths broken by webpack ─────────────────────────────────
// (react-leaflet issue: marker images aren't resolved by default)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ── Risk colour config ────────────────────────────────────────────────────────
const RISK: Record<RiskColor, { hex: string; ring: string; label: string; bg: string }> = {
  RED:    { hex: "#ef4444", ring: "ring-red-500",     label: "N1 — Crítico",   bg: "bg-red-500/10" },
  ORANGE: { hex: "#f97316", ring: "ring-orange-500",  label: "N2 — Alto",      bg: "bg-orange-500/10" },
  YELLOW: { hex: "#f59e0b", ring: "ring-amber-400",   label: "N3 — Medio",     bg: "bg-amber-400/10" },
  GREEN:  { hex: "#10b981", ring: "ring-emerald-500", label: "N4 — Bajo",      bg: "bg-emerald-500/10" },
  BLUE:   { hex: "#0ea5e9", ring: "ring-sky-500",     label: "N5 — Info",      bg: "bg-sky-500/10" },
}

// ── Build a coloured SVG DivIcon ─────────────────────────────────────────────
function makeIcon(color: RiskColor) {
  const { hex } = RISK[color]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="37">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 20 12 20S24 20.25 24 12C24 5.37 18.63 0 12 0z"
            fill="${hex}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.9"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 37],
    iconAnchor: [14, 37],
    popupAnchor: [0, -38],
  })
}

// ── Auto-fit bounds when pins change ─────────────────────────────────────────
function AutoFit({ pins }: { pins: PinReport[] }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (pins.length === 0 || fittedRef.current) return
    const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13, animate: true })
    fittedRef.current = true
  }, [pins, map])

  return null
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PinReport extends EmergencyReport {
  latitude: number
  longitude: number
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch")
    return r.json()
  })

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeafletMap() {
  const [selected, setSelected] = useState<PinReport | null>(null)

  const { data, isLoading } = useSWR<{ reports: EmergencyReport[] }>(
    "/api/reports?limit=200",
    fetcher,
    { refreshInterval: 30_000 },
  )

  const pins: PinReport[] = (data?.reports ?? []).filter(
    (r): r is PinReport => r.latitude != null && r.longitude != null,
  )

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[oklch(0.18_0.01_240)]">
          <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase">
            Cargando reportes…
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pins.length === 0 && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-2 pointer-events-none">
          <MapPin className="h-10 w-10 text-muted-foreground opacity-20" />
          <p className="text-xs text-muted-foreground opacity-50 tracking-widest uppercase">
            Sin coordenadas disponibles
          </p>
          <p className="text-[11px] text-muted-foreground opacity-30 max-w-[240px] text-center leading-snug">
            Los reportes sin latitud / longitud no aparecen en el mapa.
          </p>
        </div>
      )}

      {/* Pin count badge */}
      {pins.length > 0 && (
        <div className="absolute top-3 left-3 z-[500] rounded-full bg-card/90 border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow backdrop-blur-sm">
          {pins.length} {pins.length === 1 ? "reporte" : "reportes"} geolocalizados
        </div>
      )}

      <MapContainer
        center={[-34.6, -58.4]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark CartoDB tiles — no token required */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <ZoomControl position="topright" />
        <AutoFit pins={pins} />

        {pins.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={makeIcon(report.risk_color)}
            eventHandlers={{ click: () => setSelected(report) }}
          />
        ))}
      </MapContainer>

      {/* Custom popup card — rendered as a React overlay, not Leaflet's HTML popup */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-72 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Colour stripe + close */}
          <div
            className="flex items-start justify-between gap-2 px-3 py-2.5"
            style={{ borderBottom: `2px solid ${RISK[selected.risk_color].hex}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                {selected.title}
              </p>
              <p
                className="text-[10px] font-semibold mt-0.5"
                style={{ color: RISK[selected.risk_color].hex }}
              >
                {RISK[selected.risk_color].label}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              aria-label="Cerrar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-3 py-2.5 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                {selected.location_text}
              </p>
            </div>

            {selected.people_affected > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">
                  {selected.people_affected} personas afectadas
                </p>
              </div>
            )}

            {selected.reason && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {selected.reason}
                </p>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground/40 font-mono">
              {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
