"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Radio,
  Phone,
  Users,
  RefreshCw,
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
  RESOURCE_STATUS_COLORS,
  RESOURCE_TYPE_COLORS,
} from "@/lib/resources"
import { ResourceFormModal } from "./ResourceFormModal"

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
  policia:       <ShieldCheck className="h-3.5 w-3.5" />,
  bomberos:      <Flame className="h-3.5 w-3.5" />,
  ambulancia:    <Ambulance className="h-3.5 w-3.5" />,
  defensa_civil: <HardHat className="h-3.5 w-3.5" />,
  rescate:       <Crosshair className="h-3.5 w-3.5" />,
  otro:          <Package className="h-3.5 w-3.5" />,
}

const STATUS_DOT: Record<ResourceStatus, string> = {
  disponible:        "bg-em-low",
  en_camino:         "bg-em-medium animate-pulse",
  en_escena:         "bg-em-high animate-pulse",
  fuera_de_servicio: "bg-muted-foreground",
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("failed")
    return r.json()
  })

const ALL_TYPES: Array<ResourceType | "all"> = [
  "all", "policia", "bomberos", "ambulancia", "defensa_civil", "rescate", "otro",
]
const ALL_STATUSES: Array<ResourceStatus | "all"> = [
  "all", "disponible", "en_camino", "en_escena", "fuera_de_servicio",
]

export function ResourcesTable() {
  const [typeFilter, setTypeFilter]     = useState<ResourceType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | "all">("all")
  const [search, setSearch]             = useState("")
  const [editTarget, setEditTarget]     = useState<Resource | null>(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const params = new URLSearchParams()
  if (typeFilter !== "all")   params.set("type", typeFilter)
  if (statusFilter !== "all") params.set("status", statusFilter)
  if (search.trim())          params.set("search", search.trim())

  const { data, mutate, isValidating } = useSWR<{ resources: Resource[] }>(
    `/api/resources?${params.toString()}`,
    fetcher,
    { refreshInterval: 30_000 },
  )

  const resources = data?.resources ?? []

  // KPI counts (always from full dataset for header)
  const { data: allData } = useSWR<{ resources: Resource[] }>("/api/resources", fetcher)
  const all = allData?.resources ?? []
  const counts = {
    disponible:        all.filter((r) => r.status === "disponible").length,
    en_camino:         all.filter((r) => r.status === "en_camino").length,
    en_escena:         all.filter((r) => r.status === "en_escena").length,
    fuera_de_servicio: all.filter((r) => r.status === "fuera_de_servicio").length,
    total:             all.length,
  }

  async function handleSave(formData: ResourceInsert) {
    if (editTarget) {
      await fetch(`/api/resources/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
    } else {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
    }
    setEditTarget(null)
    setShowCreate(false)
    mutate()
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/resources/${deleteId}`, { method: "DELETE" })
    setDeleting(false)
    setDeleteId(null)
    mutate()
  }

  async function handleStatusChange(id: string, status: ResourceStatus) {
    await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPI bar */}
      <div className="grid grid-cols-4 gap-3">
        {(["disponible", "en_camino", "en_escena", "fuera_de_servicio"] as ResourceStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              statusFilter === s
                ? "border-em-accent/60 bg-em-accent/10"
                : "border-border bg-card hover:border-border/80"
            }`}
          >
            <p className={`text-2xl font-bold tabular-nums ${
              s === "disponible" ? "text-em-low" :
              s === "en_camino"  ? "text-em-medium" :
              s === "en_escena"  ? "text-em-high" :
              "text-muted-foreground"
            }`}>
              {counts[s]}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {RESOURCE_STATUS_LABELS[s]}
            </p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recurso…"
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-em-accent focus:outline-none focus:ring-1 focus:ring-em-accent/30"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as ResourceType | "all")}
              className={`h-7 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
                typeFilter === t
                  ? "border-em-accent/60 bg-em-accent/15 text-em-accent"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "Todos" : RESOURCE_TYPE_LABELS[t as ResourceType]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="h-8 rounded-md border border-border bg-background px-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Actualizar"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex h-8 items-center gap-1.5 rounded-md bg-em-accent px-3 text-xs font-semibold text-white hover:bg-em-accent/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo recurso
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px] whitespace-nowrap">Recurso</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Tipo</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Estado</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Zona</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Contacto</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Personal</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Notas</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {resources.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted-foreground text-xs">
                  {isValidating ? "Cargando…" : "No se encontraron recursos"}
                </td>
              </tr>
            )}
            {resources.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                {/* Name */}
                <td className="px-4 py-3">
                  <span className="font-semibold text-foreground">{r.name}</span>
                </td>

                {/* Type badge */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${RESOURCE_TYPE_COLORS[r.type]}`}>
                    {TYPE_ICONS[r.type]}
                    {RESOURCE_TYPE_LABELS[r.type]}
                  </span>
                </td>

                {/* Status — inline quick-change */}
                <td className="px-4 py-3">
                  <div className="relative group">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium cursor-pointer ${RESOURCE_STATUS_COLORS[r.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[r.status]}`} />
                      {RESOURCE_STATUS_LABELS[r.status]}
                    </span>
                    {/* Dropdown on hover */}
                    <div className="absolute left-0 top-full z-20 mt-1 hidden min-w-[140px] flex-col rounded-lg border border-border bg-card shadow-xl group-hover:flex">
                      {(ALL_STATUSES.filter((s) => s !== "all") as ResourceStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(r.id, s)}
                          className={`flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-muted/40 transition-colors ${
                            r.status === s ? "text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
                          {RESOURCE_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </td>

                {/* Zone */}
                <td className="px-4 py-3 text-muted-foreground">{r.zone}</td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {r.radio_call && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Radio className="h-3 w-3 flex-shrink-0" />
                        {r.radio_call}
                      </span>
                    )}
                    {r.phone && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        {r.phone}
                      </span>
                    )}
                    {!r.radio_call && !r.phone && (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                </td>

                {/* Crew */}
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {r.crew_count}
                  </span>
                </td>

                {/* Notes */}
                <td className="px-4 py-3 max-w-[160px]">
                  <span className="truncate block text-muted-foreground" title={r.notes ?? ""}>
                    {r.notes ?? <span className="text-muted-foreground/40">—</span>}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditTarget(r)}
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      aria-label={`Editar ${r.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="rounded p-1.5 text-muted-foreground hover:text-em-critical hover:bg-em-critical/10 transition-colors"
                      aria-label={`Eliminar ${r.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary line */}
      <p className="text-[11px] text-muted-foreground text-right">
        {resources.length} de {counts.total} recursos
      </p>

      {/* Create / Edit modal */}
      {(showCreate || editTarget) && (
        <ResourceFormModal
          resource={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowCreate(false); setEditTarget(null) }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null) }}
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Eliminar recurso
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Esta acción no se puede deshacer. El recurso será eliminado permanentemente.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-em-critical px-4 py-2 text-xs font-semibold text-white hover:bg-em-critical/80 disabled:opacity-60 transition-colors"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
