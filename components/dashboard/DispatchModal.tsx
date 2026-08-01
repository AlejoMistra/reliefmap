"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { X, Send, Radio, FileText, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Emergency, TriageLevel } from "@/lib/emergencies"
import { TRIAGE_LEVELS } from "@/lib/emergencies"

const UNITS = [
  "Alfa-01",
  "Alfa-02",
  "Bravo-01",
  "Bravo-02",
  "Charlie-01",
  "Delta-01",
  "Delta-02",
  "Bomberos E-3",
  "Bomberos E-7",
  "SAME Amb-12",
  "SAME Amb-18",
  "Defensa Civil Norte",
  "Defensa Civil Sur",
]

interface DispatchModalProps {
  emergency: Emergency
  onConfirm: (emergencyId: string, unit: string, notes: string) => Promise<void>
  onCancel: () => void
}

export function DispatchModal({ emergency, onConfirm, onCancel }: DispatchModalProps) {
  const [query, setQuery] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const level: TriageLevel = emergency.triageLevel || 3
  const triageMeta = TRIAGE_LEVELS[level]

  const filtered = query.trim()
    ? UNITS.filter((u) => u.toLowerCase().includes(query.toLowerCase()))
    : UNITS

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Signal to the rest of the page that a modal is open (used to hide Leaflet map)
  useEffect(() => {
    document.body.dataset.modalOpen = "true"
    return () => { delete document.body.dataset.modalOpen }
  }, [])

  // Escape closes modal (unless dropdown is open — then close dropdown first)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isOpen) {
          setIsOpen(false)
        } else {
          onCancel()
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onCancel])

  // Scroll active item into view
  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  function selectUnit(unit: string) {
    setSelectedUnit(unit)
    setQuery(unit)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelectedUnit("")
    setActiveIndex(0)
    setIsOpen(true)
  }

  function handleInputFocus() {
    setIsOpen(true)
    setActiveIndex(0)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setIsOpen(true)
          setActiveIndex(0)
        }
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filtered[activeIndex]) selectUnit(filtered[activeIndex])
      } else if (e.key === "Tab") {
        setIsOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, filtered, activeIndex]
  )

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
      <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-red-500 shrink-0" />
            <h2 id="dispatch-modal-title" className="text-sm font-semibold text-foreground">
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

          {/* Emergency reference */}
          <div
            className="rounded-md bg-muted/40 border border-border px-3 py-2.5"
            style={{ borderLeftWidth: "4px", borderLeftColor: triageMeta.dotColor }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${triageMeta.badgeColor}`}>
                {triageMeta.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{emergency.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{emergency.location}</p>
            <span className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              {emergency.affectedPeople === 0
                ? "Sin afectados reportados"
                : `${emergency.affectedPeople} afectado${emergency.affectedPeople !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Searchable unit selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="dispatch-unit-search"
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              <Radio className="h-3 w-3" />
              Unidad a despachar
              <span className="text-red-500 ml-0.5">*</span>
            </label>

            {/* Combobox */}
            <div className="relative">
              <div className={`flex items-center rounded-md border bg-background transition-colors ${
                isOpen ? "border-em-accent ring-1 ring-em-accent" : "border-border"
              }`}>
                <input
                  id="dispatch-unit-search"
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setIsOpen(false), 120)}
                  placeholder="Buscar unidad..."
                  className="flex-1 h-9 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                  role="combobox"
                  aria-activedescendant={isOpen ? `unit-option-${activeIndex}` : undefined}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="pr-2.5 text-muted-foreground"
                  onClick={() => { setIsOpen((v) => !v); inputRef.current?.focus() }}
                  aria-label="Abrir lista de unidades"
                >
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Dropdown list */}
              {isOpen && (
                <ul
                  ref={listRef}
                  role="listbox"
                  aria-label="Unidades disponibles"
                  className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-lg py-1"
                >
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</li>
                  ) : (
                    filtered.map((unit, i) => (
                      <li
                        key={unit}
                        id={`unit-option-${i}`}
                        role="option"
                        aria-selected={unit === selectedUnit}
                        onMouseDown={(e) => { e.preventDefault(); selectUnit(unit) }}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                          i === activeIndex
                            ? "bg-em-accent/15 text-foreground"
                            : "text-foreground/80 hover:bg-muted"
                        } ${unit === selectedUnit ? "font-semibold" : ""}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          unit === selectedUnit ? "bg-em-accent" : "bg-muted-foreground/40"
                        }`} />
                        {unit}
                        {unit === selectedUnit && (
                          <span className="ml-auto text-[9px] uppercase tracking-wide text-em-accent">sel.</span>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Selected unit confirmation pill */}
            {selectedUnit && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium">{selectedUnit}</span>
                <span className="text-muted-foreground">seleccionada</span>
              </div>
            )}
          </div>

          {/* Notes — collapsed by default for speed */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setShowNotes((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <FileText className="h-3 w-3" />
              Notas / instrucciones
              <span className="normal-case tracking-normal text-muted-foreground/50">(opcional)</span>
              {showNotes ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </button>
            {showNotes && (
              <textarea
                id="dispatch-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Acceder por Av. Libertador, precaución con tráfico en la intersección..."
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-em-accent transition-colors leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Cambia el estado a{" "}
            <span className="text-blue-400 font-semibold">Despachado</span>.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Button
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
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
