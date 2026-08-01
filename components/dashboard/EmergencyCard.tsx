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
import type { Emergency, Priority, Status } from "@/lib/emergencies"
import { STATUS_LABELS } from "@/lib/emergencies"

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; borderStyle: string }
> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-em-critical/15 text-em-critical border border-em-critical/30",
    borderStyle: "border-l-[3px] border-l-em-critical",
  },
  high: {
    label: "High",
    badgeClass: "bg-em-high/15 text-em-high border border-em-high/30",
    borderStyle: "border-l-[3px] border-l-em-high",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-em-medium/15 text-em-medium border border-em-medium/30",
    borderStyle: "border-l-[3px] border-l-em-medium",
  },
  low: {
    label: "Low",
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
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

interface EmergencyCardProps {
  emergency: Emergency
}

const STATUSES: Status[] = ["unassigned", "dispatched", "in-progress", "resolved"]

export function EmergencyCard({ emergency }: EmergencyCardProps) {
  const [status, setStatus] = useState<Status>(emergency.status)
  const [elapsed, setElapsed] = useState<string | null>(null)
  const cfg = PRIORITY_CONFIG[emergency.priority]

  useEffect(() => {
    setElapsed(getElapsed(emergency.reportedAt))
    const id = setInterval(() => setElapsed(getElapsed(emergency.reportedAt)), 30000)
    return () => clearInterval(id)
  }, [emergency.reportedAt])

  return (
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
            <span className={`text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[status]}`}>
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
          {emergency.affectedPeople === 0 ? "No casualties" : `${emergency.affectedPeople} affected`}
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
          Dispatch
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-[11px]"
        >
          <Eye className="h-3 w-3" />
          Details
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px] px-2">
              Status
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            {STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                className={`text-xs ${s === status ? "font-semibold" : ""}`}
                onSelect={() => setStatus(s)}
              >
                {STATUS_LABELS[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}
