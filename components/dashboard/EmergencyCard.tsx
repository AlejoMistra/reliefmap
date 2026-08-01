"use client"

import { useState, useEffect } from "react"
import { Clock, Users, Hash, ChevronDown, Send, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusChangeModal } from "./StatusChangeModal"
import type { Emergency, Priority, Status } from "@/lib/emergencies"
import { STATUS_LABELS } from "@/lib/emergencies"

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; borderStyle: string }
> = {
  critical: {
    label: "Critico",
    badgeClass: "bg-em-critical/15 text-em-critical border border-em-critical/30",
    borderStyle: "border-l-[3px] border-l-em-critical",
  },
  high: {
    label: "Alto",
    badgeClass: "bg-em-high/15 text-em-high border border-em-high/30",
    borderStyle: "border-l-[3px] border-l-em-high",
  },
  medium: {
    label: "Medio",
    badgeClass: "bg-em-medium/15 text-em-medium border border-em-medium/30",
    borderStyle: "border-l-[3px] border-l-em-medium",
  },
  low: {
    label: "Bajo",
    badgeClass: "bg-em-low/15 text-em-low border border-em-low/30",
    borderStyle: "border-l-[3px] border-l-em-low",
  },
}

const STATUS_CLASSES: Record<Status, string> = {
  unassigned: "text-muted-foreground",
  dispatched: "text-blue-400",
  "in-progress": "text-em-medium",
  resolved: "text-em-low",
}

function getElapsed(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  return `hace ${hrs}h ${mins % 60}m`
}

const STATUSES: Status[] = ["unassigned", "dispatched", "in-progress", "resolved"]

interface EmergencyCardProps {
  emergency: Emergency
  /**
   * Called after the user confirms a status change in the modal.
   * When the DB integration is ready, wire this up to your server action / API call.
   * The local optimistic update happens automatically; pass `isUpdating` to show a
   * loading state on the confirm button while the request is in flight.
   */
  onStatusChange?: (emergencyId: string, newStatus: Status) => Promise<void>
}

export function EmergencyCard({ emergency, onStatusChange }: EmergencyCardProps) {
  const [status, setStatus] = useState<Status>(emergency.status)
  const [elapsed, setElapsed] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const cfg = PRIORITY_CONFIG[emergency.priority]

  useEffect(() => {
    setElapsed(getElapsed(emergency.reportedAt))
    const id = setInterval(() => setElapsed(getElapsed(emergency.reportedAt)), 30000)
    return () => clearInterval(id)
  }, [emergency.reportedAt])

  /** Called when the user picks a new status from the dropdown */
  function requestStatusChange(newStatus: Status) {
    if (newStatus === status) return // no-op if same
    setPendingStatus(newStatus)
  }

  /** Called when the user confirms the change in the modal */
  async function handleConfirm(emergencyId: string, newStatus: Status) {
    // Optimistic local update
    const previous = status
    setStatus(newStatus)
    setPendingStatus(null)

    if (onStatusChange) {
      setIsUpdating(true)
      try {
        // TODO: replace with real DB call once integrated
        await onStatusChange(emergencyId, newStatus)
      } catch {
        // Rollback optimistic update on error
        setStatus(previous)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  function handleCancel() {
    setPendingStatus(null)
  }

  return (
    <>
      <article
        className={`rounded-md border border-border ${cfg.borderStyle} bg-card p-3 flex flex-col gap-2.5`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug mt-0.5">
              {emergency.title}
            </h3>
            <p className="text-[11px] text-muted-foreground">{emergency.location}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {emergency.description}
        </p>

        {/* Data points */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {emergency.affectedPeople === 0
              ? "Sin afectados"
              : `${emergency.affectedPeople} afectados`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {elapsed ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {emergency.id}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            size="sm"
            className="h-7 gap-1.5 text-[11px] bg-em-accent text-white hover:bg-em-accent/85 flex-1"
          >
            <Send className="h-3 w-3" />
            Despachar
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11px]">
            <Eye className="h-3 w-3" />
            Detalles
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Estado"
              )}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs min-w-[140px]">
              {STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  className={`text-xs cursor-pointer flex items-center gap-2 ${
                    s === status ? "font-semibold text-em-accent" : ""
                  }`}
                  onClick={() => requestStatusChange(s)}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      s === "unassigned"
                        ? "bg-muted-foreground"
                        : s === "dispatched"
                          ? "bg-blue-400"
                          : s === "in-progress"
                            ? "bg-em-medium"
                            : "bg-em-low"
                    }`}
                  />
                  {STATUS_LABELS[s]}
                  {s === status && (
                    <span className="ml-auto text-[9px] uppercase tracking-wide text-em-accent">
                      actual
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>

      {/* Confirmation modal — rendered outside the article to avoid z-index issues */}
      {pendingStatus !== null && (
        <StatusChangeModal
          emergencyId={emergency.id}
          emergencyTitle={emergency.title}
          currentStatus={status}
          nextStatus={pendingStatus}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isUpdating}
        />
      )}
    </>
  )
}
