"use client"

import { useState, useEffect } from "react"
import { Clock, Users, Hash, ChevronDown, Send, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusChangeModal } from "./StatusChangeModal"
import type { Emergency, Status, TriageLevel } from "@/lib/emergencies"
import { STATUS_LABELS, TRIAGE_LEVELS } from "@/lib/emergencies"

const STATUS_CLASSES: Record<Status, string> = {
  unassigned: "text-muted-foreground",
  dispatched: "text-blue-400",
  "in-progress": "text-amber-400",
  resolved: "text-emerald-400",
}

function getElapsed(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "hace unos segundos"
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  return `hace ${hrs}h ${mins % 60}m`
}

interface EmergencyCardProps {
  emergency: Emergency
  onStatusChange?: (emergencyId: string, newStatus: Status) => Promise<void>
}

const STATUSES: Status[] = ["unassigned", "dispatched", "in-progress", "resolved"]

export function EmergencyCard({ emergency, onStatusChange }: EmergencyCardProps) {
  const [status, setStatus] = useState<Status>(emergency.status)
  const [elapsed, setElapsed] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const level: TriageLevel = emergency.triageLevel || 3
  const triageMeta = TRIAGE_LEVELS[level] || TRIAGE_LEVELS[3]

  useEffect(() => {
    setElapsed(getElapsed(emergency.reportedAt))
    const id = setInterval(() => setElapsed(getElapsed(emergency.reportedAt)), 10000)
    return () => clearInterval(id)
  }, [emergency.reportedAt])

  function requestStatusChange(newStatus: Status) {
    if (newStatus === status) return
    setPendingStatus(newStatus)
  }

  async function handleConfirm(emergencyId: string, newStatus: Status) {
    const previous = status
    setStatus(newStatus)
    setPendingStatus(null)

    if (onStatusChange) {
      setIsUpdating(true)
      try {
        await onStatusChange(emergencyId, newStatus)
      } catch {
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
        className="rounded-md border border-border bg-card p-3 flex flex-col gap-2.5 shadow-sm transition-all hover:border-muted-foreground/30"
        style={{ borderLeftWidth: "4px", borderLeftColor: triageMeta.dotColor }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${triageMeta.badgeColor}`}
              >
                {triageMeta.label}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug mt-1">
              {emergency.title}
            </h3>
            <p className="text-[11px] text-muted-foreground">{emergency.location}</p>
          </div>
        </div>

        {/* Informant / DNI if available */}
        {emergency.informantName && (
          <div className="text-[11px] font-medium text-foreground/80 bg-muted/50 px-2 py-1 rounded border border-border/50">
            Informante: <span className="text-foreground">{emergency.informantName}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {emergency.description}
        </p>

        {/* Data points */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-foreground/70" />
            {emergency.affectedPeople === 0 ? "Sin afectados" : `${emergency.affectedPeople} afectados`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-foreground/70" />
            {elapsed ?? "—"}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Hash className="h-3 w-3 text-foreground/70" />
            {emergency.id}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <Button
            size="sm"
            className="h-7 gap-1.5 text-[11px] bg-red-600 hover:bg-red-700 text-white font-medium flex-1"
          >
            <Send className="h-3 w-3" />
            Despachar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-[11px]"
            onClick={() => setShowReportModal(!showReportModal)}
          >
            <FileText className="h-3 w-3 text-sky-400" />
            Reporte Agente 2
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
                    s === status ? "font-semibold text-sky-400" : ""
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
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                    }`}
                  />
                  {STATUS_LABELS[s]}
                  {s === status && (
                    <span className="ml-auto text-[9px] uppercase tracking-wide text-sky-400">
                      actual
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Formatted Report Modal / Collapse */}
        {showReportModal && (
          <div className="mt-2 p-3 bg-zinc-950 rounded-md border border-red-500/30 text-zinc-100 font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1 border-b border-zinc-800 pb-1">
              <span>REPORTE GENERADO POR AGENTE 2</span>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-200">
              {emergency.formattedReport ||
                `REPORTE DE EMERGENCIA

- Nombre y Apellido: ${emergency.informantName || "Informante Kapso"}
- Título de la Descripción: ${emergency.title}
- Categorización de Riesgo: ${triageMeta.label}
- Motivo: ${emergency.reason || "Evaluación de triaje automática"}
- Ubicación del Problema: ${emergency.location}
- Número de Afectados: ${emergency.affectedPeople}`}
            </pre>
          </div>
        )}
      </article>

      {/* Confirmation modal */}
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
