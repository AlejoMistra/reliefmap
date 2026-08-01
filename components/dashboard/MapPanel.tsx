"use client"

import { useCallback, useRef, useState } from "react"
import useSWR from "swr"
import Map, { Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/mapbox"
import { Map as MapIcon, MapPin, X, Users, AlertTriangle } from "lucide-react"
import type { EmergencyReport, RiskColor } from "@/lib/triage/schema"

// ── Constants ────────────────────────────────────────────────────────────────

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const LEGEND = [
  { label: "N1 Rojo",     colorClass: "bg-red-500",     hex: "#ef4444" },
  { label: "N2 Naranja",  colorClass: "bg-orange-500",  hex: "#f97316" },
  { label: "N3 Amarillo", colorClass: "bg-amber-500",   hex: "#f59e0b" },
  { label: "N4 Verde",    colorClass: "bg-emerald-500", hex: "#10b981" },
  { label: "N5 Azul",     colorClass: "bg-sky-500",     hex: "#0ea5e9" },
]

const RISK_COLOR_MAP: Record<RiskColor, { hex: string; tailwind: string; label: string }> = {
  RED:    { hex: "#ef4444", tailwind: "text-red-400",     label: "N1 — Crítico" },
  ORANGE: { hex: "#f97316", tailwind: "text-orange-400",  label: "N2 — Alto" },
  YELLOW: { hex: "#f59e0b", tailwind: "text-amber-400",   label: "N3 — Medio" },
  GREEN:  { hex: "#10b981", tailwind: "text-emerald-400", label: "N4 — Bajo" },
  BLUE:   { hex: "#0ea5e9", tailwind: "text-sky-400",     label: "N5 — Info" },
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PinReport extends EmergencyReport {
  latitude: number
  longitude: number
}

// ── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch")
    return r.json()
  })

// ── Component ────────────────────────────────────────────────────────────────

export function MapPanel() {
  const mapRef = useRef<MapRef>(null)
  const [selectedPin, setSelectedPin] = useState<PinReport | null>(null)

  const { data, isLoading } = useSWR<{ reports: EmergencyReport[] }>(
    "/api/reports?limit=200",
    fetcher,
    { refreshInterval: 30_000 },
  )

  // Only show reports that have coordinates
  const pins: PinReport[] = (data?.reports ?? []).filter(
    (r): r is PinReport =>
      r.latitude != null && r.longitude != null,
  )

  const handleMarkerClick = useCallback(
    (report: PinReport) => {
      setSelectedPin(report)
      mapRef.current?.flyTo({
        center: [report.longitude, report.latitude],
        zoom: 14,
        duration: 800,
      })
    },
    [],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Mapa de Emergencias en Vivo
          </span>
          {pins.length > 0 && (
            <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
              {pins.length} geo
            </span>
          )}
        </div>
        <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          En Vivo
        </span>
      </div>

      {/* Map */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[oklch(0.18_0.01_240)]">
            <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase">
              Cargando mapa…
            </p>
          </div>
        )}

        {!isLoading && pins.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <MapIcon className="h-10 w-10 text-muted-foreground opacity-20" />
            <p className="text-xs text-muted-foreground opacity-50 tracking-widest uppercase">
              Sin coordenadas disponibles
            </p>
            <p className="text-[11px] text-muted-foreground opacity-30 max-w-[220px] text-center">
              Los reportes sin latitud/longitud no se muestran en el mapa.
            </p>
          </div>
        )}

        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: -65.0,
            latitude: -34.5,
            zoom: 4,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          attributionControl={false}
        >
          <NavigationControl position="top-right" />

          {/* Markers */}
          {pins.map((report) => {
            const colorInfo = RISK_COLOR_MAP[report.risk_color]
            return (
              <Marker
                key={report.id}
                longitude={report.longitude}
                latitude={report.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  handleMarkerClick(report)
                }}
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-125 active:scale-110"
                  title={report.title}
                >
                  <MapPin
                    className={`h-6 w-6 drop-shadow-lg ${colorInfo.tailwind}`}
                    fill="currentColor"
                    style={{ filter: `drop-shadow(0 0 4px ${colorInfo.hex}88)` }}
                  />
                </div>
              </Marker>
            )
          })}

          {/* Popup on selected pin */}
          {selectedPin && (
            <Popup
              longitude={selectedPin.longitude}
              latitude={selectedPin.latitude}
              anchor="bottom"
              offset={28}
              closeButton={false}
              onClose={() => setSelectedPin(null)}
              className="!p-0 !bg-transparent !border-0 [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-t-card"
            >
              <div className="w-64 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                {/* Header stripe */}
                <div
                  className="flex items-start justify-between gap-2 px-3 py-2"
                  style={{
                    borderBottom: `2px solid ${RISK_COLOR_MAP[selectedPin.risk_color].hex}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-tight truncate">
                      {selectedPin.title}
                    </p>
                    <p
                      className={`text-[10px] font-semibold mt-0.5 ${RISK_COLOR_MAP[selectedPin.risk_color].tailwind}`}
                    >
                      {RISK_COLOR_MAP[selectedPin.risk_color].label}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label="Cerrar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-3 py-2 flex flex-col gap-1.5">
                  {/* Location */}
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {selectedPin.location_text}
                    </p>
                  </div>

                  {/* People affected */}
                  {selectedPin.people_affected > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground">
                        {selectedPin.people_affected} personas afectadas
                      </p>
                    </div>
                  )}

                  {/* Reason */}
                  {selectedPin.reason && (
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {selectedPin.reason}
                      </p>
                    </div>
                  )}

                  {/* Coords */}
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">
                    {selectedPin.latitude.toFixed(5)}, {selectedPin.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </Popup>
          )}
        </Map>
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
