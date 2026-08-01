"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { AlertTriangle, Radio, ShieldAlert } from "lucide-react"
import type { EmergencyReport } from "@/lib/triage/schema"

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("failed")
    return r.json()
  })

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { data } = useSWR<{ reports: EmergencyReport[] }>(
    "/api/reports?limit=200",
    fetcher,
    { refreshInterval: 30_000 },
  )

  const reports   = data?.reports ?? []
  const active    = reports.filter((r) => r.is_active).length
  const unassigned = reports.filter((r) => r.is_active).length  // all active = unassigned from header POV
  const critical  = reports.filter((r) => r.risk_color === "RED" && r.is_active).length

  const dateStr = now
    ? now.toLocaleDateString("es-ES", {
        weekday: "short",
        month:   "short",
        day:     "numeric",
        year:    "numeric",
      })
    : ""
  const timeStr = now
    ? now.toLocaleTimeString("es-ES", {
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--"

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-em-critical">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-foreground uppercase">
            ReliefMap
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Centro de Operaciones de Emergencia
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-em-critical">
            <Radio className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-critical">
              {active}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Emergencias Activas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-em-high">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-high">
              {unassigned}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Reportes Sin Asignar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-em-critical">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-critical">
              {critical}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Prioridad Critica
            </p>
          </div>
        </div>
      </div>

      {/* Date / Time */}
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {timeStr}
        </p>
        <p className="text-[11px] text-muted-foreground">{dateStr}</p>
      </div>
    </header>
  )
}
