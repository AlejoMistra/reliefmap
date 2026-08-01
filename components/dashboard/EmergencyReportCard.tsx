"use client"

import { MapPin, Users, User, FileText, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseTriageReport, type TriageReport, type TriageColor } from "@/lib/parseTriageReport"

// ─── Color mapping ────────────────────────────────────────────────────────────
// Tailwind safelist: bg, text, border classes for each triage color.
// Using inline style for the badge background so Tailwind purge never strips them.
const COLOR_MAP: Record<
  TriageColor,
  {
    bg: string
    text: string
    border: string
    badgeBg: string      // hex / oklch used in style={}
    badgeText: string
    label: string
  }
> = {
  RED: {
    bg: "bg-red-950/40",
    text: "text-red-400",
    border: "border-red-500",
    badgeBg: "#ef4444",
    badgeText: "#fff",
    label: "Rojo",
  },
  ORANGE: {
    bg: "bg-orange-950/40",
    text: "text-orange-400",
    border: "border-orange-400",
    badgeBg: "#f97316",
    badgeText: "#fff",
    label: "Naranja",
  },
  YELLOW: {
    bg: "bg-yellow-950/40",
    text: "text-yellow-400",
    border: "border-yellow-400",
    badgeBg: "#eab308",
    badgeText: "#000",
    label: "Amarillo",
  },
  GREEN: {
    bg: "bg-green-950/40",
    text: "text-green-400",
    border: "border-green-500",
    badgeBg: "#22c55e",
    badgeText: "#000",
    label: "Verde",
  },
  BLUE: {
    bg: "bg-blue-950/40",
    text: "text-blue-400",
    border: "border-blue-400",
    badgeBg: "#3b82f6",
    badgeText: "#fff",
    label: "Azul",
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DataRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </span>
      <span className="text-xs text-zinc-200 leading-snug truncate" title={value}>
        {value || "—"}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface EmergencyReportCardProps {
  /** Raw multiline string from the AI triage agent */
  rawPayload: string
  /** Optionally pass a pre-parsed report instead */
  report?: TriageReport
}

export function EmergencyReportCard({ rawPayload, report: reportProp }: EmergencyReportCardProps) {
  const report = reportProp ?? parseTriageReport(rawPayload)
  const color = COLOR_MAP[report.riskColor]
  const isCritical = report.riskLevel === 1 && report.riskColor === "RED"

  return (
    <article
      className={cn(
        // Base: neutral Nordic-grey card
        "relative rounded-lg border bg-zinc-900 overflow-hidden",
        // Left accent stripe via left border
        "border-l-[3px]",
        color.border,
        // Subtle tinted background on the card body
        color.bg,
        // Critical: pulsing red ring
        isCritical && "animate-pulse ring-1 ring-red-500/60"
      )}
    >
      {/* Critical banner */}
      {isCritical && (
        <div className="flex items-center gap-1.5 bg-red-600/20 border-b border-red-500/30 px-3 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Emergencia Vital — Respuesta Inmediata
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-3">
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-zinc-50 leading-snug text-balance">
              {report.descriptionTitle || "Sin título"}
            </h3>
          </div>

          {/* Risk badge */}
          <div
            className="shrink-0 flex flex-col items-center rounded-md px-2.5 py-1.5 gap-0 leading-none"
            style={{ backgroundColor: color.badgeBg, color: color.badgeText }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              Nivel
            </span>
            <span className="text-xl font-black leading-none">
              {report.riskLevel}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {color.label}
            </span>
          </div>
        </div>

        {/* ── Reason ── */}
        <div className="flex items-start gap-2 rounded-md bg-zinc-800/60 border border-zinc-700/50 px-3 py-2">
          <Info className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", color.text)} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">
              Motivo
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {report.reason || "—"}
            </p>
          </div>
        </div>

        {/* ── 2-column grid for secondary data ── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DataRow
            icon={<User className="h-3 w-3" />}
            label="Informante"
            value={report.fullName}
          />
          <DataRow
            icon={<Users className="h-3 w-3" />}
            label="Afectados"
            value={report.affectedCount}
          />
          <DataRow
            icon={<MapPin className="h-3 w-3" />}
            label="Ubicación"
            value={report.location}
          />
          <DataRow
            icon={<FileText className="h-3 w-3" />}
            label="Clasificación"
            value={`Nivel ${report.riskLevel} — ${color.label}`}
          />
        </div>
      </div>
    </article>
  )
}
