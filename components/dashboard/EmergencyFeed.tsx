"use client"

import { useState, useEffect } from "react"
import { ListFilter, ChevronDown, X, RefreshCw, Zap } from "lucide-react"
import { EMERGENCIES, STATUS_LABELS, Emergency, Priority, Status } from "@/lib/emergencies"
import { EmergencyCard } from "./EmergencyCard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Nivel 1 - ROJO" },
  { value: "high", label: "Nivel 2 - NARANJA" },
  { value: "medium", label: "Nivel 3 - AMARILLO" },
  { value: "low", label: "Nivel 4 - VERDE" },
  { value: "info", label: "Nivel 5 - AZUL" },
]

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "unassigned", label: STATUS_LABELS.unassigned },
  { value: "dispatched", label: STATUS_LABELS.dispatched },
  { value: "in-progress", label: STATUS_LABELS["in-progress"] },
  { value: "resolved", label: STATUS_LABELS.resolved },
]

export function EmergencyFeed() {
  const [emergencies, setEmergencies] = useState<Emergency[]>(EMERGENCIES)
  const [loading, setLoading] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({})

  const fetchEmergencies = async () => {
    try {
      const res = await fetch("/api/emergencies")
      if (res.ok) {
        const data = await res.json()
        if (data?.emergencies && Array.isArray(data.emergencies)) {
          setEmergencies(data.emergencies)
        }
      }
    } catch (err) {
      console.error("Error fetching live emergencies:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmergencies()
    const interval = setInterval(fetchEmergencies, 3000)
    return () => clearInterval(interval)
  }, [])

  async function handleStatusChange(emergencyId: string, newStatus: Status) {
    setStatusOverrides((prev) => ({ ...prev, [emergencyId]: newStatus }))
  }

  const emergenciesWithOverrides: Emergency[] = emergencies.map((e) =>
    statusOverrides[e.id] ? { ...e, status: statusOverrides[e.id] } : e
  )

  const filtered = [...emergenciesWithOverrides]
    .filter((e) => (priorityFilter ? e.priority === priorityFilter : true))
    .filter((e) => (statusFilter ? e.status === statusFilter : true))
    .sort((a, b) => {
      const levelA = a.triageLevel || 3
      const levelB = b.triageLevel || 3
      return levelA - levelB
    })

  const hasActiveFilters = priorityFilter !== null || statusFilter !== null

  function clearFilters() {
    setPriorityFilter(null)
    setStatusFilter(null)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Panel header */}
      <div className="flex flex-col gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Reportes Activos (Kapso + MCP)
            </span>
            <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
              {filtered.length}
            </span>
            {hasActiveFilters && (
              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                Filtrado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Zap className="h-3 w-3 animate-pulse" /> Live Feed
            </span>
            <button
              onClick={() => {
                setLoading(true)
                fetchEmergencies()
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Refrescar feed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`h-7 gap-1 text-[11px] px-2.5 border rounded-md inline-flex items-center justify-center font-medium hover:bg-accent hover:text-accent-foreground ${
                priorityFilter
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15"
                  : ""
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
                    setPriorityFilter(
                      priorityFilter === opt.value ? null : opt.value
                    )
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
              className={`h-7 gap-1 text-[11px] px-2.5 border rounded-md inline-flex items-center justify-center font-medium hover:bg-accent hover:text-accent-foreground ${
                statusFilter
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15"
                  : ""
              }`}
            >
              {statusFilter
                ? STATUS_LABELS[statusFilter]
                : "Estado"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-xs">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className={`text-xs ${statusFilter === opt.value ? "font-semibold" : ""} cursor-pointer`}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === opt.value ? null : opt.value
                    )
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No hay reportes que coincidan con los filtros.
            </p>
          </div>
        ) : (
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
