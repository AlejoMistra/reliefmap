"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Radio, ShieldAlert } from "lucide-react"

interface KPI {
  label: string
  value: number
  icon: React.ReactNode
  colorClass: string
}

const kpis: KPI[] = [
  {
    label: "Active Emergencies",
    value: 14,
    icon: <Radio className="h-4 w-4" />,
    colorClass: "text-em-critical",
  },
  {
    label: "Unassigned Reports",
    value: 6,
    icon: <AlertTriangle className="h-4 w-4" />,
    colorClass: "text-em-high",
  },
  {
    label: "Critical Priority",
    value: 3,
    icon: <ShieldAlert className="h-4 w-4" />,
    colorClass: "text-em-critical",
  },
]

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const dateStr = now
    ? now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""
  const timeStr = now
    ? now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:-- --"

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-em-critical">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-foreground uppercase">
            ReliefMap
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Emergency Operations Center
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex items-center gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-2">
            <span className={kpi.colorClass}>{kpi.icon}</span>
            <div className="text-right">
              <p className={`text-xl font-bold leading-none ${kpi.colorClass}`}>
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                {kpi.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Date / Time */}
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {timeStr}
        </p>
        <p className="text-[11px] text-muted-foreground">{dateStr}</p>
      </div>
    </header>
  )
}
