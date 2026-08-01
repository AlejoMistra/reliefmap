"use client"

import { useState } from "react"
import { ListFilter, ChevronDown, X } from "lucide-react"
import { EMERGENCIES, PRIORITY_ORDER, STATUS_LABELS } from "@/lib/emergencies"
import type { Priority, Status } from "@/lib/emergencies"
import { EmergencyCard } from "./EmergencyCard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critico" },
  { value: "high", label: "Alto" },
  { value: "medium", label: "Medio" },
  { value: "low", label: "Bajo" },
]

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "unassigned", label: STATUS_LABELS.unassigned },
  { value: "dispatched", label: STATUS_LABELS.dispatched },
  { value: "in-progress", label: STATUS_LABELS["in-progress"] },
  { value: "resolved", label: STATUS_LABELS.resolved },
]

export function EmergencyFeed() {
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | null>(null)

  const filtered = [...EMERGENCIES]
    .filter((e) => (priorityFilter ? e.priority === priorityFilter : true))
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
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Por prioridad
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={`h-7 gap-1 text-[11px] px-2.5 ${
                  priorityFilter
                    ? "border-em-accent/60 bg-em-accent/10 text-em-accent hover:bg-em-accent/15"
                    : ""
                }`}
              >
                {priorityFilter
                  ? PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label
                  : "Prioridad"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
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
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={`h-7 gap-1 text-[11px] px-2.5 ${
                  statusFilter
                    ? "border-em-accent/60 bg-em-accent/10 text-em-accent hover:bg-em-accent/15"
                    : ""
                }`}
              >
                {statusFilter
                  ? STATUS_LABELS[statusFilter]
                  : "Estado"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
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
              <EmergencyCard key={emergency.id} emergency={emergency} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
