"use client"

import { useState } from "react"
import useSWR from "swr"
import { ListFilter, ChevronDown, X, RefreshCw } from "lucide-react"
import { PRIORITY_ORDER, STATUS_LABELS } from "@/lib/emergencies"
import type { Priority, Status } from "@/lib/emergencies"
import { EmergencyCard } from "./EmergencyCard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { EmergencyReport, RiskColor } from "@/lib/triage/schema"
import type { Emergency } from "@/lib/emergencies"

// ── Map DB risk_color → dashboard Priority ───────────────────────────────────
const COLOR_TO_PRIORITY: Record<RiskColor, Priority> = {
  RED:    "critical",
  ORANGE: "high",
  YELLOW: "medium",
  GREEN:  "low",
  BLUE:   "low",
}

function reportToEmergency(r: EmergencyReport): Emergency {
  return {
    id:            r.id,
    title:         r.title,
    location:      r.location_text,
    description:   r.situation_summary ?? r.reason,
    priority:      COLOR_TO_PRIORITY[r.risk_color],
    affectedPeople: r.people_affected,
    reportedAt:    new Date(r.created_at),
    status:        r.is_active ? "unassigned" : "resolved",
  }
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch reports")
    return res.json()
  })

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critico" },
  { value: "high",     label: "Alto" },
  { value: "medium",   label: "Medio" },
  { value: "low",      label: "Bajo" },
]

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "unassigned",  label: STATUS_LABELS.unassigned },
  { value: "dispatched",  label: STATUS_LABELS.dispatched },
  { value: "in-progress", label: STATUS_LABELS["in-progress"] },
  { value: "resolved",    label: STATUS_LABELS.resolved },
]

export function EmergencyFeed() {
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null)
  const [statusFilter,   setStatusFilter]   = useState<Status | null>(null)

  // Map priority filter → risk_color param for the API
  const PRIORITY_TO_COLOR: Record<Priority, RiskColor> = {
    critical: "RED",
    high:     "ORANGE",
    medium:   "YELLOW",
    low:      "GREEN",
  }

  const apiUrl = priorityFilter
    ? `/api/reports?risk_color=${PRIORITY_TO_COLOR[priorityFilter]}&limit=50`
    : `/api/reports?limit=50`

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    reports: EmergencyReport[]
  }>(apiUrl, fetcher, { refreshInterval: 30_000 })

  // Local status overrides — keyed by emergency id.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({})

  async function handleStatusChange(emergencyId: string, newStatus: Status) {
    setStatusOverrides((prev) => ({ ...prev, [emergencyId]: newStatus }))
  }

  const raw = data?.reports ?? []

  // Map DB rows → Emergency shape, then apply local status overrides
  const emergencies: Emergency[] = raw.map((r) => {
    const base = reportToEmergency(r)
    return statusOverrides[base.id] ? { ...base, status: statusOverrides[base.id] } : base
  })

  const filtered = [...emergencies]
    .filter((e) => (statusFilter ? e.status === statusFilter : true))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const hasActiveFilters = priorityFilter !== null || statusFilter !== null

  function clearFilters() {
    setPriorityFilter(null)
    setStatusFilter(null)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex flex-col gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Reportes Activos
            </span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {filtered.length}
            </span>
            {hasActiveFilters && (
              <span className="rounded-full bg-em-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-em-accent border border-em-accent/30">
                Filtrado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isValidating && !isLoading && (
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Por prioridad
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
                priorityFilter
                  ? "border-em-accent/60 bg-em-accent/10 text-em-accent hover:bg-em-accent/15"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {priorityFilter
                ? PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label
                : "Prioridad"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-xs">
              {PRIORITY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className={`text-xs ${priorityFilter === opt.value ? "font-semibold" : ""} cursor-pointer`}
                  onClick={() =>
                    setPriorityFilter(priorityFilter === opt.value ? null : opt.value)
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
                statusFilter
                  ? "border-em-accent/60 bg-em-accent/10 text-em-accent hover:bg-em-accent/15"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {statusFilter ? STATUS_LABELS[statusFilter] : "Estado"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-xs">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className={`text-xs ${statusFilter === opt.value ? "font-semibold" : ""} cursor-pointer`}
                  onClick={() =>
                    setStatusFilter(statusFilter === opt.value ? null : opt.value)
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}

          {/* Manual refresh */}
          <button
            className="ml-auto inline-flex h-7 items-center rounded-md px-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => mutate()}
            aria-label="Actualizar reportes"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-md border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Error al cargar reportes. Verifica la conexión.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "No hay reportes que coincidan con los filtros."
                : "No hay reportes activos."}
            </p>
          </div>
        )}

        {/* Cards */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {filtered.map((emergency) => (
              <EmergencyCard
                key={emergency.id}
                emergency={emergency}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
