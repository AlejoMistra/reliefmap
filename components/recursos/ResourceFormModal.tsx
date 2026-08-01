"use client"

import { useEffect, useRef, useState } from "react"
import {
  X,
  ShieldCheck,
  Flame,
  Ambulance,
  HardHat,
  Crosshair,
  Package,
} from "lucide-react"
import type { Resource, ResourceInsert, ResourceType, ResourceStatus } from "@/lib/resources"
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_STATUS_LABELS,
  ZONES,
} from "@/lib/resources"

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
  policia:       <ShieldCheck className="h-4 w-4" />,
  bomberos:      <Flame className="h-4 w-4" />,
  ambulancia:    <Ambulance className="h-4 w-4" />,
  defensa_civil: <HardHat className="h-4 w-4" />,
  rescate:       <Crosshair className="h-4 w-4" />,
  otro:          <Package className="h-4 w-4" />,
}

const RESOURCE_TYPES = Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]
const RESOURCE_STATUSES = Object.keys(RESOURCE_STATUS_LABELS) as ResourceStatus[]

interface Props {
  resource?: Resource | null
  onSave: (data: ResourceInsert) => Promise<void>
  onCancel: () => void
}

const EMPTY: ResourceInsert = {
  name: "",
  type: "policia",
  status: "disponible",
  zone: "Zona A1",
  radio_call: "",
  phone: "",
  crew_count: 2,
  notes: "",
}

export function ResourceFormModal({ resource, onSave, onCancel }: Props) {
  const isEdit = !!resource
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ResourceInsert>(
    resource
      ? {
          name:       resource.name,
          type:       resource.type,
          status:     resource.status,
          zone:       resource.zone,
          radio_call: resource.radio_call ?? "",
          phone:      resource.phone ?? "",
          crew_count: resource.crew_count,
          notes:      resource.notes ?? "",
        }
      : EMPTY,
  )

  useEffect(() => {
    firstFieldRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  function set<K extends keyof ResourceInsert>(key: K, value: ResourceInsert[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        radio_call: form.radio_call?.trim() || null,
        phone:      form.phone?.trim() || null,
        notes:      form.notes?.trim() || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Editar recurso" : "Nuevo recurso"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            {isEdit ? "Editar recurso" : "Nuevo recurso"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Nombre / Identificador *
            </label>
            <input
              ref={firstFieldRef}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Alfa-01, Bomberos E-7"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Tipo *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {RESOURCE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      form.type === t
                        ? "border-em-accent bg-em-accent/15 text-em-accent"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {TYPE_ICONS[t]}
                    {RESOURCE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Estado *
              </label>
              <div className="flex flex-col gap-1.5">
                {RESOURCE_STATUSES.map((s) => {
                  const dotColor = {
                    disponible:        "bg-em-low",
                    en_camino:         "bg-em-medium",
                    en_escena:         "bg-em-high",
                    fuera_de_servicio: "bg-muted-foreground",
                  }[s]
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        form.status === s
                          ? "border-em-accent bg-em-accent/15 text-em-accent"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} />
                      {RESOURCE_STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Zone + Crew */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Zona *
              </label>
              <select
                required
                value={form.zone}
                onChange={(e) => set("zone", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Personal
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.crew_count}
                onChange={(e) => set("crew_count", Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
              />
            </div>
          </div>

          {/* Radio + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Canal de radio
              </label>
              <input
                value={form.radio_call ?? ""}
                onChange={(e) => set("radio_call", e.target.value)}
                placeholder="Ej: CH-01"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Teléfono
              </label>
              <input
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Ej: 911-1001"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Notas
            </label>
            <textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Equipamiento especial, observaciones..."
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-em-accent px-5 py-2 text-xs font-semibold text-white hover:bg-em-accent/80 disabled:opacity-60 transition-colors"
            >
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear recurso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
