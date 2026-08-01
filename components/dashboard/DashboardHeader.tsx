"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, Radio, ShieldAlert, LayoutDashboard, Boxes, LogIn, ChevronDown, User, Shield } from "lucide-react"

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("failed")
    return r.json()
  })

interface ReportStats {
  active:     number
  unassigned: number
  critical:   number
  high:       number
}

// ── UserMenu — avatar + fixed popover, login UI only (no auth logic yet) ──────
function UserMenu() {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  function handleToggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setOpen((v) => !v)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current  && !panelRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, right: coords.right }}
          className="z-[9999] min-w-[200px] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 p-1 animate-in fade-in-0 zoom-in-95"
        >
          {/* Header label */}
          <div className="px-2 py-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Sesión no iniciada
            </p>
          </div>
          <div className="-mx-1 my-1 h-px bg-border" />

          {/* Role info — decorative */}
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 opacity-50 cursor-default select-none">
            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium leading-none">Despachador</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Centro de Operaciones</p>
            </div>
          </div>

          <div className="-mx-1 my-1 h-px bg-border" />

          {/* Login action */}
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-em-accent transition-colors hover:bg-em-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => setOpen(false)}
          >
            <LogIn className="h-3.5 w-3.5 shrink-0" />
            Iniciar sesión
          </button>
        </div>
      )}
    </>
  )
}

const NAV_ITEMS = [
  { href: "/",         label: "Dashboard",  icon: LayoutDashboard },
  { href: "/recursos", label: "Recursos",   icon: Boxes },
]

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { data: stats } = useSWR<ReportStats>(
    "/api/reports/stats",
    fetcher,
    { refreshInterval: 15_000 },
  )

  const active     = stats?.active     ?? 0
  const unassigned = stats?.unassigned ?? 0
  const critical   = stats?.critical   ?? 0

  const dateStr = now
    ? now.toLocaleDateString("es-ES", {
        weekday: "short",
        month:   "short",
        day:     "numeric",
        year:    "numeric",
      })
    : ""
  const timeStr = now
    ? now.toLocaleTimeString("es-ES", {
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--"

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
            Centro de Operaciones de Emergencia
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                active
                  ? "bg-em-accent/15 text-em-accent"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* KPIs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-em-critical">
            <Radio className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-critical">
              {active}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Emergencias Activas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-em-high">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-high">
              {unassigned}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Reportes Sin Asignar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-em-critical">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div className="text-right">
            <p className="text-xl font-bold leading-none text-em-critical">
              {critical}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Prioridad Critica
            </p>
          </div>
        </div>
      </div>

      {/* Date / Time */}
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {timeStr}
        </p>
        <p className="text-[11px] text-muted-foreground">{dateStr}</p>
      </div>

      {/* Dispatcher avatar */}
      <UserMenu />
    </header>
  )
}
