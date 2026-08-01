"use client"

import { useState, useEffect } from "react"
import { ListFilter, RefreshCw, Zap } from "lucide-react"
import { EMERGENCIES, Emergency } from "@/lib/emergencies"
import { EmergencyCard } from "./EmergencyCard"

export function EmergencyFeed() {
  const [emergencies, setEmergencies] = useState<Emergency[]>(EMERGENCIES)
  const [loading, setLoading] = useState(false)

  const fetchEmergencies = async () => {
    try {
      const res = await fetch("/api/emergencies")
      if (res.ok) {
        const data = await res.json()
        if (data?.emergencies && Array.isArray(data.emergencies)) {
          setEmergencies(data.emergencies)
        }
      }
    } catch (err) {
      console.error("Error fetching live emergencies:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmergencies()
    // Poll every 3 seconds for Hackathon live presentation
    const interval = setInterval(fetchEmergencies, 3000)
    return () => clearInterval(interval)
  }, [])

  // Sort by triage level (1 to 5)
  const sorted = [...emergencies].sort((a, b) => {
    const levelA = a.triageLevel || 3
    const levelB = b.triageLevel || 3
    return levelA - levelB
  })

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Reportes Activos (Kapso + MCP)
          </span>
          <span className="rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
            {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Zap className="h-3 w-3 animate-pulse" /> Live Feed
          </span>
          <button
            onClick={() => {
              setLoading(true)
              fetchEmergencies()
            }}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Refrescar feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2.5">
          {sorted.map((emergency) => (
            <EmergencyCard key={emergency.id} emergency={emergency} />
          ))}
        </div>
      </div>
    </div>
  )
}
