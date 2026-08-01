"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send, Radio, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Emergency, TriageLevel } from "@/lib/emergencies"
import { TRIAGE_LEVELS } from "@/lib/emergencies"

const UNITS = [
  "Unidad Alfa-01",
  "Unidad Alfa-02",
  "Unidad Bravo-01",
  "Unidad Bravo-02",
  "Unidad Charlie-01",
  "Unidad Delta-01",
  "Unidad Delta-02",
  "Bomberos Estación 3",
  "Bomberos Estación 7",
  "SAME — Ambulancia 12",
  "SAME — Ambulancia 18",
  "Defensa Civil Norte",
  "Defensa Civil Sur",
]

interface DispatchModalProps {
  emergency: Emergency
  onConfirm: (emergencyId: string, unit: string, notes: string) => Promise<void>
  onCancel: () => void
}

export function DispatchModal({ emergency, onConfirm, onCancel }: DispatchModalProps) {
  const [selectedUnit, setSelectedUnit] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)

  const level: TriageLevel = emergency.triageLevel || 3
  const triageMeta = TRIAGE_LEVELS[level]

  useEffect(() => {
    selectRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onCancel])

  async function handleConfirm() {
    if (!selectedUnit) return
    setIsLoading(true)
    try {
      await onConfirm(emergency.id, selectedUnit, notes.trim())
    } finally {
      setIsLoading(false)
    }
  }

  const canConfirm = selectedUnit.length > 0 && !isLoading

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card shadow-2xl mx-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-red-500 shrink-0" />
            <h2
              id="dispatch-modal-title"
              className="text-sm font-semibold text-foreground"
            >
              Despachar unidad
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

          {/* Emergency reference card */}
          <div
            className="rounded-md bg-muted/40 border border-border px-3 py-2.5"
            style={{ borderLeftWidth: "4px", borderLeftColor: triageMeta.dotColor }}
          >
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${triageMeta.badgeColor}`}
              >
                {triageMeta.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{emergency.id}</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {emergency.title}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{emergency.location}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {emergency.affectedPeople === 0
                  ? "Sin afectados reportados"
                  : `${emergency.affectedPeople} afectado${emergency.affectedPeople !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {/* Unit selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="dispatch-unit"
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              <Radio className="h-3 w-3" />
              Unidad a despachar
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              id="dispatch-unit"
              ref={selectRef}
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-em-accent transition-colors"
            >
              <option value="" disabled>
                — Seleccionar unidad —
              </option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="dispatch-notes"
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              <FileText className="h-3 w-3" />
              Instrucciones / notas de despacho
              <span className="text-muted-foreground/50 ml-1 normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              id="dispatch-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Acceder por Av. Libertador, precaución con tráfico en la intersección..."
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-em-accent transition-colors leading-relaxed"
            />
          </div>

          {/* Info note */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            El estado del reporte cambiará a{" "}
            <span className="text-blue-400 font-semibold">Despachado</span> y quedará registrado en la base de datos.
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
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white gap-1.5 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {isLoading ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Despachando…
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                Confirmar despacho
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
