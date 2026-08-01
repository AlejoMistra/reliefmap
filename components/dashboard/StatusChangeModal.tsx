"use client"

import { useEffect, useRef } from "react"
import { X, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Status } from "@/lib/emergencies"
import { STATUS_LABELS } from "@/lib/emergencies"

const STATUS_COLORS: Record<Status, string> = {
  unassigned: "text-muted-foreground",
  dispatched: "text-blue-400",
  "in-progress": "text-em-medium",
  resolved: "text-em-low",
}

const STATUS_DOT: Record<Status, string> = {
  unassigned: "bg-muted-foreground",
  dispatched: "bg-blue-400",
  "in-progress": "bg-em-medium",
  resolved: "bg-em-low",
}

interface StatusChangeModalProps {
  emergencyId: string
  emergencyTitle: string
  currentStatus: Status
  nextStatus: Status
  onConfirm: (emergencyId: string, newStatus: Status) => void
  onCancel: () => void
  /** When true, shows a loading spinner on the confirm button (for when the DB call is in flight) */
  isLoading?: boolean
}

export function StatusChangeModal({
  emergencyId,
  emergencyTitle,
  currentStatus,
  nextStatus,
  onConfirm,
  onCancel,
  isLoading = false,
}: StatusChangeModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus the cancel button when modal opens
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  // Signal to the rest of the page that a modal is open (used to hide Leaflet map)
  useEffect(() => {
    document.body.dataset.modalOpen = "true"
    return () => { delete document.body.dataset.modalOpen }
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onCancel])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-em-high shrink-0 mt-px" />
            <h2
              id="status-modal-title"
              className="text-sm font-semibold text-foreground"
            >
              Confirmar cambio de estado
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Emergency reference */}
          <div className="rounded-md bg-muted/40 border border-border px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
              Reporte
            </p>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {emergencyTitle}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{emergencyId}</p>
          </div>

          {/* Status transition */}
          <div className="flex items-center justify-center gap-3">
            {/* Current */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Actual
              </span>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[currentStatus]}`} />
                <span className={`text-xs font-semibold ${STATUS_COLORS[currentStatus]}`}>
                  {STATUS_LABELS[currentStatus]}
                </span>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-4" />

            {/* Next */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Nuevo
              </span>
              <div className="flex items-center gap-1.5 rounded-full border border-em-accent/40 bg-em-accent/10 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[nextStatus]}`} />
                <span className={`text-xs font-semibold ${STATUS_COLORS[nextStatus]}`}>
                  {STATUS_LABELS[nextStatus]}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Este cambio quedará registrado en la base de datos y notificará a los operadores asignados.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button
            ref={cancelRef}
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-em-accent hover:bg-em-accent/85 text-white gap-1.5"
            onClick={() => onConfirm(emergencyId, nextStatus)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando…
              </>
            ) : (
              "Confirmar cambio"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
